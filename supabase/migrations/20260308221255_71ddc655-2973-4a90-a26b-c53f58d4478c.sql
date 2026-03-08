-- Function to notify matching users when a job is approved or inserted as approved
CREATE OR REPLACE FUNCTION public.notify_matching_users_on_job()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  matched_user RECORD;
  job_skills text[];
  job_title text;
  job_location text;
  job_industry text;
BEGIN
  -- Only trigger when job becomes active and approved
  IF NEW.is_active = true AND NEW.is_approved = true THEN
    -- Don't trigger on updates where it was already approved
    IF TG_OP = 'UPDATE' AND OLD.is_approved = true AND OLD.is_active = true THEN
      RETURN NEW;
    END IF;

    job_skills := COALESCE(NEW.required_skills, '{}');
    job_title := NEW.title;
    job_location := COALESCE(NEW.location, '');
    job_industry := COALESCE(NEW.industry, '');

    -- Find users whose skills match the job's required skills
    -- or whose career interests match the job's industry
    FOR matched_user IN
      SELECT DISTINCT p.user_id
      FROM profiles p
      WHERE p.user_id != (SELECT e.user_id FROM employers e WHERE e.id = NEW.employer_id)
        AND (
          -- Match by skills
          EXISTS (
            SELECT 1 FROM user_skills us
            JOIN skills s ON s.id = us.skill_id
            WHERE us.user_id = p.user_id
              AND s.name = ANY(job_skills)
          )
          -- Match by career interests
          OR (
            p.career_interests IS NOT NULL
            AND job_industry != ''
            AND job_industry = ANY(p.career_interests)
          )
          -- Match by location
          OR (
            p.location IS NOT NULL
            AND p.location != ''
            AND LOWER(p.location) = LOWER(job_location)
          )
        )
    LOOP
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (
        matched_user.user_id,
        '🎯 New Job Match: ' || job_title,
        'A new job matching your profile was just posted: ' || job_title || CASE WHEN job_location != '' THEN ' in ' || job_location ELSE '' END,
        'job_alert',
        '/jobs/' || NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on insert and update of jobs
CREATE TRIGGER trigger_notify_matching_users
  AFTER INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_matching_users_on_job();
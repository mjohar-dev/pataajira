-- Create trigger to call the notification function when jobs are inserted or updated
CREATE TRIGGER on_job_notify_users
  AFTER INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_matching_users_on_job();
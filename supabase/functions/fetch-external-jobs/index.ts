import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExternalJob {
  source: string;
  source_id: string;
  title: string;
  company: string;
  company_logo?: string;
  location?: string;
  type?: string;
  industry?: string;
  skills?: string[];
  salary?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  deadline?: string;
  posted_date?: string | number;
  remote?: boolean;
  apply_url?: string;
}

// Converts many formats to ISO string. Returns null when invalid.
function toISODate(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 2_000_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getUTCFullYear();
    if (y < 1970 || y > 2100) return null;
    return d.toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d{9,16}$/.test(trimmed)) {
      return toISODate(Number(trimmed));
    }
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getUTCFullYear();
    if (y < 1970 || y > 2100) return null;
    return d.toISOString();
  }

  return null;
}

// Scrape jobs from BrighterMonday Kenya using Firecrawl
async function scrapeBrighterMondayGraduate(apiKey: string): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];

  try {
    console.log('Scraping BrighterMonday Kenya (Graduate Trainee)...');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.brightermonday.co.ke/jobs/graduate-trainee',
        formats: ['markdown', 'links'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (data.success && data.data?.markdown) {
      const markdown = data.data.markdown;
      const links = data.data.links || [];

      // Extract job listings - look for job title patterns
      const lines = markdown.split('\n');
      let currentJob: Partial<ExternalJob> | null = null;

      for (const line of lines) {
        // Skip navigation/UI elements
        if (line.includes('Share link') || line.includes('Filter') || line.includes('Sort by')) continue;

        // Look for job titles (usually in headers or bold)
        const titleMatch = line.match(/^(?:###?\s*)?(?:\*\*)?([A-Z][^*\n]{5,80})(?:\*\*)?$/);
        if (titleMatch) {
          const potentialTitle = titleMatch[1].trim();
          // Filter out non-job titles
          if (potentialTitle.includes('Trainee') || potentialTitle.includes('Intern') ||
              potentialTitle.includes('Graduate') || potentialTitle.includes('Entry') ||
              potentialTitle.includes('Junior') || potentialTitle.includes('Assistant')) {

            if (currentJob?.title) {
              jobs.push(currentJob as ExternalJob);
            }

            currentJob = {
              source: 'brightermonday',
              source_id: `bm-grad-${Date.now()}-${jobs.length}`,
              title: potentialTitle.substring(0, 100),
              company: 'Company in Kenya',
              location: 'Nairobi',
              type: potentialTitle.toLowerCase().includes('intern') ? 'internship' : 'trainee',
              industry: 'Various',
              remote: false,
            };
          }
        }

        // Extract company name
        if (currentJob && !currentJob.company?.includes('Company')) {
          const companyMatch = line.match(/(?:at|by|@)\s+([A-Z][a-zA-Z\s&]+(?:Ltd|Limited|PLC|Inc|Company|Corp|Kenya)?)/i);
          if (companyMatch) {
            currentJob.company = companyMatch[1].trim();
          }
        }

        // Extract location
        const locationMatch = line.match(/\b(Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika|Machakos|Nyeri|Kakamega|Kenya)\b/i);
        if (currentJob && locationMatch) {
          currentJob.location = locationMatch[1];
        }

        // Extract salary
        const salaryMatch = line.match(/KES\s*[\d,]+(?:\s*-\s*KES\s*[\d,]+)?/i);
        if (currentJob && salaryMatch) {
          currentJob.salary = salaryMatch[0];
        }
      }

      // Add last job if exists
      if (currentJob?.title) {
        jobs.push(currentJob as ExternalJob);
      }

      // Get apply URLs from links
      const jobLinks = links.filter((l: string) => l.includes('/job/') || l.includes('/jobs/'));
      jobs.forEach((job, i) => {
        if (jobLinks[i]) {
          job.apply_url = jobLinks[i];
        }
      });
    }
  } catch (error) {
    console.error('BrighterMonday graduate scrape error:', error);
  }

  return jobs.slice(0, 15);
}

// Scrape BrighterMonday Internships
async function scrapeBrighterMondayInternships(apiKey: string): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];

  try {
    console.log('Scraping BrighterMonday Kenya (Internships)...');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.brightermonday.co.ke/jobs/internships-volunteering',
        formats: ['markdown', 'links'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (data.success && data.data?.markdown) {
      const markdown = data.data.markdown;
      const links = data.data.links || [];

      const lines = markdown.split('\n');
      let currentJob: Partial<ExternalJob> | null = null;

      for (const line of lines) {
        if (line.includes('Share link') || line.includes('Filter') || line.includes('Sort by')) continue;

        const titleMatch = line.match(/^(?:###?\s*)?(?:\*\*)?([A-Z][^*\n]{5,80})(?:\*\*)?$/);
        if (titleMatch) {
          const potentialTitle = titleMatch[1].trim();
          if (potentialTitle.includes('Intern') || potentialTitle.includes('Attachment') ||
              potentialTitle.includes('Volunteer') || potentialTitle.includes('Graduate') ||
              potentialTitle.includes('Trainee')) {

            if (currentJob?.title) {
              jobs.push(currentJob as ExternalJob);
            }

            currentJob = {
              source: 'brightermonday',
              source_id: `bm-intern-${Date.now()}-${jobs.length}`,
              title: potentialTitle.substring(0, 100),
              company: 'Company in Kenya',
              location: 'Nairobi',
              type: 'internship',
              industry: 'Various',
              remote: false,
            };
          }
        }

        const companyMatch = line.match(/(?:at|by|@)\s+([A-Z][a-zA-Z\s&]+(?:Ltd|Limited|PLC|Inc|Company|Corp|Kenya)?)/i);
        if (currentJob && companyMatch) {
          currentJob.company = companyMatch[1].trim();
        }

        const locationMatch = line.match(/\b(Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika|Machakos|Nyeri|Kakamega|Kenya)\b/i);
        if (currentJob && locationMatch) {
          currentJob.location = locationMatch[1];
        }

        const salaryMatch = line.match(/KES\s*[\d,]+(?:\s*-\s*KES\s*[\d,]+)?/i);
        if (currentJob && salaryMatch) {
          currentJob.salary = salaryMatch[0];
        }
      }

      if (currentJob?.title) {
        jobs.push(currentJob as ExternalJob);
      }

      const jobLinks = links.filter((l: string) => l.includes('/job/') || l.includes('/jobs/'));
      jobs.forEach((job, i) => {
        if (jobLinks[i]) {
          job.apply_url = jobLinks[i];
        }
      });
    }
  } catch (error) {
    console.error('BrighterMonday internships scrape error:', error);
  }

  return jobs.slice(0, 15);
}

// Search for Kenya jobs using Firecrawl search
async function searchKenyaJobs(apiKey: string): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];

  try {
    console.log('Searching for Kenya entry-level jobs...');

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'graduate trainee internship jobs Kenya Nairobi 2026',
        limit: 10,
        lang: 'en',
        country: 'KE',
        tbs: 'qdr:w', // Last week
      }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      for (let i = 0; i < data.data.length; i++) {
        const result = data.data[i];
        if (result.title && result.url) {
          // Filter for relevant job sites
          if (result.url.includes('brightermonday') || result.url.includes('myjobmag') ||
              result.url.includes('corporatestaffing') || result.url.includes('fuzu') ||
              result.url.includes('linkedin.com/jobs')) {

            jobs.push({
              source: 'firecrawl-search',
              source_id: `fcs-${Date.now()}-${i}`,
              title: result.title.substring(0, 100),
              company: 'Company in Kenya',
              location: 'Kenya',
              type: result.title.toLowerCase().includes('intern') ? 'internship' : 'entry-level',
              industry: 'Various',
              description: result.description?.substring(0, 500),
              remote: false,
              apply_url: result.url,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Firecrawl search error:', error);
  }

  return jobs;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const allJobs: ExternalJob[] = [];

    if (!firecrawlKey) {
      console.log('FIRECRAWL_API_KEY not configured, skipping external job fetch');
      return new Response(
        JSON.stringify({ success: true, fetched: 0, message: 'Firecrawl not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from Kenya-focused sources in parallel
    const [graduateJobs, internshipJobs, searchJobs] = await Promise.all([
      scrapeBrighterMondayGraduate(firecrawlKey),
      scrapeBrighterMondayInternships(firecrawlKey),
      searchKenyaJobs(firecrawlKey),
    ]);

    allJobs.push(...graduateJobs, ...internshipJobs, ...searchJobs);

    console.log(`Fetched ${allJobs.length} Kenya jobs total`);

    // Upsert jobs to database
    if (allJobs.length > 0) {
      const rows = allJobs.map((job) => {
        const postedDateIso = toISODate(job.posted_date);

        const row: Record<string, unknown> = {
          ...job,
          fetched_at: new Date().toISOString(),
          is_active: true,
        };

        if (postedDateIso) row.posted_date = postedDateIso;
        else delete row.posted_date;

        return row;
      });

      const { error } = await supabase
        .from('external_jobs')
        .upsert(rows, { onConflict: 'source,source_id', ignoreDuplicates: false });

      if (error) {
        console.error('Database upsert error:', error);
        throw error;
      }
    }

    // Mark old jobs as inactive (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await supabase
      .from('external_jobs')
      .update({ is_active: false })
      .lt('fetched_at', sevenDaysAgo.toISOString());

    return new Response(
      JSON.stringify({
        success: true,
        fetched: allJobs.length,
        sources: {
          brightermonday_graduate: graduateJobs.length,
          brightermonday_internships: internshipJobs.length,
          firecrawl_search: searchJobs.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
  posted_date?: string;
  remote?: boolean;
  apply_url?: string;
}

// Scrape jobs from BrighterMonday Kenya using Firecrawl
async function scrapeBrighterMonday(apiKey: string): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];
  
  try {
    console.log('Scraping BrighterMonday Kenya...');
    
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
      // Parse job listings from markdown
      const markdown = data.data.markdown;
      const links = data.data.links || [];
      
      // Extract job patterns from markdown
      const jobPatterns = markdown.split(/\n(?=###|\*\*[A-Z])/).filter((section: string) => 
        section.includes('KES') || section.includes('Trainee') || section.includes('Internship') || section.includes('Graduate')
      );
      
      for (let i = 0; i < Math.min(jobPatterns.length, 10); i++) {
        const section = jobPatterns[i];
        const titleMatch = section.match(/(?:###\s*)?(?:\*\*)?([^*\n]+?)(?:\*\*)?(?:\n|$)/);
        const companyMatch = section.match(/(?:at|by|@)\s+([^|\n]+)/i) || section.match(/([A-Z][a-zA-Z\s&]+(?:Ltd|Limited|PLC|Inc|Company|Corp)?)/);
        const locationMatch = section.match(/(?:Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Kenya|Remote)/i);
        const salaryMatch = section.match(/KES\s*[\d,]+(?:\s*-\s*KES\s*[\d,]+)?/i);
        
        if (titleMatch) {
          jobs.push({
            source: 'brightermonday',
            source_id: `bm-${Date.now()}-${i}`,
            title: titleMatch[1].trim().substring(0, 100),
            company: companyMatch?.[1]?.trim() || 'Company in Kenya',
            location: locationMatch?.[0] || 'Nairobi',
            type: section.toLowerCase().includes('intern') ? 'internship' : 
                  section.toLowerCase().includes('trainee') ? 'trainee' : 'entry-level',
            industry: 'Various',
            salary: salaryMatch?.[0],
            description: section.substring(0, 500),
            remote: section.toLowerCase().includes('remote'),
            apply_url: links.find((l: string) => l.includes('brightermonday'))
          });
        }
      }
    }
  } catch (error) {
    console.error('BrighterMonday scrape error:', error);
  }
  
  return jobs;
}

// Fetch jobs from RemoteOK API (free, no key needed)
async function fetchRemoteOKJobs(): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];
  
  try {
    console.log('Fetching from RemoteOK...');
    
    const response = await fetch('https://remoteok.com/api?tag=junior', {
      headers: { 'User-Agent': 'PataAjira/1.0' }
    });
    
    const data = await response.json();
    
    // RemoteOK returns array, first item is metadata
    const jobListings = data.slice(1, 11);
    
    for (const job of jobListings) {
      if (job.position && job.company) {
        jobs.push({
          source: 'remoteok',
          source_id: `rok-${job.id || Date.now()}`,
          title: job.position,
          company: job.company,
          company_logo: job.company_logo,
          location: job.location || 'Remote',
          type: 'entry-level',
          industry: 'Technology',
          skills: job.tags || [],
          salary: job.salary_min && job.salary_max ? 
            `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` : undefined,
          description: job.description?.substring(0, 1000),
          remote: true,
          apply_url: job.url,
          posted_date: job.date
        });
      }
    }
  } catch (error) {
    console.error('RemoteOK fetch error:', error);
  }
  
  return jobs;
}

// Fetch from Arbeitnow API (free entry-level jobs)
async function fetchArbeitnowJobs(): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];
  
  try {
    console.log('Fetching from Arbeitnow...');
    
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api?page=1');
    const data = await response.json();
    
    const entryLevelJobs = (data.data || [])
      .filter((job: any) => 
        job.title?.toLowerCase().includes('junior') ||
        job.title?.toLowerCase().includes('intern') ||
        job.title?.toLowerCase().includes('trainee') ||
        job.title?.toLowerCase().includes('entry')
      )
      .slice(0, 10);
    
    for (const job of entryLevelJobs) {
      jobs.push({
        source: 'arbeitnow',
        source_id: `anow-${job.slug || Date.now()}`,
        title: job.title,
        company: job.company_name,
        location: job.location || 'Remote',
        type: job.title?.toLowerCase().includes('intern') ? 'internship' : 'entry-level',
        industry: 'Technology',
        skills: job.tags || [],
        description: job.description?.substring(0, 1000),
        remote: job.remote || false,
        apply_url: job.url,
        posted_date: job.created_at
      });
    }
  } catch (error) {
    console.error('Arbeitnow fetch error:', error);
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
    
    // Fetch from all sources in parallel
    const [brighterMondayJobs, remoteOKJobs, arbeitnowJobs] = await Promise.all([
      firecrawlKey ? scrapeBrighterMonday(firecrawlKey) : Promise.resolve([]),
      fetchRemoteOKJobs(),
      fetchArbeitnowJobs()
    ]);
    
    allJobs.push(...brighterMondayJobs, ...remoteOKJobs, ...arbeitnowJobs);
    
    console.log(`Fetched ${allJobs.length} jobs total`);
    
    // Upsert jobs to database
    if (allJobs.length > 0) {
      const { error } = await supabase
        .from('external_jobs')
        .upsert(
          allJobs.map(job => ({
            ...job,
            fetched_at: new Date().toISOString(),
            is_active: true
          })),
          { onConflict: 'source,source_id', ignoreDuplicates: false }
        );
      
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
          brightermonday: brighterMondayJobs.length,
          remoteok: remoteOKJobs.length,
          arbeitnow: arbeitnowJobs.length
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

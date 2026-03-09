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

// Junk titles to filter out
const JUNK_PATTERNS = [
  /^position overview/i,
  /^share link/i,
  /^filter/i,
  /^sort by/i,
  /^search/i,
  /^menu/i,
  /^home/i,
  /^about/i,
  /^contact/i,
  /^privacy/i,
  /^terms/i,
  /^login/i,
  /^sign/i,
  /^register/i,
  /^apply now/i,
  /^view more/i,
  /^load more/i,
  /^page \d/i,
  /^next/i,
  /^prev/i,
  /^back/i,
  /^\d+ jobs?/i,
  /^showing/i,
  /^results/i,
];

function isValidJobTitle(title: string): boolean {
  if (!title || title.length < 5 || title.length > 120) return false;
  const lower = title.toLowerCase();
  
  // Must contain job-related keywords
  const hasJobKeyword = 
    lower.includes('intern') || lower.includes('trainee') || 
    lower.includes('graduate') || lower.includes('entry') ||
    lower.includes('junior') || lower.includes('assistant') ||
    lower.includes('analyst') || lower.includes('engineer') ||
    lower.includes('developer') || lower.includes('officer') ||
    lower.includes('executive') || lower.includes('associate') ||
    lower.includes('specialist') || lower.includes('coordinator') ||
    lower.includes('manager') || lower.includes('accountant') ||
    lower.includes('consultant') || lower.includes('designer');
  
  if (!hasJobKeyword) return false;
  
  // Check against junk patterns
  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(title)) return false;
  }
  
  return true;
}

// Scrape MyJobMag Kenya
async function scrapeMyJobMag(apiKey: string): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];

  try {
    console.log('Scraping MyJobMag Kenya...');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.myjobmag.co.ke/jobs/graduate-trainee-jobs',
        formats: ['markdown', 'links'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (data.success && data.data?.markdown) {
      const markdown = data.data.markdown;
      const links = data.data.links || [];

      // Extract job info using line patterns
      const lines = markdown.split('\n').filter((l: string) => l.trim());
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for job title patterns (usually bold or header)
        const titleMatch = line.match(/^(?:\*\*|###?\s*)?([\w\s\-\/&]+(?:Intern|Trainee|Graduate|Entry|Junior|Assistant|Analyst|Engineer|Developer|Officer|Executive|Associate)[\w\s\-\/&]*)(?:\*\*)?$/i);
        
        if (titleMatch && isValidJobTitle(titleMatch[1])) {
          const title = titleMatch[1].trim();
          
          // Look for company in nearby lines
          let company = 'Company in Kenya';
          let location = 'Nairobi';
          let applyUrl = '';
          
          // Check next few lines for company/location
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const nextLine = lines[j].trim();
            
            // Company patterns
            const companyMatch = nextLine.match(/^(?:\*\*)?([A-Z][a-zA-Z\s&]+(?:Ltd|Limited|PLC|Inc|Company|Corp|Bank|Group|Kenya|Africa)?)(?:\*\*)?$/i);
            if (companyMatch && companyMatch[1].length > 3 && companyMatch[1].length < 50) {
              company = companyMatch[1].trim();
            }
            
            // Location patterns
            const locMatch = nextLine.match(/\b(Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika|Kenya|Remote)\b/i);
            if (locMatch) {
              location = locMatch[1];
            }
          }
          
          // Find apply URL from links
          const jobLink = links.find((l: string) => 
            (l.includes('/job/') || l.includes('/jobs/')) && 
            l.toLowerCase().includes(title.split(' ')[0].toLowerCase())
          );
          applyUrl = jobLink || `https://www.myjobmag.co.ke/jobs/graduate-trainee-jobs`;
          
          jobs.push({
            source: 'myjobmag',
            source_id: `mjm-${Date.now()}-${jobs.length}`,
            title: title.substring(0, 100),
            company,
            location,
            type: title.toLowerCase().includes('intern') ? 'internship' : 'trainee',
            industry: 'Various',
            remote: location.toLowerCase() === 'remote',
            apply_url: applyUrl,
          });
        }
      }
    }
  } catch (error) {
    console.error('MyJobMag scrape error:', error);
  }

  return jobs.slice(0, 20);
}

// Scrape BrighterMonday Kenya with improved parsing
async function scrapeBrighterMonday(apiKey: string, category: string): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];
  const url = category === 'internships' 
    ? 'https://www.brightermonday.co.ke/jobs/internships-volunteering'
    : 'https://www.brightermonday.co.ke/jobs/graduate-trainee';

  try {
    console.log(`Scraping BrighterMonday Kenya (${category})...`);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'links'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (data.success && data.data?.markdown) {
      const markdown = data.data.markdown;
      const links = data.data.links || [];
      
      // Get job page links (these have better patterns)
      const jobLinks = links.filter((l: string) => 
        l.includes('brightermonday.co.ke/job/') || 
        l.includes('brightermonday.co.ke/jobs/') && l.includes('-')
      );

      // Parse job listings - look for structured patterns
      const jobBlocks = markdown.split(/(?=###?\s|\*\*[A-Z])/);
      
      for (const block of jobBlocks) {
        const lines = block.split('\n').map((l: string) => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;
        
        // First non-empty line might be title
        let title = lines[0].replace(/^[#*\s]+|[#*\s]+$/g, '');
        
        if (!isValidJobTitle(title)) continue;
        
        let company = 'Company in Kenya';
        let location = 'Nairobi';
        let salary = '';
        
        // Parse rest of block for details
        for (const line of lines.slice(1)) {
          const cleanLine = line.replace(/[*#]/g, '').trim();
          
          // Company (usually follows title)
          if (!company.includes('Company') && cleanLine.length < 50 && /^[A-Z]/.test(cleanLine)) {
            const potentialCompany = cleanLine.replace(/^\s*at\s+/i, '');
            if (potentialCompany.length > 2 && !JUNK_PATTERNS.some(p => p.test(potentialCompany))) {
              company = potentialCompany;
            }
          }
          
          // Location
          const locMatch = cleanLine.match(/\b(Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika|Machakos|Kenya|Remote)\b/i);
          if (locMatch) location = locMatch[1];
          
          // Salary
          const salaryMatch = cleanLine.match(/KES\s*[\d,]+(?:\s*-\s*KES\s*[\d,]+)?/i);
          if (salaryMatch) salary = salaryMatch[0];
        }
        
        // Find matching apply URL
        const applyUrl = jobLinks.find((l: string) => {
          const titleWords = title.toLowerCase().split(/\s+/).slice(0, 3);
          return titleWords.some(w => w.length > 3 && l.toLowerCase().includes(w));
        }) || url;
        
        jobs.push({
          source: 'brightermonday',
          source_id: `bm-${category}-${Date.now()}-${jobs.length}`,
          title: title.substring(0, 100),
          company,
          location,
          type: category === 'internships' ? 'internship' : 'trainee',
          industry: 'Various',
          salary: salary || undefined,
          remote: location.toLowerCase() === 'remote',
          apply_url: applyUrl,
        });
      }
    }
  } catch (error) {
    console.error(`BrighterMonday ${category} scrape error:`, error);
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
        query: 'graduate trainee internship jobs Kenya Nairobi 2026 hiring',
        limit: 15,
        lang: 'en',
        country: 'KE',
        tbs: 'qdr:w', // Last week
      }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      for (let i = 0; i < data.data.length; i++) {
        const result = data.data[i];
        if (!result.title || !result.url) continue;
        
        // Filter for relevant job sites only
        const isJobSite = 
          result.url.includes('brightermonday') || 
          result.url.includes('myjobmag') ||
          result.url.includes('corporatestaffing') || 
          result.url.includes('fuzu') ||
          result.url.includes('linkedin.com/jobs') ||
          result.url.includes('indeed.com');
        
        if (!isJobSite) continue;
        
        // Extract job title from search result
        let title = result.title
          .replace(/\s*\|.*$/, '') // Remove site name after |
          .replace(/\s*-\s*[A-Z].*$/, '') // Remove company/site after -
          .replace(/\s*\(.*\)$/, '') // Remove parenthetical
          .trim();
        
        if (!isValidJobTitle(title) && !title.match(/jobs?|hiring|career/i)) continue;
        
        // Skip if title looks like a category page
        if (title.match(/^\d+\s*(jobs?|results)/i)) continue;

        jobs.push({
          source: 'firecrawl-search',
          source_id: `fcs-${Date.now()}-${i}`,
          title: title.substring(0, 100),
          company: 'Company in Kenya',
          location: 'Kenya',
          type: title.toLowerCase().includes('intern') ? 'internship' : 'entry-level',
          industry: 'Various',
          description: result.description?.substring(0, 500),
          remote: false,
          apply_url: result.url,
        });
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

    if (!firecrawlKey) {
      console.log('FIRECRAWL_API_KEY not configured, skipping external job fetch');
      return new Response(
        JSON.stringify({ success: true, fetched: 0, message: 'Firecrawl not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from multiple Kenya-focused sources in parallel
    const [graduateJobs, internshipJobs, myJobMagJobs, searchJobs] = await Promise.all([
      scrapeBrighterMonday(firecrawlKey, 'graduate'),
      scrapeBrighterMonday(firecrawlKey, 'internships'),
      scrapeMyJobMag(firecrawlKey),
      searchKenyaJobs(firecrawlKey),
    ]);

    const allJobs = [...graduateJobs, ...internshipJobs, ...myJobMagJobs, ...searchJobs];
    
    // Deduplicate by title similarity
    const uniqueJobs: ExternalJob[] = [];
    const seenTitles = new Set<string>();
    
    for (const job of allJobs) {
      const normalizedTitle = job.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueJobs.push(job);
      }
    }

    console.log(`Fetched ${uniqueJobs.length} unique Kenya jobs total`);

    // Upsert jobs to database
    if (uniqueJobs.length > 0) {
      const rows = uniqueJobs.map((job) => ({
        ...job,
        posted_date: new Date().toISOString(),
        fetched_at: new Date().toISOString(),
        is_active: true,
      }));

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
        fetched: uniqueJobs.length,
        sources: {
          brightermonday_graduate: graduateJobs.length,
          brightermonday_internships: internshipJobs.length,
          myjobmag: myJobMagJobs.length,
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

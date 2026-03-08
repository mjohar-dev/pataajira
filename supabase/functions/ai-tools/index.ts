import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { type } = body;

    // Input length validation
    const maxInputLength = 50000;
    const inputText = JSON.stringify(body);
    if (inputText.length > maxInputLength) {
      return new Response(JSON.stringify({ error: "Input too large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let messages: { role: string; content: string }[] = [];

    switch (type) {
      case "resume-optimize": {
        const { resumeText, jobDescription } = body;
        messages = [
          { role: "system", content: `You are an expert career coach and resume optimizer for Kenyan graduates. Analyze the resume against the job description and provide:\n1. **Match Score** (0-100%)\n2. **Strengths** - What aligns well\n3. **Improvements** - Specific suggestions\n4. **Optimized Summary** - A rewritten professional summary\n5. **Keywords Missing** - Important keywords from the job description\n\nBe specific, actionable, and encouraging. Format using markdown.` },
          { role: "user", content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}` },
        ];
        break;
      }

      case "cover-letter": {
        const { resumeText, jobDescription } = body;
        messages = [
          { role: "system", content: `You are a professional cover letter writer for Kenyan graduates. Write a compelling, personalized cover letter that:\n- Is professionally formatted\n- Highlights relevant experience and skills\n- Shows enthusiasm for the role\n- Is concise (under 400 words)\n- Uses a warm but professional tone\nFormat the letter properly with date, greeting, body paragraphs, and sign-off.` },
          { role: "user", content: `${resumeText ? `My Background:\n${resumeText}\n\n` : ""}Job Description:\n${jobDescription}` },
        ];
        break;
      }

      case "interview-practice": {
        const { messages: chatMessages } = body;
        messages = [
          { role: "system", content: `You are an experienced interview coach for Kenyan graduates. Your role is to:\n1. Ask realistic interview questions based on the role they mention\n2. After each answer, provide constructive feedback using the STAR method\n3. Score their answer (1-10) and explain why\n4. Suggest improved answers when appropriate\n5. Mix behavioral, technical, and situational questions\n6. Be encouraging but honest. Keep responses concise.` },
          ...chatMessages,
        ];
        break;
      }

      case "skill-gap": {
        const { currentSkills, targetRole } = body;
        messages = [
          { role: "system", content: `You are a career advisor specializing in the Kenyan job market. Analyze the skill gap and provide:\n1. **Skills You Have** that are relevant\n2. **Skills You Need** to acquire\n3. **Priority Ranking** of skills to learn\n4. **Learning Resources** for each skill (free courses, certifications)\n5. **Timeline** - Suggested learning path\n6. **Market Insight** - How these skills are valued in the Kenyan market\n\nBe specific and practical. Format using markdown.` },
          { role: "user", content: `My current skills: ${currentSkills || "None specified"}\n\nTarget role: ${targetRole}` },
        ];
        break;
      }

      case "github-analyze": {
        const { username, repoSummary } = body;
        messages = [
          { role: "system", content: `You are a technical recruiter and portfolio analyst. Analyze this developer's GitHub profile and provide:\n1. **Technical Strengths** - Primary technologies and expertise areas\n2. **Portfolio Quality Score** (0-100)\n3. **Notable Projects** - Which repos stand out and why\n4. **Areas for Improvement** - What's missing for a competitive portfolio\n5. **Career Recommendations** - What roles this developer is best suited for\n6. **Tips** - Specific actions to improve their GitHub presence\n\nBe encouraging but honest. Format using markdown.` },
          { role: "user", content: `GitHub username: ${username}\n\nRepositories:\n${repoSummary}` },
        ];
        break;
      }

      case "rank-candidates": {
        const { jobTitle, jobSkills, applicantSummaries } = body;
        messages = [
          { role: "system", content: `You are an AI recruitment assistant. Rank the following candidates for the position based on their fit. For each candidate provide:\n- A match score from 0-100\n- Brief reasoning\n\nIMPORTANT: Keep the exact applicant ID format in your response like "Applicant N (ID: xxx)" and include "Score: XX" for each.\n\nBe fair and objective. Consider education, skills alignment, and potential.` },
          { role: "user", content: `Job: ${jobTitle}\nRequired Skills: ${jobSkills}\n\nCandidates:\n${applicantSummaries}` },
        ];
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response generated";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI tools error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

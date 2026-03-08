import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { type } = body;

    let messages: { role: string; content: string }[] = [];

    switch (type) {
      case "resume-optimize": {
        const { resumeText, jobDescription } = body;
        messages = [
          {
            role: "system",
            content: `You are an expert career coach and resume optimizer for Kenyan graduates. Analyze the resume against the job description and provide:
1. **Match Score** (0-100%)
2. **Strengths** - What aligns well
3. **Improvements** - Specific suggestions to improve the resume
4. **Optimized Summary** - A rewritten professional summary
5. **Keywords Missing** - Important keywords from the job description not in the resume

Be specific, actionable, and encouraging. Format using markdown.`
          },
          { role: "user", content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}` },
        ];
        break;
      }

      case "cover-letter": {
        const { resumeText, jobDescription } = body;
        messages = [
          {
            role: "system",
            content: `You are a professional cover letter writer for Kenyan graduates. Write a compelling, personalized cover letter that:
- Is professionally formatted
- Highlights relevant experience and skills
- Shows enthusiasm for the role
- Is concise (under 400 words)
- Uses a warm but professional tone
Format the letter properly with date, greeting, body paragraphs, and sign-off.`
          },
          { role: "user", content: `${resumeText ? `My Background:\n${resumeText}\n\n` : ""}Job Description:\n${jobDescription}` },
        ];
        break;
      }

      case "interview-practice": {
        const { messages: chatMessages } = body;
        messages = [
          {
            role: "system",
            content: `You are an experienced interview coach for Kenyan graduates. Your role is to:
1. Ask realistic interview questions based on the role they mention
2. After each answer, provide constructive feedback using the STAR method
3. Score their answer (1-10) and explain why
4. Suggest improved answers when appropriate
5. Mix behavioral, technical, and situational questions
6. Be encouraging but honest. Keep responses concise.`
          },
          ...chatMessages,
        ];
        break;
      }

      case "skill-gap": {
        const { currentSkills, targetRole } = body;
        messages = [
          {
            role: "system",
            content: `You are a career advisor specializing in the Kenyan job market. Analyze the skill gap and provide:
1. **Skills You Have** that are relevant
2. **Skills You Need** to acquire
3. **Priority Ranking** of skills to learn
4. **Learning Resources** for each skill (free courses, certifications)
5. **Timeline** - Suggested learning path
6. **Market Insight** - How these skills are valued in the Kenyan market

Be specific and practical. Format using markdown.`
          },
          { role: "user", content: `My current skills: ${currentSkills || "None specified"}\n\nTarget role: ${targetRole}` },
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
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in your workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Supabase Edge Function for secure Gemini AI blog generation
// This keeps the API key server-side and prevents client exposure

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the request is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client to verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the user to ensure they're authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin or nutritionist role
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin', 'nutritionist'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { topic, type } = await req.json()

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Gemini API key from secrets (stored in Supabase Dashboard)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured in Edge Function secrets')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let prompt: string

    if (type === 'seo') {
      // Generate SEO elements
      prompt = `Based on this blog topic/content, generate SEO elements in JSON format:

Topic/Content:
${topic.substring(0, 1000)}...

Generate a JSON object with these fields:
{
  "title": "Compelling blog title (50-60 characters)",
  "metaTitle": "SEO-optimized meta title (50-60 characters)",
  "metaDescription": "Engaging meta description (150-160 characters)",
  "slug": "url-friendly-slug",
  "excerpt": "Brief excerpt (150-200 characters)",
  "focusKeyword": "main keyword phrase",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Return ONLY the JSON object, no other text.`
    } else {
      // Generate blog content
      prompt = `Write a comprehensive, engaging blog post about "${topic}" for a health and wellness website called GreenoFig. The blog should be:

- Professional yet conversational
- 1500-2000 words
- Well-structured with clear headings (use HTML tags: h2, h3)
- Include actionable tips and advice
- Use bullet points and lists where appropriate
- Include a compelling introduction and conclusion
- SEO-friendly
- Written in HTML format

Write only the blog content, starting with an h2 heading. Do not include a title or meta information.`
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: type === 'seo' ? 0.5 : 0.7,
            maxOutputTokens: type === 'seo' ? 500 : 4096,
          }
        })
      }
    )

    const data = await response.json()

    if (data.candidates && data.candidates[0]) {
      const content = data.candidates[0].content.parts[0].text

      if (type === 'seo') {
        // Parse JSON for SEO response
        try {
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/)
          const seoData = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content)
          return new Response(
            JSON.stringify({ success: true, data: seoData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch {
          return new Response(
            JSON.stringify({ error: 'Failed to parse SEO data' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({ success: true, content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'No content generated' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

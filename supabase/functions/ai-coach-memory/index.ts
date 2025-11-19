import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

serve(async (req) => {
  // SECURITY: Configure CORS properly - only allow your domain in production
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://xdzoikocriuvgkoenjqk.supabase.co',
    // Add your production domain here when deployed
  ];

  const origin = req.headers.get('origin');
  const isAllowedOrigin = allowedOrigins.includes(origin || '');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  try {
    // SECURITY: Verify authentication token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, userProfile, language, languageInstructions } = await req.json()

    // SECURITY: Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with user's JWT token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader }
      }
    })

    // Get active AI provider settings
    const { data: settings, error: settingsError } = await supabase
      .from('ai_coach_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (settingsError || !settings) {
      throw new Error('No active AI provider configured')
    }

    const { provider, api_key, model_name, temperature, max_tokens, system_prompt, api_endpoint } = settings

    // Use language-specific system prompt if provided, otherwise use database system_prompt
    const activeSystemPrompt = languageInstructions?.systemPrompt || userProfile?.systemPrompt || system_prompt

    // Build conversation history
    let reply = ''

    // Call the appropriate AI provider
    switch (provider) {
      case 'gemini':
        reply = await callGemini(messages, userProfile, api_key, model_name, temperature, max_tokens, activeSystemPrompt)
        break

      case 'openai':
        reply = await callOpenAI(messages, userProfile, api_key, model_name, temperature, max_tokens, activeSystemPrompt)
        break

      case 'claude':
        reply = await callClaude(messages, userProfile, api_key, model_name, temperature, max_tokens, activeSystemPrompt)
        break

      case 'custom':
        reply = await callCustom(messages, userProfile, api_key, api_endpoint, temperature, max_tokens, activeSystemPrompt)
        break

      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        }
      }
    )
  } catch (error) {
    // SECURITY: Don't expose internal error details to client
    console.error('Error:', error)
    const origin = req.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://xdzoikocriuvgkoenjqk.supabase.co',
    ];
    const isAllowedOrigin = allowedOrigins.includes(origin || '');

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        reply: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment. 😊"
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        }
      }
    )
  }
})

// Gemini API handler
async function callGemini(
  messages: any[],
  userProfile: any,
  apiKey: string,
  modelName: string,
  temperature: number,
  maxTokens: number,
  systemPrompt: string
): Promise<string> {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`

  // Build conversation history for Gemini
  const conversationHistory = messages.map((m: any) => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }))

  // Build system prompt with user info
  const fullSystemPrompt = `${systemPrompt}\n\nUser Information:\n- Name: ${userProfile?.full_name || 'Friend'}\n- Role: ${userProfile?.role || 'user'}`

  const geminiRequest = {
    contents: conversationHistory,
    systemInstruction: {
      parts: [{ text: fullSystemPrompt }]
    },
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
    }
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geminiRequest),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('Gemini API error:', errorData)
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble responding right now."
}

// OpenAI API handler
async function callOpenAI(
  messages: any[],
  userProfile: any,
  apiKey: string,
  modelName: string,
  temperature: number,
  maxTokens: number,
  systemPrompt: string
): Promise<string> {
  // Build conversation messages for OpenAI
  const conversationMessages = messages.map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text
  }))

  // Add system prompt
  const fullSystemPrompt = `${systemPrompt}\n\nUser Information:\n- Name: ${userProfile?.full_name || 'Friend'}\n- Role: ${userProfile?.role || 'user'}`

  const openAIRequest = {
    model: modelName || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: fullSystemPrompt },
      ...conversationMessages
    ],
    temperature: temperature,
    max_tokens: maxTokens,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(openAIRequest),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('OpenAI API error:', errorData)
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "I'm having trouble responding right now."
}

// Claude API handler
async function callClaude(
  messages: any[],
  userProfile: any,
  apiKey: string,
  modelName: string,
  temperature: number,
  maxTokens: number,
  systemPrompt: string
): Promise<string> {
  // Build conversation messages for Claude
  const conversationMessages = messages.map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text
  }))

  // Add system prompt
  const fullSystemPrompt = `${systemPrompt}\n\nUser Information:\n- Name: ${userProfile?.full_name || 'Friend'}\n- Role: ${userProfile?.role || 'user'}`

  const claudeRequest = {
    model: modelName || 'claude-3-haiku-20240307',
    max_tokens: maxTokens,
    temperature: temperature,
    system: fullSystemPrompt,
    messages: conversationMessages,
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(claudeRequest),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('Claude API error:', errorData)
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || "I'm having trouble responding right now."
}

// Custom API handler (for other providers)
async function callCustom(
  messages: any[],
  userProfile: any,
  apiKey: string,
  apiEndpoint: string,
  temperature: number,
  maxTokens: number,
  systemPrompt: string
): Promise<string> {
  // Generic handler for custom APIs
  const conversationMessages = messages.map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text
  }))

  const fullSystemPrompt = `${systemPrompt}\n\nUser Information:\n- Name: ${userProfile?.full_name || 'Friend'}`

  const customRequest = {
    messages: [
      { role: 'system', content: fullSystemPrompt },
      ...conversationMessages
    ],
    temperature: temperature,
    max_tokens: maxTokens,
  }

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customRequest),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('Custom API error:', errorData)
    throw new Error(`Custom API error: ${response.status}`)
  }

  const data = await response.json()
  // Adjust this based on your custom API response format
  return data.reply || data.response || data.message || "I'm having trouble responding right now."
}

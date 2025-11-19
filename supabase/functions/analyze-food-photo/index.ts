import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { image } = await req.json()

    if (!image) {
      throw new Error('No image provided')
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and provide a detailed nutritional breakdown.

Return the response as a JSON object with this exact structure:
{
  "foodItems": [
    {
      "name": "Food name",
      "portion": "Estimated portion size (e.g., '1 cup', '200g', '1 medium bowl')",
      "nutrition": {
        "calories": number,
        "protein": number (in grams),
        "carbs": number (in grams),
        "fats": number (in grams)
      }
    }
  ],
  "confidence": number (0-1, how confident you are in the analysis),
  "notes": "Any additional observations"
}

Be as accurate as possible with portion sizes and nutritional estimates. If multiple food items are visible, list them separately.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    // Parse the JSON response from GPT-4 Vision
    let analysisData
    try {
      // Try to extract JSON from the response (GPT sometimes wraps it in markdown)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      analysisData = JSON.parse(jsonString.trim())
    } catch (parseError) {
      console.error('Failed to parse GPT response:', content)

      // Fallback: Create a basic structure if parsing fails
      analysisData = {
        foodItems: [
          {
            name: 'Unable to identify specific foods',
            portion: 'Unknown',
            nutrition: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fats: 0,
            },
          },
        ],
        confidence: 0,
        notes: 'Analysis failed. Please try a clearer image.',
      }
    }

    // Log the analysis for debugging
    console.log('Food analysis result:', analysisData)

    return new Response(
      JSON.stringify(analysisData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      },
    )

  } catch (error) {
    console.error('Error analyzing food photo:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        foodItems: [],
        confidence: 0,
        notes: 'Failed to analyze the image. Please try again.',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      },
    )
  }
})

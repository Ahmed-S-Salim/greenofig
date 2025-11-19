import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Connect Wearable Device Edge Function
 * Handles OAuth flow for connecting wearable devices (Fitbit, Google Fit, Garmin)
 *
 * For mobile app: Apple Health & Samsung Health use native SDKs
 * For web: Fitbit, Google Fit, Garmin, WHOOP use OAuth 2.0
 */

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { device_id, user_id } = await req.json()

    if (!device_id || !user_id) {
      throw new Error('device_id and user_id are required')
    }

    // Get OAuth credentials from environment
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID')
    const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET')
    const googleClientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID')
    const googleClientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')
    const garminConsumerKey = Deno.env.get('GARMIN_CONSUMER_KEY')
    const garminConsumerSecret = Deno.env.get('GARMIN_CONSUMER_SECRET')

    const redirectUri = `${Deno.env.get('SITE_URL')}/wearable-callback`

    let authUrl: string | null = null
    let deviceConfig: any = {}

    switch (device_id) {
      case 'fitbit':
        if (!fitbitClientId) {
          throw new Error('Fitbit OAuth not configured')
        }

        // Fitbit OAuth 2.0
        const fitbitScopes = [
          'activity',
          'heartrate',
          'nutrition',
          'sleep',
          'weight',
        ].join(' ')

        authUrl = `https://www.fitbit.com/oauth2/authorize?` +
          `response_type=code&` +
          `client_id=${fitbitClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(fitbitScopes)}&` +
          `state=${user_id}`

        deviceConfig = {
          name: 'Fitbit',
          scopes: fitbitScopes.split(' '),
        }
        break

      case 'google-fit':
        if (!googleClientId) {
          throw new Error('Google Fit OAuth not configured')
        }

        // Google Fit OAuth 2.0
        const googleScopes = [
          'https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.heart_rate.read',
          'https://www.googleapis.com/auth/fitness.sleep.read',
          'https://www.googleapis.com/auth/fitness.nutrition.read',
        ].join(' ')

        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `response_type=code&` +
          `client_id=${googleClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(googleScopes)}&` +
          `state=${user_id}&` +
          `access_type=offline&` +
          `prompt=consent`

        deviceConfig = {
          name: 'Google Fit',
          scopes: googleScopes.split(' '),
        }
        break

      case 'garmin':
        if (!garminConsumerKey) {
          throw new Error('Garmin OAuth not configured')
        }

        // Garmin uses OAuth 1.0a - more complex flow
        // For simplicity, directing to Garmin Health API documentation
        authUrl = 'https://developer.garmin.com/health-api/overview/'

        deviceConfig = {
          name: 'Garmin Connect',
          scopes: ['activities', 'heart_rate', 'sleep'],
          note: 'Garmin requires OAuth 1.0a - contact support for setup',
        }
        break

      case 'whoop':
        // WHOOP API (if available)
        authUrl = 'https://www.whoop.com/' // Placeholder

        deviceConfig = {
          name: 'WHOOP',
          scopes: ['recovery', 'sleep', 'strain'],
          note: 'WHOOP integration coming soon',
        }
        break

      default:
        throw new Error(`Unsupported device: ${device_id}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        authUrl,
        device: deviceConfig,
        message: 'Redirect user to authUrl to complete OAuth flow',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Connect wearable error:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})

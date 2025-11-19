import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Sync Wearable Data Edge Function
 * Fetches health data from connected wearable devices and stores in database
 * Supports: Fitbit, Google Fit, Garmin
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('user_id is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all connected devices for user
    const { data: connections, error: connectionsError } = await supabase
      .from('wearable_connections')
      .select('*')
      .eq('user_id', user_id)
      .eq('sync_enabled', true)

    if (connectionsError) throw connectionsError

    if (!connections || connections.length === 0) {
      throw new Error('No wearable devices connected')
    }

    let totalRecordsImported = 0
    const syncResults: any[] = []
    const aggregatedStats = {
      steps: 0,
      calories: 0,
      activeMinutes: 0,
      avgHeartRate: 0,
    }

    // Sync each connected device
    for (const connection of connections) {
      try {
        let deviceData: any = null

        switch (connection.device_id) {
          case 'fitbit':
            deviceData = await syncFitbitData(connection)
            break
          case 'google-fit':
            deviceData = await syncGoogleFitData(connection)
            break
          case 'garmin':
            deviceData = await syncGarminData(connection)
            break
          default:
            console.log(`Unsupported device: ${connection.device_id}`)
            continue
        }

        if (deviceData) {
          // Store activity data
          const { error: activityError } = await supabase
            .from('wearable_activity_data')
            .upsert({
              user_id,
              connection_id: connection.id,
              device_id: connection.device_id,
              activity_date: new Date().toISOString().split('T')[0],
              steps: deviceData.steps || 0,
              distance_meters: deviceData.distance || 0,
              calories_burned: deviceData.calories || 0,
              active_minutes: deviceData.activeMinutes || 0,
              raw_data: deviceData,
            }, {
              onConflict: 'user_id,device_id,activity_date'
            })

          if (activityError) {
            console.error('Error storing activity data:', activityError)
          }

          // Store heart rate data if available
          if (deviceData.heartRate && deviceData.heartRate.length > 0) {
            const { error: hrError } = await supabase
              .from('wearable_heart_rate_data')
              .upsert(
                deviceData.heartRate.map((hr: any) => ({
                  user_id,
                  connection_id: connection.id,
                  device_id: connection.device_id,
                  recorded_at: hr.timestamp,
                  heart_rate: hr.value,
                  heart_rate_zone: hr.zone,
                })),
                { onConflict: 'user_id,device_id,recorded_at' }
              )

            if (hrError) {
              console.error('Error storing heart rate data:', hrError)
            }
          }

          // Aggregate stats
          aggregatedStats.steps += deviceData.steps || 0
          aggregatedStats.calories += deviceData.calories || 0
          aggregatedStats.activeMinutes += deviceData.activeMinutes || 0

          totalRecordsImported += 1

          syncResults.push({
            device: connection.device_id,
            status: 'success',
            records: 1,
          })

          // Update last sync time
          await supabase
            .from('wearable_connections')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('id', connection.id)
        }

      } catch (deviceError) {
        console.error(`Error syncing ${connection.device_id}:`, deviceError)
        syncResults.push({
          device: connection.device_id,
          status: 'failed',
          error: deviceError.message,
        })
      }
    }

    // Calculate average heart rate if data exists
    const { data: hrData } = await supabase
      .from('wearable_heart_rate_data')
      .select('heart_rate')
      .eq('user_id', user_id)
      .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (hrData && hrData.length > 0) {
      const avgHr = hrData.reduce((sum, d) => sum + d.heart_rate, 0) / hrData.length
      aggregatedStats.avgHeartRate = Math.round(avgHr)
    }

    // Log sync history
    await supabase
      .from('wearable_sync_history')
      .insert({
        user_id,
        device_id: 'all',
        sync_type: 'manual',
        sync_status: syncResults.every(r => r.status === 'success') ? 'success' : 'partial',
        records_imported: totalRecordsImported,
        stats: aggregatedStats,
      })

    return new Response(
      JSON.stringify({
        success: true,
        recordsImported: totalRecordsImported,
        stats: aggregatedStats,
        syncResults,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Sync wearable data error:', error)

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

/**
 * Sync Fitbit Data
 */
async function syncFitbitData(connection: any) {
  const today = new Date().toISOString().split('T')[0]

  // Fetch activities summary
  const activitiesResponse = await fetch(
    `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
    {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
      },
    }
  )

  if (!activitiesResponse.ok) {
    throw new Error('Fitbit API error: ' + await activitiesResponse.text())
  }

  const activitiesData = await activitiesResponse.json()
  const summary = activitiesData.summary

  return {
    steps: summary.steps || 0,
    distance: summary.distances?.[0]?.distance * 1000 || 0, // Convert km to meters
    calories: summary.caloriesOut || 0,
    activeMinutes: summary.fairlyActiveMinutes + summary.veryActiveMinutes || 0,
    floors: summary.floors || 0,
    heartRate: [], // Would need additional API call for intraday heart rate
  }
}

/**
 * Sync Google Fit Data
 */
async function syncGoogleFitData(connection: any) {
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000

  // Aggregate data sources
  const datasources = [
    'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
    'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
    'derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes',
  ]

  const aggregateRequest = {
    aggregateBy: datasources.map(ds => ({ dataSourceId: ds })),
    bucketByTime: { durationMillis: 86400000 }, // 1 day
    startTimeMillis: oneDayAgo,
    endTimeMillis: now,
  }

  const response = await fetch(
    'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aggregateRequest),
    }
  )

  if (!response.ok) {
    throw new Error('Google Fit API error: ' + await response.text())
  }

  const data = await response.json()

  // Extract aggregated values
  let steps = 0
  let calories = 0
  let activeMinutes = 0

  data.bucket?.[0]?.dataset?.forEach((dataset: any) => {
    dataset.point?.forEach((point: any) => {
      const value = point.value?.[0]?.intVal || point.value?.[0]?.fpVal || 0

      if (dataset.dataSourceId.includes('step_count')) {
        steps += value
      } else if (dataset.dataSourceId.includes('calories')) {
        calories += value
      } else if (dataset.dataSourceId.includes('active_minutes')) {
        activeMinutes += value
      }
    })
  })

  return {
    steps,
    distance: 0, // Would need distance data source
    calories: Math.round(calories),
    activeMinutes: Math.round(activeMinutes),
    heartRate: [],
  }
}

/**
 * Sync Garmin Data
 * Note: Garmin uses OAuth 1.0a which is more complex
 * This is a placeholder for the actual implementation
 */
async function syncGarminData(connection: any) {
  // Garmin Health API would require OAuth 1.0a signing
  // For now, return placeholder data
  console.log('Garmin sync not fully implemented - requires OAuth 1.0a')

  return {
    steps: 0,
    distance: 0,
    calories: 0,
    activeMinutes: 0,
    heartRate: [],
  }
}

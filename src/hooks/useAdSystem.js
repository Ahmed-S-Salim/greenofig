import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Hook for managing ad display, tracking, and analytics
 * Shows ads to:
 * - Non-logged-in visitors (anonymous users)
 * - Basic (free) tier users
 * Hides ads from:
 * - Premium, Ultimate (Pro), and Elite subscribers
 */
export const useAdSystem = () => {
  const { user } = useAuth();
  const { hasAds: planHasAds, planKey } = useFeatureAccess();
  const [campaigns, setCampaigns] = useState({});
  const [loading, setLoading] = useState(false);
  const impressionCache = useRef(new Set());

  // Determine if ads should be shown
  // Show ads if: no user logged in OR user is on free/basic plan
  const shouldShowAds = !user || planHasAds;
  const hasAds = shouldShowAds;

  // Fetch active campaign for a specific placement
  const fetchCampaignForPlacement = useCallback(async (placementName) => {
    if (!shouldShowAds) return null;

    try {
      // For anonymous users, target 'Base' plan ads
      const targetPlan = !user ? 'Base' : (planKey === 'free' ? 'Base' : planKey);

      const { data, error } = await supabase
        .from('ad_campaigns')
        .select(`
          *,
          ad_placements!inner(*)
        `)
        .eq('ad_placements.name', placementName)
        .eq('is_active', true)
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`)
        .contains('target_plans', [targetPlan])
        .order('cost_per_click', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching campaign:', error);
        return null;
      }

      return data || null;
    } catch (err) {
      console.error('Error in fetchCampaignForPlacement:', err);
      return null;
    }
  }, [shouldShowAds, planKey, user]);

  // Track impression
  const trackImpression = useCallback(async (campaignId, placementId, pagePath) => {
    if (!shouldShowAds || !campaignId) return null;

    // Prevent duplicate impressions in same session
    const cacheKey = `${campaignId}-${pagePath}`;
    if (impressionCache.current.has(cacheKey)) {
      return null;
    }
    impressionCache.current.add(cacheKey);

    try {
      const { data, error } = await supabase
        .from('ad_impressions')
        .insert({
          campaign_id: campaignId,
          placement_id: placementId,
          user_id: user?.id || null,
          page_path: pagePath,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          viewed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Increment campaign counter
      await supabase.rpc('increment_campaign_impressions', { campaign_uuid: campaignId });

      return data;
    } catch (err) {
      console.error('Error tracking impression:', err);
      return null;
    }
  }, [shouldShowAds, user]);

  // Track click
  const trackClick = useCallback(async (campaignId, impressionId, pagePath) => {
    if (!shouldShowAds || !campaignId) return null;

    try {
      const { data, error } = await supabase
        .from('ad_clicks')
        .insert({
          campaign_id: campaignId,
          impression_id: impressionId,
          user_id: user?.id || null,
          page_path: pagePath
        })
        .select()
        .single();

      if (error) throw error;

      // Increment campaign counter
      await supabase.rpc('increment_campaign_clicks', { campaign_uuid: campaignId });

      return data;
    } catch (err) {
      console.error('Error tracking click:', err);
      return null;
    }
  }, [shouldShowAds, user]);

  // Track conversion
  const trackConversion = useCallback(async (campaignId, clickId, conversionType, conversionValue = 0) => {
    if (!campaignId) return null;

    try {
      const { data, error } = await supabase
        .from('ad_conversions')
        .insert({
          campaign_id: campaignId,
          click_id: clickId,
          user_id: user?.id || null,
          conversion_type: conversionType,
          conversion_value: conversionValue
        })
        .select()
        .single();

      if (error) throw error;

      // Update campaign conversion count using RPC for safe increment
      await supabase.rpc('increment_campaign_conversions', { campaign_uuid: campaignId });

      return data;
    } catch (err) {
      console.error('Error tracking conversion:', err);
      return null;
    }
  }, [user]);

  // Dismiss ad for user
  const dismissAd = useCallback(async (campaignId) => {
    if (!user?.id || !campaignId) return;

    try {
      await supabase
        .from('user_ad_interactions')
        .upsert({
          user_id: user.id,
          campaign_id: campaignId,
          dismissed: true,
          date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'user_id,campaign_id,date'
        });
    } catch (err) {
      console.error('Error dismissing ad:', err);
    }
  }, [user]);

  // Get device type helper
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  };

  return {
    hasAds,
    campaigns,
    loading,
    fetchCampaignForPlacement,
    trackImpression,
    trackClick,
    trackConversion,
    dismissAd
  };
};

/**
 * Hook for admin ad management
 */
export const useAdManagement = () => {
  const [placements, setPlacements] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all placements
  const fetchPlacements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ad_placements')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setPlacements(data || []);
    } catch (err) {
      console.error('Error fetching placements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all campaigns
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select(`
          *,
          ad_placements(name, display_name, placement_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new campaign
  const createCampaign = useCallback(async (campaignData) => {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert(campaignData)
        .select()
        .single();

      if (error) throw error;
      await fetchCampaigns();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating campaign:', err);
      return { success: false, error: err.message };
    }
  }, [fetchCampaigns]);

  // Update campaign
  const updateCampaign = useCallback(async (campaignId, updates) => {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      await fetchCampaigns();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating campaign:', err);
      return { success: false, error: err.message };
    }
  }, [fetchCampaigns]);

  // Delete campaign
  const deleteCampaign = useCallback(async (campaignId) => {
    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      await fetchCampaigns();
      return { success: true };
    } catch (err) {
      console.error('Error deleting campaign:', err);
      return { success: false, error: err.message };
    }
  }, [fetchCampaigns]);

  // Toggle campaign status
  const toggleCampaignStatus = useCallback(async (campaignId, isActive) => {
    return updateCampaign(campaignId, { is_active: isActive });
  }, [updateCampaign]);

  // Fetch analytics summary
  const fetchAnalytics = useCallback(async (dateRange = 30) => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Get total impressions
      const { count: totalImpressions } = await supabase
        .from('ad_impressions')
        .select('*', { count: 'exact', head: true })
        .gte('viewed_at', startDate.toISOString());

      // Get total clicks
      const { count: totalClicks } = await supabase
        .from('ad_clicks')
        .select('*', { count: 'exact', head: true })
        .gte('clicked_at', startDate.toISOString());

      // Get total conversions
      const { count: totalConversions } = await supabase
        .from('ad_conversions')
        .select('*', { count: 'exact', head: true })
        .gte('converted_at', startDate.toISOString());

      // Get campaign performance
      const { data: campaignPerformance } = await supabase
        .from('ad_campaigns')
        .select('id, name, total_impressions, total_clicks, total_conversions, cost_per_click, cost_per_impression')
        .eq('is_active', true)
        .order('total_impressions', { ascending: false })
        .limit(10);

      // Calculate metrics
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
      const cvr = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;

      // Estimate revenue (based on CPC and CPM)
      let estimatedRevenue = 0;
      if (campaignPerformance) {
        campaignPerformance.forEach(campaign => {
          estimatedRevenue += (campaign.total_impressions * (campaign.cost_per_impression || 0.005));
          estimatedRevenue += (campaign.total_clicks * (campaign.cost_per_click || 0.50));
        });
      }

      setAnalytics({
        totalImpressions: totalImpressions || 0,
        totalClicks: totalClicks || 0,
        totalConversions: totalConversions || 0,
        ctr: ctr.toFixed(2),
        cvr: cvr.toFixed(2),
        estimatedRevenue: estimatedRevenue.toFixed(2),
        campaignPerformance: campaignPerformance || [],
        dateRange
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    placements,
    campaigns,
    analytics,
    loading,
    fetchPlacements,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus,
    fetchAnalytics
  };
};

export default useAdSystem;

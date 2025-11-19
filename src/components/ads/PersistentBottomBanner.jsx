import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdSystem } from '@/hooks/useAdSystem';
import { cn } from '@/lib/utils';

/**
 * Persistent Bottom Banner Ad
 * Fixed at bottom of screen for:
 * - Non-logged-in visitors (anonymous users)
 * - Basic (free) tier users
 * Shows upgrade prompts or external ads
 */
const PersistentBottomBanner = () => {
  const location = useLocation();
  const { hasAds, fetchCampaignForPlacement, trackImpression, trackClick, dismissAd } = useAdSystem();
  const [campaign, setCampaign] = useState(null);
  const [impression, setImpression] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Don't show on certain pages
  const excludedPaths = ['/app/admin', '/login', '/signup', '/auth'];
  const isExcludedPath = excludedPaths.some(path => location.pathname.startsWith(path));

  // Fetch campaign
  useEffect(() => {
    const loadCampaign = async () => {
      if (!hasAds || isExcludedPath) {
        setLoading(false);
        return;
      }

      const data = await fetchCampaignForPlacement('bottom_banner');
      setCampaign(data);
      setLoading(false);
    };

    loadCampaign();
  }, [hasAds, isExcludedPath, fetchCampaignForPlacement]);

  // Track impression
  useEffect(() => {
    if (!campaign || impression) return;

    const trackView = async () => {
      const imp = await trackImpression(
        campaign.id,
        campaign.placement_id,
        location.pathname
      );
      setImpression(imp);
    };

    trackView();
  }, [campaign, impression, trackImpression, location.pathname]);

  // Handle click
  const handleClick = async () => {
    if (!campaign) return;

    await trackClick(campaign.id, impression?.id, location.pathname);

    if (campaign.cta_url) {
      if (campaign.cta_url.startsWith('/')) {
        window.location.href = campaign.cta_url;
      } else {
        window.open(campaign.cta_url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Handle dismiss
  const handleDismiss = async () => {
    if (campaign) {
      await dismissAd(campaign.id);
    }
    setDismissed(true);
    // Store in session storage so it stays dismissed for this session
    sessionStorage.setItem('bottom_banner_dismissed', 'true');
  };

  // Check if already dismissed this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('bottom_banner_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Don't render if conditions not met
  if (!hasAds || isExcludedPath || dismissed || loading) {
    return null;
  }

  // Show default upgrade banner if no campaign
  if (!campaign) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-r from-primary/95 to-green-600/95 backdrop-blur-sm border-t border-primary/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Sparkles className="w-5 h-5 text-white flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    Upgrade to Premium for ad-free experience & unlimited features!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-white text-primary hover:bg-white/90 font-semibold text-xs h-8"
                >
                  Upgrade Now
                </Button>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-white/80 hover:text-white p-1"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show campaign banner
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="backdrop-blur-sm border-t border-primary/30 shadow-lg"
        style={{
          backgroundColor: campaign.background_color || 'rgba(22, 163, 74, 0.95)',
          color: campaign.text_color || '#ffffff'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {campaign.image_url && (
                <img
                  src={campaign.image_url}
                  alt=""
                  className="w-10 h-10 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider opacity-70 font-medium">
                    Ad
                  </span>
                  <p className="font-medium text-sm">{campaign.title}</p>
                </div>
                {campaign.subtitle && (
                  <p className="text-xs opacity-80">{campaign.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleClick}
                className="bg-white text-black hover:bg-white/90 font-semibold text-xs h-8 gap-1"
              >
                {campaign.cta_text}
                <ExternalLink className="w-3 h-3" />
              </Button>
              <button
                onClick={handleDismiss}
                className="opacity-80 hover:opacity-100 p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistentBottomBanner;

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ExternalLink, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdSystem } from '@/hooks/useAdSystem';
import { cn } from '@/lib/utils';

/**
 * Universal Ad Container Component
 * Renders different ad types based on placement configuration
 * Shows for:
 * - Non-logged-in visitors (anonymous users)
 * - Basic (free) tier users
 * Hides from:
 * - Premium, Ultimate (Pro), and Elite subscribers
 */
const AdContainer = ({
  placementName,
  className = '',
  onClose,
  showCloseButton = true,
  autoTrack = true
}) => {
  const location = useLocation();
  const { hasAds, fetchCampaignForPlacement, trackImpression, trackClick, dismissAd } = useAdSystem();
  const [campaign, setCampaign] = useState(null);
  const [impression, setImpression] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const containerRef = useRef(null);

  // Fetch campaign for this placement
  useEffect(() => {
    const loadCampaign = async () => {
      if (!hasAds) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetchCampaignForPlacement(placementName);
      setCampaign(data);
      setLoading(false);
    };

    loadCampaign();
  }, [hasAds, placementName, fetchCampaignForPlacement]);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (!campaign || !autoTrack || impression) return;

    const trackView = async () => {
      const imp = await trackImpression(
        campaign.id,
        campaign.placement_id,
        location.pathname
      );
      setImpression(imp);
    };

    trackView();
  }, [campaign, autoTrack, trackImpression, location.pathname, impression]);

  // Handle ad click
  const handleClick = async (e) => {
    if (!campaign) return;

    // Track click
    await trackClick(campaign.id, impression?.id, location.pathname);

    // Open CTA URL
    if (campaign.cta_url) {
      if (campaign.cta_url.startsWith('/')) {
        // Internal link
        window.location.href = campaign.cta_url;
      } else {
        // External link
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
    if (onClose) onClose();
  };

  // Don't render if no ads or dismissed
  if (!hasAds || dismissed || loading || !campaign) {
    return null;
  }

  // Render based on placement type
  const placementType = campaign.ad_placements?.placement_type || 'banner';

  return (
    <div
      ref={containerRef}
      className={cn(
        'ad-container relative',
        placementType === 'banner' && 'ad-banner-container',
        placementType === 'sidebar' && 'ad-sidebar-container',
        placementType === 'native' && 'ad-native-container',
        className
      )}
      data-ad-placement={placementName}
      data-ad-campaign={campaign.id}
    >
      {placementType === 'banner' && (
        <BannerAd
          campaign={campaign}
          onDismiss={showCloseButton ? handleDismiss : null}
          onClick={handleClick}
        />
      )}
      {placementType === 'sidebar' && (
        <SidebarAd
          campaign={campaign}
          onDismiss={showCloseButton ? handleDismiss : null}
          onClick={handleClick}
        />
      )}
      {placementType === 'native' && (
        <NativeAd
          campaign={campaign}
          onDismiss={showCloseButton ? handleDismiss : null}
          onClick={handleClick}
        />
      )}
    </div>
  );
};

/**
 * Banner Ad Component
 */
const BannerAd = ({ campaign, onDismiss, onClick }) => {
  return (
    <div
      className="relative bg-gradient-to-r from-primary/10 via-green-500/10 to-emerald-500/10 border border-primary/20 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300"
      style={{
        backgroundColor: campaign.background_color || undefined,
        color: campaign.text_color || undefined
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {campaign.image_url && (
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider text-primary/60 font-medium">
                Sponsored
              </span>
            </div>
            <h4 className="font-semibold text-sm mb-1 truncate">{campaign.title}</h4>
            {campaign.subtitle && (
              <p className="text-xs text-text-secondary mb-2 line-clamp-2">{campaign.subtitle}</p>
            )}
            <Button
              size="sm"
              onClick={onClick}
              className="bg-primary hover:bg-primary/90 text-xs h-7 gap-1"
            >
              {campaign.cta_text}
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-text-secondary hover:text-foreground transition-colors p-1"
            aria-label="Close ad"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="absolute bottom-1 right-2">
        <span className="text-[8px] text-text-secondary/50">Ad</span>
      </div>
    </div>
  );
};

/**
 * Sidebar Ad Component
 */
const SidebarAd = ({ campaign, onDismiss, onClick }) => {
  return (
    <div
      className="relative bg-card border border-border rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        backgroundColor: campaign.background_color || undefined,
        color: campaign.text_color || undefined
      }}
    >
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-text-secondary hover:text-foreground transition-colors p-1 z-10"
          aria-label="Close ad"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="text-[10px] uppercase tracking-wider text-primary/60 font-medium mb-3">
        Sponsored
      </div>

      {campaign.image_url && (
        <div className="mb-4">
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
      )}

      <h4 className="font-bold text-base mb-2">{campaign.title}</h4>
      {campaign.subtitle && (
        <p className="text-sm text-text-secondary mb-3">{campaign.subtitle}</p>
      )}
      {campaign.body_text && (
        <p className="text-xs text-text-secondary mb-4 line-clamp-3">{campaign.body_text}</p>
      )}

      <Button
        onClick={onClick}
        className="w-full bg-primary hover:bg-primary/90 gap-2"
      >
        {campaign.cta_text}
        <ExternalLink className="w-4 h-4" />
      </Button>

      <div className="mt-3 text-center">
        <span className="text-[9px] text-text-secondary/50">
          {campaign.advertiser_name || 'Advertisement'}
        </span>
      </div>
    </div>
  );
};

/**
 * Native Ad Component (blends with content)
 */
const NativeAd = ({ campaign, onDismiss, onClick }) => {
  return (
    <div
      className="relative bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/80 transition-all duration-300 cursor-pointer"
      onClick={onClick}
      style={{
        backgroundColor: campaign.background_color || undefined,
        color: campaign.text_color || undefined
      }}
    >
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-3 right-3 text-text-secondary hover:text-foreground transition-colors p-1"
          aria-label="Close ad"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex gap-4">
        {campaign.image_url && (
          <div className="flex-shrink-0">
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-primary/60 font-medium bg-primary/10 px-2 py-0.5 rounded">
              Sponsored
            </span>
            {campaign.advertiser_name && (
              <span className="text-xs text-text-secondary">
                by {campaign.advertiser_name}
              </span>
            )}
          </div>

          <h4 className="font-bold text-lg mb-2">{campaign.title}</h4>
          {campaign.subtitle && (
            <p className="text-sm text-text-secondary mb-2">{campaign.subtitle}</p>
          )}
          {campaign.body_text && (
            <p className="text-sm text-text-secondary line-clamp-2">{campaign.body_text}</p>
          )}

          <div className="mt-4">
            <span className="inline-flex items-center gap-1 text-primary font-medium text-sm hover:underline">
              {campaign.cta_text}
              <ExternalLink className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdContainer;

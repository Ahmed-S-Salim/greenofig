import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdSystem } from '@/hooks/useAdSystem';
import { cn } from '@/lib/utils';

/**
 * Full-screen Interstitial Ad Component
 * Shows after completing actions (AI generation, meal logging, etc.)
 * Only for Basic (free) tier users
 */
const InterstitialAd = ({
  placementName = 'after_ai_generation',
  onClose,
  showAfterSeconds = 0,
  forceCountdown = 3,
  className = ''
}) => {
  const location = useLocation();
  const { hasAds, fetchCampaignForPlacement, trackImpression, trackClick, dismissAd } = useAdSystem();
  const [campaign, setCampaign] = useState(null);
  const [impression, setImpression] = useState(null);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(forceCountdown);
  const [canClose, setCanClose] = useState(forceCountdown === 0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  // Fetch campaign
  useEffect(() => {
    const loadCampaign = async () => {
      if (!hasAds) {
        setLoading(false);
        if (onClose) onClose();
        return;
      }

      const data = await fetchCampaignForPlacement(placementName);
      setCampaign(data);
      setLoading(false);

      if (data) {
        // Show after delay
        setTimeout(() => setVisible(true), showAfterSeconds * 1000);
      } else {
        if (onClose) onClose();
      }
    };

    loadCampaign();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasAds, placementName, fetchCampaignForPlacement, showAfterSeconds, onClose]);

  // Track impression when visible
  useEffect(() => {
    if (!visible || !campaign || impression) return;

    const trackView = async () => {
      const imp = await trackImpression(
        campaign.id,
        campaign.placement_id,
        location.pathname
      );
      setImpression(imp);
    };

    trackView();

    // Start countdown
    if (forceCountdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [visible, campaign, impression, trackImpression, location.pathname, forceCountdown]);

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

  // Handle close
  const handleClose = async () => {
    if (!canClose) return;

    if (campaign) {
      await dismissAd(campaign.id);
    }
    setVisible(false);
    if (onClose) onClose();
  };

  // Don't render if not ready
  if (!hasAds || loading || !campaign || !visible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center',
        'bg-black/80 backdrop-blur-sm',
        'animate-in fade-in duration-300',
        className
      )}
    >
      <div className="relative w-full max-w-2xl mx-4">
        {/* Close button with countdown */}
        <div className="absolute -top-12 right-0 flex items-center gap-2">
          {!canClose && (
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <Clock className="w-4 h-4" />
              <span>Close in {countdown}s</span>
            </div>
          )}
          <button
            onClick={handleClose}
            disabled={!canClose}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all',
              canClose
                ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer'
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            )}
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Close</span>
          </button>
        </div>

        {/* Ad content */}
        <div
          className="bg-card rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: campaign.background_color || undefined,
            color: campaign.text_color || undefined
          }}
        >
          {/* Sponsored label */}
          <div className="bg-primary/10 px-4 py-2 border-b border-border">
            <span className="text-xs uppercase tracking-wider text-primary font-medium">
              Sponsored Content
            </span>
          </div>

          <div className="p-8">
            {/* Image */}
            {campaign.image_url && (
              <div className="mb-6">
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
            )}

            {/* Content */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">{campaign.title}</h2>
              {campaign.subtitle && (
                <p className="text-lg text-text-secondary mb-4">{campaign.subtitle}</p>
              )}
              {campaign.body_text && (
                <p className="text-base text-text-secondary mb-6 max-w-lg mx-auto">
                  {campaign.body_text}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={handleClick}
                  className="bg-primary hover:bg-primary/90 gap-2 px-8"
                >
                  {campaign.cta_text}
                  <ExternalLink className="w-5 h-5" />
                </Button>
                {canClose && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleClose}
                    className="px-8"
                  >
                    Continue to App
                  </Button>
                )}
              </div>
            </div>

            {/* Advertiser info */}
            {campaign.advertiser_name && (
              <div className="mt-6 pt-4 border-t border-border text-center">
                <span className="text-xs text-text-secondary">
                  Advertisement by {campaign.advertiser_name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterstitialAd;

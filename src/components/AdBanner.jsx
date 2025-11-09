import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

/**
 * Ad Banner shown to free users
 * Can be dismissed but will show again on next session
 */
const AdBanner = ({ onDismiss, position = 'top' }) => {
  const navigate = useNavigate();
  const { hasAds } = useFeatureAccess();

  // Don't show if user doesn't have ads
  if (!hasAds) return null;

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div
      className={`relative bg-gradient-to-r from-primary/10 to-green-500/10 border-l-4 border-primary p-4 ${
        position === 'top' ? 'mb-6' : 'mt-6'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Upgrade to Premium for an Ad-Free Experience!
            </h3>
            <p className="text-xs text-text-secondary mb-2">
              Get unlimited meal plans, AI workouts, advanced analytics, and remove all ads.
            </p>
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="bg-primary hover:bg-primary/90 text-xs h-8"
            >
              Upgrade Now - Save 25% on Yearly
            </Button>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-text-secondary hover:text-foreground transition-colors"
            aria-label="Dismiss ad"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdBanner;

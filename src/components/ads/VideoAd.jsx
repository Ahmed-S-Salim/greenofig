import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Volume2, VolumeX, Play, Pause, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdSystem } from '@/hooks/useAdSystem';
import { cn } from '@/lib/utils';

/**
 * Rewarded Video Ad Component
 * Users watch video to get rewards (extra AI messages, bonus features)
 * Only for Basic (free) tier users
 */
const VideoAd = ({
  placementName = 'rewarded_video',
  onClose,
  onRewardEarned,
  rewardDescription = 'Get +1 bonus AI message',
  className = ''
}) => {
  const location = useLocation();
  const { hasAds, fetchCampaignForPlacement, trackImpression, trackClick } = useAdSystem();
  const [campaign, setCampaign] = useState(null);
  const [impression, setImpression] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  // Fetch campaign
  useEffect(() => {
    const loadCampaign = async () => {
      if (!hasAds) {
        setLoading(false);
        return;
      }

      const data = await fetchCampaignForPlacement(placementName);
      setCampaign(data);
      setLoading(false);

      if (data) {
        setVisible(true);
      }
    };

    loadCampaign();

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [hasAds, placementName, fetchCampaignForPlacement]);

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
  }, [visible, campaign, impression, trackImpression, location.pathname]);

  // Handle video progress
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const progressPercent = (video.currentTime / video.duration) * 100;
    setProgress(progressPercent);
    setTimeRemaining(Math.ceil(video.duration - video.currentTime));

    // Mark as completed when 95% watched
    if (progressPercent >= 95 && !completed) {
      setCompleted(true);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  // Start video playback
  const startVideo = async () => {
    if (!videoRef.current) return;

    try {
      // Handle promise returned by play() to avoid DOMException
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      setPlaying(true);

      // Track progress
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          handleTimeUpdate();
        }
      }, 100);
    } catch (error) {
      console.error('Error playing video:', error);
      // If autoplay fails, user needs to interact first
      setPlaying(false);
    }
  };

  // Toggle play/pause
  const togglePlay = async () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        setPlaying(true);
      } catch (error) {
        console.error('Error resuming video:', error);
        setPlaying(false);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  // Handle video end
  const handleVideoEnd = () => {
    setPlaying(false);
    setCompleted(true);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  // Claim reward
  const claimReward = async () => {
    if (!completed || rewardClaimed) return;

    // Track click/conversion
    if (campaign) {
      await trackClick(campaign.id, impression?.id, location.pathname);
    }

    setRewardClaimed(true);
    if (onRewardEarned) {
      onRewardEarned();
    }
  };

  // Handle close
  const handleClose = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setVisible(false);
    if (onClose) onClose(rewardClaimed);
  };

  // Don't render if not ready
  if (!hasAds || loading || !campaign || !visible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center',
        'bg-black/90 backdrop-blur-sm',
        'animate-in fade-in duration-300',
        className
      )}
    >
      <div className="relative w-full max-w-4xl mx-4">
        {/* Header with reward info */}
        <div className="absolute -top-16 left-0 right-0 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            <span className="font-medium">{rewardDescription}</span>
          </div>
          {!completed && timeRemaining > 0 && (
            <div className="flex items-center gap-1 text-white/80">
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}s remaining</span>
            </div>
          )}
        </div>

        {/* Video container */}
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
          {/* Sponsored label */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10">
            <span className="text-xs uppercase tracking-wider text-white/80 font-medium">
              Sponsored Video • Watch to Earn Reward
            </span>
          </div>

          {/* Video player */}
          {campaign.video_url ? (
            <video
              ref={videoRef}
              src={campaign.video_url}
              className="w-full aspect-video"
              muted={muted}
              playsInline
              onEnded={handleVideoEnd}
              onTimeUpdate={handleTimeUpdate}
            />
          ) : (
            // Fallback to image with simulated video
            <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-green-500/20 flex items-center justify-center">
              {campaign.image_url ? (
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{campaign.title}</h3>
                  <p className="text-white/80">{campaign.subtitle}</p>
                </div>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Video controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              {!playing && !completed && (
                <Button
                  size="lg"
                  onClick={startVideo}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white gap-2"
                >
                  <Play className="w-5 h-5" />
                  Play Video
                </Button>
              )}
              {playing && (
                <button
                  onClick={togglePlay}
                  className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={toggleMute}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors"
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {completed && !rewardClaimed && (
              <Button
                size="lg"
                onClick={claimReward}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold gap-2 animate-pulse"
              >
                <Gift className="w-5 h-5" />
                Claim Your Reward!
              </Button>
            )}

            {rewardClaimed && (
              <div className="bg-green-500/90 text-white px-6 py-3 rounded-lg font-bold">
                ✓ Reward Claimed!
              </div>
            )}
          </div>
        </div>

        {/* Ad info and close */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-white/60 text-sm">
            {campaign.advertiser_name && (
              <span>Ad by {campaign.advertiser_name}</span>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {completed ? 'Close' : 'Skip (No Reward)'}
            <X className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoAd;

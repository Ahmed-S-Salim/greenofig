import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  Heart,
  Star,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Award,
  Target,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FOUNDER_INFO = {
  name: 'Ahmed Al-Mansour',
  title: 'Founder & Chief Nutrition Officer',
  credentials: 'MSc Nutrition Science, Certified Nutritionist',
  avatar: '/images/founder-avatar.jpg', // Placeholder - replace with actual image
  videoUrl: '/videos/welcome.mp4', // Placeholder - replace with actual video
  thumbnailUrl: '/images/welcome-thumbnail.jpg' // Placeholder
};

const KEY_POINTS = [
  {
    icon: Heart,
    title: 'Your Health is Our Priority',
    description: 'We\'re committed to helping you achieve sustainable, healthy nutrition habits'
  },
  {
    icon: Target,
    title: 'Evidence-Based Approach',
    description: 'All our recommendations are backed by the latest nutrition science'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Join thousands of users on their journey to better health'
  },
  {
    icon: Award,
    title: 'Expert Guidance',
    description: 'Access certified nutritionists and personalized meal plans'
  }
];

const WelcomeVideo = ({ userId, autoPlay = false, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (userId) {
      checkWatchStatus();
    }
  }, [userId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);

      // Track watch percentage (video considered "watched" at 80%)
      if (percent > watchedPercentage) {
        setWatchedPercentage(percent);

        if (percent >= 80 && !hasWatched) {
          markAsWatched();
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!hasWatched) {
        markAsWatched();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [hasWatched, watchedPercentage]);

  const checkWatchStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('welcome_video_watched')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setHasWatched(data?.welcome_video_watched || false);
    } catch (error) {
      console.error('Error checking watch status:', error);
    }
  };

  const markAsWatched = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          welcome_video_watched: true,
          welcome_video_watched_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setHasWatched(true);

      // Award bonus XP
      await supabase.rpc('add_xp', {
        p_user_id: userId,
        p_xp_amount: 100,
        p_source: 'Watched Welcome Video'
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showVideo) {
    return (
      <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Founder Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {/* Placeholder - replace with actual founder image */}
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-purple-600" />
                  </div>
                </div>
              </div>
              {hasWatched && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center border-4 border-white">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-3 bg-purple-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Welcome Message
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                A Personal Message from {FOUNDER_INFO.name}
              </h2>
              <p className="text-gray-600 mb-1">{FOUNDER_INFO.title}</p>
              <p className="text-sm text-gray-500 mb-4">{FOUNDER_INFO.credentials}</p>

              {hasWatched ? (
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">You've watched this video</span>
                </div>
              ) : (
                <p className="text-gray-700 mb-4">
                  Watch this 2-minute video to learn how GreenoFig can help you achieve your nutrition goals and earn bonus XP!
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowVideo(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {hasWatched ? 'Watch Again' : 'Watch Now'}
                </Button>
                {!hasWatched && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 px-3 py-2">
                    <Award className="w-4 h-4 mr-1" />
                    +100 XP
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Key Points */}
          {!hasWatched && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-purple-200">
              {KEY_POINTS.map((point, index) => {
                const PointIcon = point.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <PointIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{point.title}</h4>
                      <p className="text-sm text-gray-600">{point.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowVideo(false);
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          ref={containerRef}
          className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full"
              poster={FOUNDER_INFO.thumbnailUrl}
              onClick={togglePlay}
            >
              <source src={FOUNDER_INFO.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                onClick={togglePlay}
              >
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700 transition-colors">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              {/* Progress Bar */}
              <div
                className="w-full h-1 bg-gray-600 rounded-full mb-3 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current) {
                    videoRef.current.currentTime = pos * videoRef.current.duration;
                  }
                }}
              >
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

                  <span className="text-white text-sm">
                    {videoRef.current ? formatTime(videoRef.current.currentTime) : '0:00'} /
                    {videoRef.current ? formatTime(videoRef.current.duration || 0) : '0:00'}
                  </span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Welcome to GreenoFig - Message from {FOUNDER_INFO.name}
                </h3>
                <p className="text-gray-400 text-sm">{FOUNDER_INFO.credentials}</p>
              </div>
              {!hasWatched && watchedPercentage >= 80 && (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  +100 XP Earned!
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeVideo;

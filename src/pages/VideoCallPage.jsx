import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  User,
  Users,
  Maximize2,
  Minimize2,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
  LogIn,
  SwitchCamera,
  Wifi,
  WifiOff,
  MessageCircle,
  MoreVertical
} from 'lucide-react';

const VideoCallPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [guestName, setGuestName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showPiP, setShowPiP] = useState(true);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    error,
    participants,
    callQuality,
    localVideoRef,
    remoteVideoRef,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    switchCamera,
    initializeMedia
  } = useWebRTC(roomId);

  // Initialize camera preview on mount
  useEffect(() => {
    initializeMedia().catch(console.error);
    return () => {
      leaveRoom();
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (connectionState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [connectionState]);

  // Auto-hide controls on mobile
  useEffect(() => {
    if (isMobile && hasJoined) {
      const hideControls = () => {
        setShowControls(false);
      };

      controlsTimerRef.current = setTimeout(hideControls, 5000);

      return () => {
        if (controlsTimerRef.current) {
          clearTimeout(controlsTimerRef.current);
        }
      };
    }
  }, [isMobile, hasJoined, showControls]);

  // Tap to show controls
  const handleTapToShowControls = () => {
    if (isMobile && hasJoined) {
      setShowControls(true);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 5000);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle join call
  const handleJoinCall = async () => {
    if (!user && !guestName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter your name to join the call'
      });
      return;
    }

    try {
      await joinRoom();
      setHasJoined(true);
      toast({
        title: 'Joining call...',
        description: 'Connecting to video call'
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Could not join call. Please check camera/microphone permissions.'
      });
    }
  };

  // Handle end call
  const handleEndCall = async () => {
    await leaveRoom();
    setCallDuration(0);
    toast({
      title: 'Call ended',
      description: `Call duration: ${formatDuration(callDuration)}`
    });
    navigate(-1);
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.() || containerRef.current?.webkitRequestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Quality indicator
  const getQualityIndicator = () => {
    const colors = {
      good: 'text-green-500',
      medium: 'text-yellow-500',
      poor: 'text-red-500'
    };
    return (
      <div className={`flex items-center gap-1 ${colors[callQuality] || colors.good}`}>
        <Wifi className="w-3 h-3" />
        <span className="text-[10px] uppercase">{callQuality}</span>
      </div>
    );
  };

  // Connection status badge
  const getStatusBadge = () => {
    switch (connectionState) {
      case 'connecting':
        return <Badge variant="secondary" className="text-xs"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Connecting...</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-500 text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Connected</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Ready</Badge>;
    }
  };

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Call Link</h2>
            <p className="text-muted-foreground mb-4">
              This video call link is invalid or has expired.
            </p>
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black flex flex-col"
      onClick={handleTapToShowControls}
    >
      {/* Header - Compact on mobile */}
      <motion.header
        className={`absolute top-0 left-0 right-0 z-20 p-2 sm:p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
          !showControls && hasJoined ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: showControls || !hasJoined ? 1 : 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <div>
              <h1 className="font-semibold text-white text-sm sm:text-base">Video Call</h1>
              {hasJoined && connectionState === 'connected' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatDuration(callDuration)}</span>
                  {getQualityIndicator()}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {participants.length > 0 && (
              <Badge variant="outline" className="text-white border-gray-600 text-xs">
                <Users className="w-3 h-3 mr-1" />
                {participants.length}
              </Badge>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {!hasJoined ? (
          // Pre-call lobby - Mobile optimized
          <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Video Preview */}
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] sm:aspect-video bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-700 mb-4 sm:mb-6 shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-2 animate-spin" />
                    <p className="text-gray-400 text-sm">Loading camera...</p>
                  </div>
                </div>
              )}
              {localStream && !isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
                  </div>
                </div>
              )}

              {/* Preview controls overlay */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-3">
                <Button
                  variant={isMuted ? 'destructive' : 'secondary'}
                  size="sm"
                  className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  variant={!isVideoEnabled ? 'destructive' : 'secondary'}
                  size="sm"
                  className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
                  onClick={(e) => { e.stopPropagation(); toggleVideo(); }}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                {isMobile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
                    onClick={(e) => { e.stopPropagation(); switchCamera(); }}
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Join Form - Compact on mobile */}
            <Card className="w-full max-w-sm sm:max-w-md bg-gray-800/80 backdrop-blur-sm border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-center mb-4 text-white">Ready to join?</h2>

                {!user && (
                  <div className="mb-4">
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                )}

                {user && (
                  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Joining as</p>
                      <p className="font-semibold text-white text-sm">{profile?.full_name || user.email}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  className="w-full bg-green-500 hover:bg-green-600 gap-2 h-12"
                  size="lg"
                  onClick={handleJoinCall}
                  disabled={!user && !guestName.trim()}
                >
                  <Phone className="w-5 h-5" />
                  Join Call
                </Button>

                {!user && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    <a href="/login" className="text-primary hover:underline">Sign in</a> for a better experience
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // In-call view - Full screen video
          <div className="absolute inset-0">
            {/* Remote Video (main/fullscreen) */}
            <div className="w-full h-full bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" />
                    </div>
                    <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                    <p className="text-gray-400 text-sm sm:text-base">Waiting for others to join...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video (picture-in-picture) - Draggable */}
            {showPiP && (
              <motion.div
                className={`absolute ${isMobile ? 'bottom-28 right-3 w-28 h-36' : 'bottom-28 right-4 w-40 h-28 sm:w-48 sm:h-36'} bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-600 shadow-xl`}
                drag
                dragConstraints={containerRef}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded-full">
                  <span className="text-white text-[10px]">You</span>
                </div>
                {isMuted && (
                  <div className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-full">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                className="absolute top-16 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="line-clamp-2">{error}</span>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Controls Bar (when in call) - Mobile optimized */}
      {hasJoined && (
        <motion.footer
          className={`absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
            !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: showControls ? 1 : 0 }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {/* Mute */}
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="lg"
              className={`rounded-full ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}`}
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            >
              {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
            </Button>

            {/* Video */}
            <Button
              variant={!isVideoEnabled ? 'destructive' : 'secondary'}
              size="lg"
              className={`rounded-full ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}`}
              onClick={(e) => { e.stopPropagation(); toggleVideo(); }}
            >
              {isVideoEnabled ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
            </Button>

            {/* Switch Camera (mobile only) */}
            {isMobile && (
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-12 h-12"
                onClick={(e) => { e.stopPropagation(); switchCamera(); }}
              >
                <SwitchCamera className="w-5 h-5" />
              </Button>
            )}

            {/* Screen Share (desktop only) */}
            {!isMobile && (
              <Button
                variant={isScreenSharing ? 'default' : 'secondary'}
                size="lg"
                className={`rounded-full w-14 h-14 ${isScreenSharing ? 'bg-primary' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleScreenShare(); }}
                disabled={connectionState !== 'connected'}
              >
                {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
              </Button>
            )}

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              className={`rounded-full ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}`}
              onClick={(e) => { e.stopPropagation(); handleEndCall(); }}
            >
              <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
            </Button>

            {/* Fullscreen (desktop only) */}
            {!isMobile && (
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={(e) => { e.stopPropagation(); handleToggleFullscreen(); }}
              >
                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              </Button>
            )}
          </div>

          {/* Tap hint on mobile */}
          {isMobile && (
            <p className="text-center text-[10px] text-gray-500 mt-2">Tap anywhere to show/hide controls</p>
          )}
        </motion.footer>
      )}
    </div>
  );
};

export default VideoCallPage;

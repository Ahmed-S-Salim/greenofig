import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  Copy,
  Link,
  Settings,
  Maximize2,
  Minimize2,
  MessageSquare,
  Clock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  RotateCcw,
  PhoneMissed
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NativeVideoCall = ({ appointment, onClose, isOpen }) => {
  const { user, userProfile } = useAuth();
  const {
    showIncomingCallNotification,
    showMissedCallNotification,
    requestPermission,
    sendPushToUser
  } = usePushNotifications();
  const [roomId, setRoomId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callTimeout, setCallTimeout] = useState(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const ringtoneRef = useRef(null);
  const callChannelRef = useRef(null);
  const callStartTimeRef = useRef(null);

  // Generate room ID from appointment
  useEffect(() => {
    if (appointment?.id) {
      setRoomId(`gf-call-${appointment.id}`);
    }
  }, [appointment?.id]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when dialog is closed
      setCallDuration(0);
      setIsCalling(false);
      setIncomingCall(null);
      setIsFullscreen(false);
      setShowChat(false);
      setChatMessages([]);
      setNewMessage('');

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isOpen]);

  const {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    error,
    participants,
    localVideoRef,
    remoteVideoRef,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    initializeMedia
  } = useWebRTC(roomId);

  // Initialize ringtone audio
  useEffect(() => {
    // Create a simple ringtone using Web Audio API
    const createRingtone = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      const playTone = (frequency, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      return {
        play: () => {
          playTone(880, 0.2);
          setTimeout(() => playTone(880, 0.2), 300);
        },
        context: audioContext
      };
    };

    ringtoneRef.current = createRingtone();

    return () => {
      if (ringtoneRef.current?.context) {
        ringtoneRef.current.context.close();
      }
    };
  }, []);

  // Subscribe to call signaling channel
  useEffect(() => {
    if (!roomId || !user?.id) return;

    const channel = supabase.channel(`call-signal:${roomId}`);

    channel.on('broadcast', { event: 'incoming-call' }, async ({ payload }) => {
      if (payload.callerId !== user.id) {
        setIncomingCall(payload);
        callStartTimeRef.current = Date.now();

        // Save incoming call notification to database
        try {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'incoming_call',
            title: 'Incoming Call',
            message: `Video call from ${payload.callerName}`,
            is_read: false
          });
        } catch (err) {
          console.error('Error saving incoming call notification:', err);
        }

        // Play ringtone
        const ringInterval = setInterval(() => {
          ringtoneRef.current?.play();
        }, 1500);

        // Send push notification (works even if browser is in background or closed)
        await showIncomingCallNotification(
          payload.callerName,
          roomId,
          payload.callerId
        );

        // Auto-stop ringing and show missed call after 30 seconds
        const missedCallTimeout = setTimeout(async () => {
          clearInterval(ringInterval);
          setIncomingCall(null);

          // Send missed call notification
          await showMissedCallNotification(payload.callerName, roomId);

          // Also save missed call to database notifications
          try {
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'missed_call',
              title: 'Missed Call',
              message: `You missed a video call from ${payload.callerName}`,
              is_read: false
            });
          } catch (err) {
            console.error('Error saving missed call notification:', err);
          }
        }, 30000);

        // Store references for cleanup
        channel.ringInterval = ringInterval;
        channel.missedCallTimeout = missedCallTimeout;
      }
    });

    channel.on('broadcast', { event: 'call-ended' }, () => {
      if (channel.ringInterval) {
        clearInterval(channel.ringInterval);
      }
      if (channel.missedCallTimeout) {
        clearTimeout(channel.missedCallTimeout);
      }
      setIncomingCall(null);
    });

    channel.on('broadcast', { event: 'call-answered' }, () => {
      if (channel.ringInterval) {
        clearInterval(channel.ringInterval);
      }
      if (channel.missedCallTimeout) {
        clearTimeout(channel.missedCallTimeout);
      }
      setIsCalling(false);
    });

    // Handle when customer declines the call
    channel.on('broadcast', { event: 'call-declined' }, ({ payload }) => {
      if (channel.ringInterval) {
        clearInterval(channel.ringInterval);
      }
      if (channel.missedCallTimeout) {
        clearTimeout(channel.missedCallTimeout);
      }
      setIsCalling(false);
      setIncomingCall(null);

      // Notify the caller (nutritionist) that call was declined
      toast({
        variant: 'destructive',
        title: 'Call Declined',
        description: 'The client declined your call'
      });

      // End the call on caller side
      leaveRoom();
    });

    channel.subscribe();
    callChannelRef.current = channel;

    return () => {
      if (channel.ringInterval) {
        clearInterval(channel.ringInterval);
      }
      if (channel.missedCallTimeout) {
        clearTimeout(channel.missedCallTimeout);
      }
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id, showIncomingCallNotification, showMissedCallNotification]);

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

  // Handle start call with notification
  const handleStartCall = async () => {
    try {
      setIsCalling(true);
      callStartTimeRef.current = Date.now();

      const callPayload = {
        callerId: user?.id,
        callerName: userProfile?.full_name || 'Nutritionist',
        appointmentId: appointment?.id,
        roomId: roomId,
        timestamp: new Date().toISOString()
      };

      // Save outgoing call notification for the caller (nutritionist)
      try {
        await supabase.from('notifications').insert({
          user_id: user?.id,
          type: 'outgoing_call',
          title: 'Outgoing Call',
          message: `Video call to ${appointment?.client?.full_name || 'client'}`,
          is_read: true
        });
      } catch (err) {
        console.error('Error saving outgoing call notification:', err);
      }

      // Send call notification via room-specific channel
      if (callChannelRef.current) {
        callChannelRef.current.send({
          type: 'broadcast',
          event: 'incoming-call',
          payload: callPayload
        });
      }

      // Also send notification to client's personal channel (for global listener)
      if (appointment?.client_id) {
        const clientChannel = supabase.channel(`user-calls:${appointment.client_id}`);
        clientChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await clientChannel.send({
              type: 'broadcast',
              event: 'incoming-call',
              payload: callPayload
            });
            // Don't remove channel yet - keep it for call-declined notification
          }
        });

        // Send Web Push notification (works even if browser is closed!)
        sendPushToUser(
          appointment.client_id,
          `Incoming Call from ${userProfile?.full_name || 'Your Nutritionist'}`,
          'Tap to answer the video call',
          {
            tag: 'greenofig-video-call',
            requireInteraction: true,
            data: {
              type: 'incoming_call',
              roomId: roomId,
              callerId: user?.id,
              callUrl: `/call/${roomId}`
            },
            actions: [
              { action: 'answer', title: 'Answer' },
              { action: 'decline', title: 'Decline' }
            ]
          }
        );
      }

      await joinRoom();

      toast({
        title: 'Calling...',
        description: 'Waiting for participant to answer'
      });
    } catch (err) {
      setIsCalling(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not start call. Please check camera/microphone permissions.'
      });
    }
  };

  // Handle answer incoming call
  const handleAnswerCall = async () => {
    try {
      if (callChannelRef.current) {
        callChannelRef.current.send({
          type: 'broadcast',
          event: 'call-answered',
          payload: { answeredBy: user?.id }
        });
      }

      setIncomingCall(null);
      await joinRoom();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not join call.'
      });
    }
  };

  // Handle decline incoming call
  const handleDeclineCall = () => {
    if (callChannelRef.current) {
      // Send call-declined event so the caller (nutritionist) gets notified
      callChannelRef.current.send({
        type: 'broadcast',
        event: 'call-declined',
        payload: {
          declinedBy: user?.id,
          declinedAt: new Date().toISOString()
        }
      });
    }
    setIncomingCall(null);
  };

  // Handle end call
  const handleEndCall = async () => {
    const duration = callDuration;

    if (callChannelRef.current) {
      try {
        await callChannelRef.current.send({
          type: 'broadcast',
          event: 'call-ended',
          payload: { endedBy: user?.id }
        });
      } catch (e) {
        console.log('Could not send call-ended event');
      }
    }

    await leaveRoom();

    // Save completed call notification with duration (only if call was connected)
    if (duration > 0) {
      try {
        await supabase.from('notifications').insert({
          user_id: user?.id,
          type: 'completed_call',
          title: 'Call Completed',
          message: `Video call with ${appointment?.client?.full_name || 'participant'} - ${formatDuration(duration)}`,
          is_read: true
        });
      } catch (err) {
        console.error('Error saving completed call notification:', err);
      }
    }

    // Reset all call-specific state
    setCallDuration(0);
    setIsCalling(false);
    setIncomingCall(null);

    // Clear any pending timeouts
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    toast({
      title: 'Call ended',
      description: `Call duration: ${formatDuration(duration)}`
    });
  };

  // Copy room link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/call/${roomId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied!',
      description: 'Share this link with your client to join the call'
    });
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Switch camera (mobile)
  const handleSwitchCamera = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const constraints = videoTrack.getConstraints();
        const newFacingMode = constraints.facingMode === 'user' ? 'environment' : 'user';

        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newFacingMode },
            audio: true
          });

          const newVideoTrack = newStream.getVideoTracks()[0];
          videoTrack.stop();

          // Replace track in local stream
          localStream.removeTrack(videoTrack);
          localStream.addTrack(newVideoTrack);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        } catch (err) {
          console.error('Error switching camera:', err);
        }
      }
    }
  };

  // Connection status badge
  const getStatusBadge = () => {
    switch (connectionState) {
      case 'connecting':
        return <Badge variant="secondary" className="animate-pulse text-xs"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Connecting...</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-500 text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Connected</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Ready</Badge>;
    }
  };

  if (!isOpen) return null;

  // Incoming call modal
  if (incomingCall) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 animate-pulse">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Incoming Call</h2>
            <p className="text-muted-foreground mb-6">{incomingCall.callerName} is calling...</p>

            <div className="flex gap-4">
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
                onClick={handleDeclineCall}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                onClick={handleAnswerCall}
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl h-[100dvh] sm:h-[85vh] p-0 overflow-hidden">
        <div ref={containerRef} className="flex flex-col h-full bg-gray-900">
          {/* Header - Responsive */}
          <div className="flex items-center justify-between p-2 sm:p-4 bg-gray-800/50 border-b border-gray-700">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base truncate">{appointment?.title || 'Video Call'}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate hidden sm:block">
                  {appointment?.client?.full_name || 'Client'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              {getStatusBadge()}
              {connectionState === 'connected' && (
                <Badge variant="outline" className="text-white border-gray-600 text-xs hidden sm:flex">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(callDuration)}
                </Badge>
              )}
              <Badge variant="outline" className="text-white border-gray-600 text-xs">
                <Users className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">{participants.length}</span>
              </Badge>
            </div>
          </div>

          {/* Video Area - Responsive */}
          <div className="flex-1 relative p-2 sm:p-4 overflow-hidden">
            {connectionState === 'disconnected' ? (
              // Pre-call screen - Mobile optimized
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="relative mb-4 sm:mb-6 w-full max-w-xs sm:max-w-sm">
                  {/* Local video preview */}
                  <div className="w-full aspect-[4/3] bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-700">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {!localStream && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-xs sm:text-sm">Camera preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 text-center">Ready to join?</h2>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base text-center">
                  {appointment?.client?.full_name || 'Participant'}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6 w-full max-w-xs">
                  <Button
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 gap-2 w-full sm:w-auto"
                    onClick={handleStartCall}
                    disabled={isCalling}
                  >
                    {isCalling ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Calling...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5" />
                        Start Call
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-gray-600 text-white hover:bg-gray-800 w-full sm:w-auto"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </Button>
                </div>

                <div className="flex gap-2 sm:gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-gray-400 hover:text-white ${isMuted ? 'text-red-400' : ''}`}
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff className="w-4 h-4 sm:mr-2" /> : <Mic className="w-4 h-4 sm:mr-2" />}
                    <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-gray-400 hover:text-white ${!isVideoEnabled ? 'text-red-400' : ''}`}
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video className="w-4 h-4 sm:mr-2" /> : <VideoOff className="w-4 h-4 sm:mr-2" />}
                    <span className="hidden sm:inline">{isVideoEnabled ? 'Stop Video' : 'Start Video'}</span>
                  </Button>
                </div>
              </div>
            ) : (
              // In-call view - Mobile optimized
              <div className="relative h-full">
                {/* Remote Video (main) - Full screen on mobile */}
                <div className="absolute inset-0 bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!remoteStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-2 sm:mb-4 animate-spin" />
                        <p className="text-gray-400 text-sm sm:text-base">Waiting for participant...</p>
                      </div>
                    </div>
                  )}
                  {remoteStream && (
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/50 px-2 py-1 sm:px-3 rounded-full">
                      <span className="text-white text-xs sm:text-sm">
                        {appointment?.client?.full_name || 'Participant'}
                      </span>
                    </div>
                  )}

                  {/* Call duration overlay on mobile */}
                  {connectionState === 'connected' && (
                    <div className="absolute top-2 left-2 sm:hidden bg-black/50 px-2 py-1 rounded-full">
                      <span className="text-white text-xs">{formatDuration(callDuration)}</span>
                    </div>
                  )}
                </div>

                {/* Local Video (picture-in-picture) - Smaller on mobile */}
                <motion.div
                  className="absolute bottom-20 sm:bottom-24 right-2 sm:right-4 w-24 h-32 sm:w-36 sm:h-48 md:w-48 md:h-36 bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-600 shadow-lg"
                  drag
                  dragConstraints={containerRef}
                  whileTap={{ scale: 0.95 }}
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
                      <User className="w-6 h-6 sm:w-10 sm:h-10 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/50 px-1.5 py-0.5 sm:px-2 rounded-full">
                    <span className="text-white text-[10px] sm:text-xs">You</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 bg-red-500/90 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{error}</span>
                <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="p-1">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Controls Bar - Mobile optimized */}
          <div className="p-2 sm:p-4 bg-gray-800/50 border-t border-gray-700 safe-area-bottom">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {/* Mute button */}
              <Button
                variant={isMuted ? 'destructive' : 'secondary'}
                size="lg"
                className="rounded-full w-11 h-11 sm:w-14 sm:h-14"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
              </Button>

              {/* Video button */}
              <Button
                variant={!isVideoEnabled ? 'destructive' : 'secondary'}
                size="lg"
                className="rounded-full w-11 h-11 sm:w-14 sm:h-14"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
              </Button>

              {/* Switch camera button (mobile only) */}
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-11 h-11 sm:hidden"
                onClick={handleSwitchCamera}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              {/* Screen share button (desktop only) */}
              <Button
                variant={isScreenSharing ? 'default' : 'secondary'}
                size="lg"
                className={`rounded-full w-14 h-14 hidden sm:flex ${isScreenSharing ? 'bg-primary' : ''}`}
                onClick={toggleScreenShare}
                disabled={connectionState !== 'connected'}
              >
                {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
              </Button>

              {/* End/Start call button */}
              {connectionState === 'disconnected' ? (
                <Button
                  size="lg"
                  className="rounded-full w-11 h-11 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600"
                  onClick={handleStartCall}
                  disabled={isCalling}
                >
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-11 h-11 sm:w-14 sm:h-14"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              )}

              {/* Fullscreen button (desktop only) */}
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14 hidden sm:flex"
                onClick={handleToggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              </Button>

              {/* Copy link button */}
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-11 h-11 sm:w-14 sm:h-14"
                onClick={handleCopyLink}
              >
                <Link className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NativeVideoCall;

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// This component listens for incoming calls globally
// Add it to your main app layout to receive calls anywhere
const GlobalCallListener = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const {
    showIncomingCallNotification,
    showMissedCallNotification,
    requestPermission,
    isSupported
  } = usePushNotifications();
  const [incomingCall, setIncomingCall] = useState(null);
  const ringtoneRef = useRef(null);
  const channelRef = useRef(null);

  // Request notification permission on mount
  useEffect(() => {
    if (isSupported) {
      requestPermission();
    }
  }, [isSupported, requestPermission]);

  // Initialize ringtone
  useEffect(() => {
    const createRingtone = () => {
      try {
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
            // Resume audio context if suspended (browser autoplay policy)
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }
            playTone(880, 0.2);
            setTimeout(() => playTone(880, 0.2), 300);
          },
          context: audioContext
        };
      } catch (error) {
        console.error('Error creating ringtone:', error);
        return null;
      }
    };

    ringtoneRef.current = createRingtone();

    return () => {
      if (ringtoneRef.current?.context) {
        ringtoneRef.current.context.close();
      }
    };
  }, []);

  // Subscribe to user's personal call channel
  useEffect(() => {
    if (!user?.id) return;

    // Listen on a user-specific channel for calls
    const channel = supabase.channel(`user-calls:${user.id}`);

    channel.on('broadcast', { event: 'incoming-call' }, async ({ payload }) => {
      console.log('Global: Incoming call received', payload);

      setIncomingCall(payload);

      // Play ringtone
      const ringInterval = setInterval(() => {
        ringtoneRef.current?.play();
      }, 1500);

      // Send push notification
      await showIncomingCallNotification(
        payload.callerName,
        payload.roomId,
        payload.callerId
      );

      // Auto-dismiss and show missed call after 30 seconds
      const missedCallTimeout = setTimeout(async () => {
        clearInterval(ringInterval);
        setIncomingCall(null);

        // Show missed call notification
        await showMissedCallNotification(payload.callerName, payload.roomId);

        // Save to database
        try {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'appointment_scheduled',
            title: 'Missed Call',
            message: `You missed a video call from ${payload.callerName}`,
            is_read: false
          });
        } catch (err) {
          console.error('Error saving missed call:', err);
        }
      }, 30000);

      channel.ringInterval = ringInterval;
      channel.missedCallTimeout = missedCallTimeout;
    });

    channel.on('broadcast', { event: 'call-cancelled' }, () => {
      if (channel.ringInterval) clearInterval(channel.ringInterval);
      if (channel.missedCallTimeout) clearTimeout(channel.missedCallTimeout);
      setIncomingCall(null);
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channel.ringInterval) clearInterval(channel.ringInterval);
      if (channel.missedCallTimeout) clearTimeout(channel.missedCallTimeout);
      supabase.removeChannel(channel);
    };
  }, [user?.id, showIncomingCallNotification, showMissedCallNotification]);

  // Listen for service worker messages (for background notifications)
  useEffect(() => {
    const handleAnswerFromSW = (event) => {
      const { roomId } = event.detail;
      if (roomId) {
        navigate(`/call/${roomId}`);
      }
    };

    const handleDeclineFromSW = () => {
      setIncomingCall(null);
      if (channelRef.current?.ringInterval) {
        clearInterval(channelRef.current.ringInterval);
      }
    };

    window.addEventListener('answerCall', handleAnswerFromSW);
    window.addEventListener('declineCall', handleDeclineFromSW);

    return () => {
      window.removeEventListener('answerCall', handleAnswerFromSW);
      window.removeEventListener('declineCall', handleDeclineFromSW);
    };
  }, [navigate]);

  const handleAnswer = () => {
    if (channelRef.current?.ringInterval) {
      clearInterval(channelRef.current.ringInterval);
    }
    if (channelRef.current?.missedCallTimeout) {
      clearTimeout(channelRef.current.missedCallTimeout);
    }

    // Navigate to call page
    navigate(`/call/${incomingCall.roomId}`);
    setIncomingCall(null);
  };

  const handleDecline = () => {
    if (channelRef.current?.ringInterval) {
      clearInterval(channelRef.current.ringInterval);
    }
    if (channelRef.current?.missedCallTimeout) {
      clearTimeout(channelRef.current.missedCallTimeout);
    }

    // Notify caller that call was declined
    if (channelRef.current && incomingCall) {
      const callerChannel = supabase.channel(`user-calls:${incomingCall.callerId}`);
      callerChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await callerChannel.send({
            type: 'broadcast',
            event: 'call-declined',
            payload: { declinedBy: user?.id }
          });
          supabase.removeChannel(callerChannel);
        }
      });
    }

    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 animate-pulse">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Incoming Video Call</h2>
          <p className="text-muted-foreground mb-6">{incomingCall.callerName} is calling...</p>

          <div className="flex gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={handleDecline}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
              onClick={handleAnswer}
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalCallListener;

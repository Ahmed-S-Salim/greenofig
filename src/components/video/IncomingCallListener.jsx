import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global Incoming Call Listener
 * This component runs at the app level and listens for incoming video calls
 * for the logged-in user across all pages.
 */
const IncomingCallListener = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);
  const channelRef = useRef(null);
  const ringtoneIntervalRef = useRef(null);
  const missedCallTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);

  // Create ringtone
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Could not create audio context');
    }

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // Play ringtone sound
  const playRingtone = () => {
    if (!audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Play two tones for ringtone effect
      const playTone = (freq, delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      };

      playTone(880, 0);
      playTone(880, 0.4);
    } catch (e) {
      console.log('Error playing ringtone');
    }
  };

  // Stop ringtone
  const stopRingtone = () => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (missedCallTimeoutRef.current) {
      clearTimeout(missedCallTimeoutRef.current);
      missedCallTimeoutRef.current = null;
    }
  };

  // Subscribe to incoming calls
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to user's personal call channel
    const channel = supabase.channel(`user-calls:${user.id}`);

    channel.on('broadcast', { event: 'incoming-call' }, async (payload) => {
      console.log('[IncomingCallListener] Incoming call:', payload);

      const callData = payload.payload;

      // Don't show if already have an incoming call
      if (incomingCall) return;

      // Set incoming call
      setIncomingCall(callData);

      // Save incoming call notification to database
      try {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'incoming_call',
          title: 'Incoming Call',
          message: `Video call from ${callData.callerName || 'your nutritionist'}`,
          is_read: false
        });
      } catch (err) {
        console.error('Error saving incoming call notification:', err);
      }

      // Start ringtone
      playRingtone();
      ringtoneIntervalRef.current = setInterval(playRingtone, 1500);

      // Auto-decline after 30 seconds and mark as missed
      missedCallTimeoutRef.current = setTimeout(async () => {
        stopRingtone();
        setIncomingCall(null);

        // Save missed call notification
        try {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'missed_call',
            title: 'Missed Call',
            message: `You missed a video call from ${callData.callerName || 'your nutritionist'}`,
            is_read: false
          });
        } catch (err) {
          console.error('Error saving missed call notification:', err);
        }

        toast({
          title: 'Missed Call',
          description: `You missed a call from ${callData.callerName || 'your nutritionist'}`,
        });
      }, 30000);
    });

    channel.on('broadcast', { event: 'call-ended' }, () => {
      stopRingtone();
      setIncomingCall(null);
    });

    channel.subscribe((status) => {
      console.log('[IncomingCallListener] Channel status:', status);
    });

    channelRef.current = channel;

    return () => {
      stopRingtone();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id]);

  // Handle answer
  const handleAnswer = () => {
    stopRingtone();

    if (incomingCall?.roomId) {
      // Navigate to call page
      navigate(`/call/${incomingCall.roomId}`);
    }

    setIncomingCall(null);
  };

  // Handle decline
  const handleDecline = async () => {
    stopRingtone();

    // Send decline event back to caller
    if (incomingCall?.roomId && channelRef.current) {
      const callChannel = supabase.channel(`call-signal:${incomingCall.roomId}`);
      callChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await callChannel.send({
            type: 'broadcast',
            event: 'call-declined',
            payload: {
              declinedBy: user?.id,
              declinedAt: new Date().toISOString()
            }
          });
          supabase.removeChannel(callChannel);
        }
      });
    }

    setIncomingCall(null);

    toast({
      title: 'Call Declined',
      description: 'You declined the incoming call',
    });
  };

  if (!incomingCall) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8">
          <div className="flex flex-col items-center text-center">
            {/* Caller Avatar */}
            <motion.div
              className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0 rgba(255,255,255,0.4)',
                  '0 0 0 20px rgba(255,255,255,0)',
                  '0 0 0 0 rgba(255,255,255,0)'
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Video className="w-12 h-12 text-white" />
            </motion.div>

            {/* Caller Info */}
            <h2 className="text-2xl font-bold text-white mb-2">Incoming Video Call</h2>
            <p className="text-white/90 text-lg mb-1">
              {incomingCall.callerName || 'Your Nutritionist'}
            </p>
            <p className="text-white/70 text-sm mb-8">is calling you...</p>

            {/* Answer/Decline Buttons */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-16 h-16 mb-2"
                  onClick={handleDecline}
                >
                  <PhoneOff className="w-7 h-7" />
                </Button>
                <span className="text-white/80 text-sm">Decline</span>
              </div>

              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-green-600 mb-2"
                    onClick={handleAnswer}
                  >
                    <Phone className="w-7 h-7" />
                  </Button>
                </motion.div>
                <span className="text-white/80 text-sm">Answer</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallListener;

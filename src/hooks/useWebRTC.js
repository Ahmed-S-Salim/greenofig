import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * WebRTC Video Call Hook - Improved Version
 * Uses Supabase Realtime for signaling between peers
 * Better error handling, video quality, and reliability
 */
export const useWebRTC = (roomId) => {
  const { user, profile } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [callQuality, setCallQuality] = useState('good'); // good, medium, poor

  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const channelRef = useRef(null);
  const screenStreamRef = useRef(null);
  const originalVideoTrackRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  // Enhanced ICE servers with more STUN servers for better connectivity
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun.stunprotocol.org:3478' },
      { urls: 'stun:stun.voip.eutelia.it:3478' },
    ],
    iceCandidatePoolSize: 10,
  };

  // Get optimal video constraints based on device
  const getVideoConstraints = useCallback((quality = 'high') => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const constraints = {
      high: {
        width: { ideal: isMobile ? 1280 : 1920, max: 1920 },
        height: { ideal: isMobile ? 720 : 1080, max: 1080 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: 'user'
      },
      medium: {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 24, max: 30 },
        facingMode: 'user'
      },
      low: {
        width: { ideal: 320, max: 640 },
        height: { ideal: 240, max: 480 },
        frameRate: { ideal: 15, max: 24 },
        facingMode: 'user'
      }
    };

    return constraints[quality] || constraints.high;
  }, []);

  // Initialize local media stream with fallback
  const initializeMedia = useCallback(async (videoEnabled = true, audioEnabled = true) => {
    try {
      setError(null);

      // Try high quality first, fall back to lower if fails
      let stream = null;
      const qualities = ['high', 'medium', 'low'];

      for (const quality of qualities) {
        try {
          const videoConstraints = videoEnabled ? getVideoConstraints(quality) : false;

          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: audioEnabled ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 1
            } : false
          });

          console.log(`[WebRTC] Media initialized with ${quality} quality`);
          setCallQuality(quality === 'high' ? 'good' : quality === 'medium' ? 'medium' : 'poor');
          break;
        } catch (err) {
          console.log(`[WebRTC] Failed with ${quality} quality, trying lower...`);
          if (quality === 'low') throw err;
        }
      }

      if (!stream) {
        // Last resort: try audio only
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: audioEnabled
        });
        setIsVideoEnabled(false);
        console.log('[WebRTC] Falling back to audio only');
      }

      setLocalStream(stream);
      setIsVideoEnabled(videoEnabled && stream.getVideoTracks().length > 0);
      setIsMuted(!audioEnabled);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('[WebRTC] Error accessing media devices:', err);

      // Provide more specific error messages
      let errorMessage = 'Could not access camera/microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera/microphone permission denied. Please allow access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera/microphone is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not support the requested resolution.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getVideoConstraints]);

  // Create peer connection with improved settings
  const createPeerConnection = useCallback((stream) => {
    const pc = new RTCPeerConnection(iceServers);

    // Add local tracks to peer connection
    if (stream) {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    }

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind);
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && channelRef.current) {
        try {
          await channelRef.current.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: {
              candidate: event.candidate.toJSON(),
              from: user?.id
            }
          });
        } catch (err) {
          console.error('[WebRTC] Error sending ICE candidate:', err);
        }
      }
    };

    // Handle ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log('[WebRTC] ICE gathering state:', pc.iceGatheringState);
    };

    // Handle connection state changes with reconnection logic
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);

      if (pc.connectionState === 'failed') {
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`[WebRTC] Connection failed, attempting reconnect ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          // Try to restart ICE
          pc.restartIce();
        } else {
          setError('Connection failed after multiple attempts. Please try again.');
        }
      } else if (pc.connectionState === 'connected') {
        reconnectAttempts.current = 0;
        setError(null);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);

      if (pc.iceConnectionState === 'disconnected') {
        // Connection temporarily lost, might recover
        console.log('[WebRTC] Connection temporarily lost...');
      } else if (pc.iceConnectionState === 'failed') {
        // Try to restart ICE
        console.log('[WebRTC] ICE failed, restarting...');
        pc.restartIce();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [user?.id]);

  // Join a video call room with improved reliability
  const joinRoom = useCallback(async () => {
    if (!roomId || !user?.id) {
      setError('Room ID and user authentication required');
      return;
    }

    setConnectionState('connecting');
    setError(null);
    reconnectAttempts.current = 0;

    try {
      // Initialize local media
      const stream = await initializeMedia();

      // Create peer connection
      const pc = createPeerConnection(stream);

      // Subscribe to Supabase Realtime channel for signaling
      const channel = supabase.channel(`video-call:${roomId}`, {
        config: {
          presence: { key: user.id },
          broadcast: { self: false }
        }
      });

      channelRef.current = channel;

      // Handle presence (who's in the room)
      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState).map(key => ({
          id: key,
          ...presenceState[key][0]
        }));
        setParticipants(users);
        console.log('[WebRTC] Participants:', users.length);
      });

      channel.on('presence', { event: 'join' }, async ({ key, newPresences }) => {
        console.log('[WebRTC] User joined:', key);
        // If we're not the joiner and we have a peer connection, create and send offer
        if (key !== user.id && peerConnectionRef.current) {
          try {
            const offer = await peerConnectionRef.current.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            await peerConnectionRef.current.setLocalDescription(offer);

            channel.send({
              type: 'broadcast',
              event: 'offer',
              payload: {
                offer: peerConnectionRef.current.localDescription.toJSON(),
                from: user.id,
                to: key
              }
            });
          } catch (err) {
            console.error('[WebRTC] Error creating offer:', err);
          }
        }
      });

      channel.on('presence', { event: 'leave' }, ({ key }) => {
        console.log('[WebRTC] User left:', key);
        if (remoteStream) {
          remoteStream.getTracks().forEach(track => track.stop());
          setRemoteStream(null);
        }
      });

      // Handle signaling messages
      channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.to === user.id && peerConnectionRef.current) {
          try {
            console.log('[WebRTC] Received offer from:', payload.from);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            channel.send({
              type: 'broadcast',
              event: 'answer',
              payload: {
                answer: peerConnectionRef.current.localDescription.toJSON(),
                from: user.id,
                to: payload.from
              }
            });
          } catch (err) {
            console.error('[WebRTC] Error handling offer:', err);
          }
        }
      });

      channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.to === user.id && peerConnectionRef.current) {
          try {
            console.log('[WebRTC] Received answer from:', payload.from);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
          } catch (err) {
            console.error('[WebRTC] Error handling answer:', err);
          }
        }
      });

      channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.from !== user.id && peerConnectionRef.current) {
          try {
            if (payload.candidate) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
            }
          } catch (err) {
            console.error('[WebRTC] Error adding ICE candidate:', err);
          }
        }
      });

      // Subscribe and track presence
      await channel.subscribe(async (status) => {
        console.log('[WebRTC] Channel status:', status);
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: profile?.full_name || 'Anonymous',
            joinedAt: new Date().toISOString()
          });
        }
      });

    } catch (err) {
      console.error('[WebRTC] Error joining room:', err);
      setError(err.message || 'Failed to join call');
      setConnectionState('failed');
    }
  }, [roomId, user?.id, profile?.full_name, initializeMedia, createPeerConnection]);

  // Leave the video call
  const leaveRoom = useCallback(async () => {
    console.log('[WebRTC] Leaving room...');

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setLocalStream(null);
    }

    // Stop remote stream
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setRemoteStream(null);
    }

    // Stop screen share if active
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    // Clear video refs
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Unsubscribe from channel
    if (channelRef.current) {
      try {
        await supabase.removeChannel(channelRef.current);
      } catch (e) {
        console.log('[WebRTC] Channel already removed');
      }
      channelRef.current = null;
    }

    // Reset all state
    setConnectionState('disconnected');
    setParticipants([]);
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
    setError(null);
    setCallQuality('good');
    originalVideoTrackRef.current = null;
    reconnectAttempts.current = 0;
  }, [localStream, remoteStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [localStream, isVideoEnabled]);

  // Switch camera (for mobile devices)
  const switchCamera = useCallback(async () => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace in local stream
      localStream.removeTrack(videoTrack);
      localStream.addTrack(newVideoTrack);
      videoTrack.stop();

      // Replace in peer connection
      if (peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } catch (err) {
      console.error('[WebRTC] Error switching camera:', err);
      setError('Could not switch camera');
    }
  }, [localStream]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current) return;

    if (isScreenSharing) {
      // Stop screen sharing, restore camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }

      // Replace screen track with original video track
      if (originalVideoTrackRef.current && peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(originalVideoTrackRef.current);
        }
      }

      setIsScreenSharing(false);
    } else {
      try {
        // Get screen share stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });

        screenStreamRef.current = screenStream;

        // Save original video track
        if (localStream) {
          const videoTracks = localStream.getVideoTracks();
          if (videoTracks.length > 0) {
            originalVideoTrackRef.current = videoTracks[0];
          }
        }

        // Replace video track with screen share
        const screenTrack = screenStream.getVideoTracks()[0];
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        }

        // Handle when user stops screen share via browser UI
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error('[WebRTC] Error sharing screen:', err);
        if (err.name !== 'AbortError') {
          setError('Could not share screen. Please check permissions.');
        }
      }
    }
  }, [isScreenSharing, localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  return {
    // State
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    error,
    participants,
    callQuality,

    // Refs for video elements
    localVideoRef,
    remoteVideoRef,

    // Actions
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    switchCamera,
    initializeMedia
  };
};

export default useWebRTC;

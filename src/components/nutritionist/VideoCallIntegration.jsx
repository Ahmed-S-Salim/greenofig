import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  Users,
  Link,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  Settings,
  Loader2,
  CheckCircle
} from 'lucide-react';

const VideoCallIntegration = ({ appointment, onClose }) => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [meetingLink, setMeetingLink] = useState(appointment?.meeting_link || '');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  // Meeting providers configuration
  const providers = [
    {
      id: 'zoom',
      name: 'Zoom',
      logo: '/zoom-logo.png',
      description: 'Video conferencing with up to 100 participants',
      createUrl: 'https://zoom.us/meeting/schedule'
    },
    {
      id: 'google-meet',
      name: 'Google Meet',
      logo: '/meet-logo.png',
      description: 'Free video meetings from Google',
      createUrl: 'https://meet.google.com/new'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      logo: '/teams-logo.png',
      description: 'Enterprise video conferencing',
      createUrl: 'https://teams.microsoft.com/'
    }
  ];

  const generateMeetingId = () => {
    return `gf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  };

  const handleCreateMeeting = async (provider) => {
    setGeneratingLink(true);
    try {
      // For now, we'll open the provider's create meeting page
      // In production, this would integrate with their APIs
      window.open(provider.createUrl, '_blank');

      toast({
        title: 'Create Meeting',
        description: `Create your meeting in ${provider.name}, then paste the link here`
      });
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      toast({
        title: 'Link copied!',
        description: 'Meeting link copied to clipboard'
      });
    }
  };

  const handleJoinCall = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
      setCallStatus('connecting');
    } else {
      toast({
        variant: 'destructive',
        title: 'No meeting link',
        description: 'Please add a meeting link first'
      });
    }
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    toast({
      title: 'Call ended',
      description: 'The video call has been ended'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Video Call
          </DialogTitle>
        </DialogHeader>

        {appointment && (
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{appointment.title}</h3>
                <p className="text-sm text-muted-foreground">
                  With {appointment.client?.full_name || 'Client'}
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'No date'}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} ({appointment.duration_minutes || 60} min)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Link Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link className="w-4 h-4" />
              Meeting Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Paste meeting link (Zoom, Google Meet, etc.)"
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleCopyLink} disabled={!meetingLink}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(true)}>
                Create New
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Video Preview / Call Status */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            {callStatus === 'idle' && (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Video className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to Join</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Join Call" to start your video consultation
                </p>
              </div>
            )}

            {callStatus === 'connecting' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connecting...</h3>
                <p className="text-muted-foreground">
                  Opening meeting in new tab
                </p>
              </div>
            )}

            {callStatus === 'connected' && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Call in Progress</h3>
                <p className="text-muted-foreground">
                  Your meeting is open in another tab
                </p>
              </div>
            )}

            {callStatus === 'ended' && (
              <div className="text-center py-8">
                <PhoneOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Call Ended</h3>
                <p className="text-muted-foreground">
                  The video call has been ended
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? 'destructive' : 'outline'}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            variant={isVideoOn ? 'outline' : 'destructive'}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          {callStatus === 'idle' || callStatus === 'ended' ? (
            <Button
              size="lg"
              className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600"
              onClick={handleJoinCall}
            >
              <Phone className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={handleEndCall}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => meetingLink && window.open(meetingLink, '_blank')}
          >
            <ExternalLink className="w-6 h-6" />
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="bg-primary/5 p-4 rounded-lg mt-4">
          <h4 className="font-semibold text-sm mb-2">Quick Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Test your audio and video before the call</li>
            <li>- Ensure good lighting and a quiet environment</li>
            <li>- Have client notes ready for reference</li>
            <li>- Share meeting link with client via message</li>
          </ul>
        </div>

        {/* Create Meeting Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Meeting</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Choose a video conferencing platform to create your meeting:
              </p>

              <div className="space-y-3">
                {providers.map(provider => (
                  <Card
                    key={provider.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleCreateMeeting(provider)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{provider.name}</h4>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Or paste any meeting link:
                </p>
                <Input
                  placeholder="https://..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowLinkDialog(false)} disabled={!meetingLink}>
                Save Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallIntegration;

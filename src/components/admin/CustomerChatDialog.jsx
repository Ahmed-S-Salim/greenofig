import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  MessageCircle, Send, Smile, Paperclip, Gift, Tag, Image as ImageIcon,
  FileText, Check, CheckCheck, Clock
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

// Common emojis for quick access
const QUICK_EMOJIS = [
  '👋', '😊', '👍', '❤️', '🎉', '🔥', '⭐', '✅',
  '💪', '🙌', '👏', '🎊', '💯', '✨', '🚀', '🎯',
  '😀', '😃', '😄', '😁', '🤗', '🥳', '😎', '🤩'
];

const CustomerChatDialog = ({ isOpen, onClose, customer }) => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && customer) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [isOpen, customer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userProfile.id},recipient_id.eq.${customer.id}),and(sender_id.eq.${customer.id},recipient_id.eq.${userProfile.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        toast({
          title: 'Chat Feature Not Set Up',
          description: 'The messages table needs to be created in the database.',
          variant: 'default'
        });
        setMessages([]);
      } else {
        toast({ title: 'Error loading messages', description: error.message, variant: 'destructive' });
      }
    } else {
      setMessages(data || []);
      markMessagesAsRead();
    }
  };

  const markMessagesAsRead = async () => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', userProfile.id)
      .eq('sender_id', customer.id)
      .eq('is_read', false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${customer.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          markMessagesAsRead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e, messageType = 'text', additionalData = {}) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && messageType === 'text') return;

    setLoading(true);

    const messageData = {
      sender_id: userProfile.id,
      recipient_id: customer.id,
      message_text: newMessage,
      sender_role: userProfile.role,
      recipient_role: customer.role,
      message_type: messageType,
      is_read: false,
      ...additionalData
    };

    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    } else {
      setMessages((prev) => [...prev, { ...messageData, id: Date.now(), created_at: new Date().toISOString() }]);
      setNewMessage('');

      // Show success notification for special message types
      if (messageType === 'offer') {
        // Already shown in handleSendQuickOffer
      } else {
        // For regular messages, show subtle confirmation
        toast({
          title: 'Message sent',
          description: `Your message was delivered to ${customer.full_name}`,
          duration: 2000
        });
      }
    }

    setLoading(false);
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendQuickOffer = async (offerType) => {
    const offerMessages = {
      'discount_10': '🎉 Special offer for you! Get 10% off your next subscription renewal. Use code: LOYAL10',
      'discount_20': '🔥 Exclusive! 20% discount on all premium plans. Code: VIP20',
      'free_month': '🎁 As a valued customer, enjoy 1 month FREE on us! Auto-applied to your account.',
      'upgrade': '⭐ Upgrade to Premium and get 2 months for the price of 1!',
      'trial': '✨ Try our Elite plan FREE for 14 days - no credit card required!'
    };

    await handleSendMessage(null, 'offer', {
      message_text: offerMessages[offerType],
      offer_type: offerType
    });

    toast({
      title: 'Offer Sent!',
      description: 'The special offer has been sent to the customer.'
    });
  };

  const handleSendQuickReply = (reply) => {
    const quickReplies = {
      'welcome': 'Hi! 👋 Thanks for reaching out. How can I help you today?',
      'thanks': 'Thank you for contacting us! We appreciate your patience. 🙏',
      'checking': 'Let me check that for you right away... ⏳',
      'resolved': 'Great! I\'m glad we could resolve that for you. ✅',
      'followup': 'Is there anything else I can help you with today? 😊'
    };

    setNewMessage(quickReplies[reply]);
  };

  const handleFileAttachment = () => {
    toast({
      title: 'File Upload Coming Soon!',
      description: 'File attachment feature will be available in the next update.',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderMessageStatus = (msg) => {
    if (msg.sender_id !== userProfile.id) return null;

    return (
      <span className="inline-flex items-center gap-1">
        {msg.is_read ? (
          <CheckCheck className="w-3 h-3 text-blue-400" />
        ) : (
          <Check className="w-3 h-3 text-text-secondary" />
        )}
      </span>
    );
  };

  const renderMessage = (msg) => {
    const isFromAdmin = msg.sender_id === userProfile.id;

    if (msg.message_type === 'offer') {
      return (
        <div className={`p-3 rounded-lg border-2 border-primary/50 ${
          isFromAdmin ? 'bg-primary/20 text-primary-foreground' : 'bg-primary/10 text-foreground'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4" />
            <Badge variant="secondary" className="text-xs">Special Offer</Badge>
          </div>
          <p className="text-sm">{msg.message_text}</p>
        </div>
      );
    }

    return (
      <div className={`p-3 rounded-lg ${
        isFromAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 pb-3 border-b border-border">
          <DialogTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={customer?.profile_picture_url} />
                <AvatarFallback className="text-xs">{getInitials(customer?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{customer?.full_name}</p>
                <p className="text-xs text-text-secondary truncate">{customer?.email}</p>
              </div>
            </div>

            {/* Quick Actions - Compact */}
            <div className="flex gap-1 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Gift className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-effect w-48">
                  <DropdownMenuLabel className="text-xs">Send Offer</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSendQuickOffer('discount_10')} className="text-xs">
                    <Tag className="w-3 h-3 mr-2" />
                    10% Discount
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendQuickOffer('discount_20')} className="text-xs">
                    <Tag className="w-3 h-3 mr-2" />
                    20% VIP Discount
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendQuickOffer('free_month')} className="text-xs">
                    <Gift className="w-3 h-3 mr-2" />
                    1 Month Free
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendQuickOffer('upgrade')} className="text-xs">
                    <Badge className="w-3 h-3 mr-2" />
                    Premium Upgrade
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendQuickOffer('trial')} className="text-xs">
                    <Clock className="w-3 h-3 mr-2" />
                    14-Day Trial
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileText className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-effect w-44">
                  <DropdownMenuLabel className="text-xs">Quick Replies</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSendQuickReply('welcome')} className="text-xs">
                    👋 Welcome
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendQuickReply('thanks')} className="text-xs">
                    🙏 Thank You
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendQuickReply('checking')} className="text-xs">
                    ⏳ Checking...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendQuickReply('resolved')} className="text-xs">
                    ✅ Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendQuickReply('followup')} className="text-xs">
                    😊 Follow-up
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/10 rounded-lg">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-semibold">No messages yet</p>
              <p className="text-sm">Start the conversation or send a quick offer!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isFromAdmin = msg.sender_id === userProfile.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isFromAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {isFromAdmin ? (
                      <>
                        <AvatarImage src={userProfile.profile_picture_url} />
                        <AvatarFallback className="text-xs">{getInitials(userProfile.full_name)}</AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src={customer.profile_picture_url} />
                        <AvatarFallback className="text-xs">{getInitials(customer.full_name)}</AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  <div className={`max-w-[70%] ${isFromAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {renderMessage(msg)}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {renderMessageStatus(msg)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2 p-4 pt-3 border-t border-border">
          <div className="flex gap-2 flex-1">
            {/* Emoji Picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                  <Smile className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="glass-effect w-80 p-2" align="start">
                <div className="grid grid-cols-8 gap-1">
                  {QUICK_EMOJIS.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2 text-2xl hover:bg-muted rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={handleFileAttachment}
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            {/* Message Input */}
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="glass-effect flex-1"
              disabled={loading}
            />
          </div>

          {/* Send Button */}
          <Button type="submit" disabled={loading || !newMessage.trim()} className="flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerChatDialog;

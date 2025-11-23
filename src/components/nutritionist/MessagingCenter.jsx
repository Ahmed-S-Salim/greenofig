import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Paperclip,
  CheckCheck,
  Check,
  User,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const MessagingCenter = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [newMessageBody, setNewMessageBody] = useState('');

  useEffect(() => {
    fetchClients();
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, profile_picture_url')
        .eq('role', 'user')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Get all messages where user is sender or recipient
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(id, full_name, email, profile_picture_url),
          recipient:user_profiles!messages_recipient_id_fkey(id, full_name, email, profile_picture_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Failed to load conversations',
          description: error.message || 'Unable to fetch your messages. Please try again later.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Group by conversation partner
      const conversationsMap = new Map();
      (data || []).forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const partner = msg.sender_id === user.id ? msg.recipient : msg.sender;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partnerId,
            partner,
            lastMessage: msg,
            unreadCount: 0
          });
        }

        // Count unread messages
        if (msg.recipient_id === user.id && !msg.is_read) {
          conversationsMap.get(partnerId).unreadCount++;
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading conversations.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversation) => {
    try {
      const partnerId = conversation.partnerId;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(id, full_name, profile_picture_url)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (conversation) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', conversation.partnerId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update conversations list
      fetchConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedConversation.partnerId,
          message_text: newMessage.trim(),
          is_read: false
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(selectedConversation);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message'
      });
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = async () => {
    if (!selectedClient || !newMessageBody.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a client and enter a message'
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedClient,
          message_text: newMessageBody.trim(),
          is_read: false
        });

      if (error) throw error;

      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully'
      });

      setShowNewMessageDialog(false);
      setSelectedClient('');
      setNewMessageBody('');

      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message'
      });
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.partner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.partner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ConversationItem = ({ conversation }) => (
    <div
      onClick={() => setSelectedConversation(conversation)}
      className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
        selectedConversation?.partnerId === conversation.partnerId ? 'bg-muted' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {conversation.partner?.profile_picture_url ? (
            <img
              src={conversation.partner.profile_picture_url}
              alt={conversation.partner.full_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm truncate">
              {conversation.partner?.full_name || 'Unknown'}
            </h4>
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {format(new Date(conversation.lastMessage.created_at), 'MMM d')}
            </span>
          </div>
          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-semibold' : 'text-muted-foreground'}`}>
            {conversation.lastMessage.message_text}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="mt-1">
              {conversation.unreadCount} new
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => {
    const isMine = message.sender_id === user.id;

    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
          {!isMine && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                {message.sender?.profile_picture_url ? (
                  <img
                    src={message.sender.profile_picture_url}
                    alt={message.sender.full_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3 h-3 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {message.sender?.full_name}
              </span>
            </div>
          )}
          <div
            className={`rounded-lg p-3 ${
              isMine
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.message_text}</p>
            <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              <span className="text-xs">
                {format(new Date(message.created_at), 'h:mm a')}
              </span>
              {isMine && (
                message.is_read ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            Messages
          </h2>
          <p className="text-muted-foreground mt-1">Communicate with your clients</p>
        </div>
        <Button onClick={() => setShowNewMessageDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="glass-effect lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <ConversationItem key={conv.partnerId} conversation={conv} />
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'No conversations found' : 'No messages yet'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewMessageDialog(true)}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Start a conversation
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="glass-effect lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedConversation.partner?.profile_picture_url ? (
                      <img
                        src={selectedConversation.partner.profile_picture_url}
                        alt={selectedConversation.partner.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.partner?.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedConversation.partner?.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-[450px] overflow-y-auto p-4">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px] resize-none"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled
                        title="File attachment (coming soon)"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        size="icon"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a conversation from the list or start a new one
                </p>
                <Button onClick={() => setShowNewMessageDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="glass-effect custom-scrollbar max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">To:</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message:</label>
              <Textarea
                value={newMessageBody}
                onChange={(e) => setNewMessageBody(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartNewConversation} disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagingCenter;

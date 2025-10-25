import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Plus, User, Clock, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const MessagingCenter = () => {
  const { userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [nutritionists, setNutritionists] = useState([]);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [selectedNutritionist, setSelectedNutritionist] = useState('');
  const [conversationSubject, setConversationSubject] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (userProfile?.id) {
      fetchConversations();
      fetchNutritionists();
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      markAsRead();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchNutritionists = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, profile_picture_url')
        .in('role', ['nutritionist', 'admin', 'super_admin'])
        .order('full_name');
      setNutritionists(data || []);
    } catch (error) {
      console.error('Error fetching nutritionists:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data } = await supabase
        .from('conversations')
        .select(`
          *,
          nutritionist:nutritionist_id (
            id,
            full_name,
            email,
            profile_picture_url
          )
        `)
        .eq('user_id', userProfile.id)
        .order('last_message_at', { ascending: false });

      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('conversation_messages')
        .select(`
          *,
          sender:sender_id (
            id,
            full_name,
            profile_picture_url
          )
        `)
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await supabase.rpc('mark_conversation_read', {
        p_conversation_id: selectedConversation.id,
        p_user_id: userProfile.id
      });
      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const createConversation = async () => {
    if (!selectedNutritionist) {
      toast({
        title: 'Error',
        description: 'Please select a nutritionist',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userProfile.id,
          nutritionist_id: selectedNutritionist,
          subject: conversationSubject || 'General Inquiry'
        })
        .select()
        .single();

      if (error) throw error;

      setNewConversationOpen(false);
      setSelectedNutritionist('');
      setConversationSubject('');
      fetchConversations();
      toast({
        title: 'Success',
        description: 'Conversation created successfully'
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: userProfile.id,
          sender_role: 'user',
          message_text: newMessage
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages();
      fetchConversations();
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <Card className="glass-effect lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages
            </CardTitle>
            <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Professional</label>
                    <Select value={selectedNutritionist} onValueChange={setSelectedNutritionist}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a nutritionist or admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {nutritionists.map(nutritionist => (
                          <SelectItem key={nutritionist.id} value={nutritionist.id}>
                            {nutritionist.full_name} ({nutritionist.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject (Optional)</label>
                    <Input
                      value={conversationSubject}
                      onChange={(e) => setConversationSubject(e.target.value)}
                      placeholder="e.g., Diet plan question"
                    />
                  </div>
                  <Button onClick={createConversation} disabled={loading} className="w-full">
                    Start Conversation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start a new conversation to get help from our nutritionists</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {conv.nutritionist?.profile_picture_url ? (
                        <img
                          src={conv.nutritionist.profile_picture_url}
                          alt={conv.nutritionist.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold truncate">{conv.nutritionist?.full_name}</h4>
                        {conv.unread_by_user > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            {conv.unread_by_user}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.subject}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conv.last_message_preview || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {conv.last_message_at
                          ? new Date(conv.last_message_at).toLocaleDateString()
                          : new Date(conv.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Panel */}
      <Card className="glass-effect lg:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  {selectedConversation.nutritionist?.profile_picture_url ? (
                    <img
                      src={selectedConversation.nutritionist.profile_picture_url}
                      alt={selectedConversation.nutritionist.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConversation.nutritionist?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedConversation.subject}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-450px)]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender_id === userProfile.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender_id === userProfile.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      msg.sender_id === userProfile.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                      {msg.sender_id === userProfile.id && msg.is_read && (
                        <CheckCheck className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send)"
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={loading || !newMessage.trim()} size="icon" className="self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a conversation to start messaging</p>
              <p className="text-sm mt-2">or create a new conversation to get started</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MessagingCenter;

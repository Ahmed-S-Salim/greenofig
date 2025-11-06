import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Minimize2, Maximize2, Heart, MessageSquare, Sparkles, Bell, BellOff, Mail, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import logoUrl from '@/assets/Remove background project.png';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const FloatingAiChat = () => {
  const { userProfile, user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'messages'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [visualViewportHeight, setVisualViewportHeight] = useState(window.innerHeight);
  const [buttonPosition, setButtonPosition] = useState(() => {
    // Load saved position from localStorage, default to 'right'
    return localStorage.getItem('chatButtonPosition') || 'right';
  });
  // Visitor mode states
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorQuestion, setVisitorQuestion] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  // User selection for admins/nutritionists
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const audioRef = useRef(null);

  // Check if user is a visitor (not logged in)
  const isVisitor = !user;

  // Create notification sound (simple beep using Web Audio API)
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current = audioContext;

    // Cleanup function to prevent memory leak
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  // Track visual viewport height for mobile keyboard handling
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setVisualViewportHeight(window.visualViewport.height);
      } else {
        setVisualViewportHeight(window.innerHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const playNotificationSound = () => {
    if (!soundEnabled || !audioRef.current) return;

    try {
      const oscillator = audioRef.current.createOscillator();
      const gainNode = audioRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioRef.current.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioRef.current.currentTime + 0.3);

      oscillator.start(audioRef.current.currentTime);
      oscillator.stop(audioRef.current.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Fetch conversations and unread count
  useEffect(() => {
    if (user?.id && userProfile?.role) {
      fetchConversations();

      // Set up real-time listener for new messages - only for INSERT events
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            // Only refresh if message involves current user
            if (payload.new.recipient_id === user.id || payload.new.sender_id === user.id) {

              // Refresh conversations list
              fetchConversations();

              // If viewing this conversation, refresh messages
              if (selectedConversation) {
                const role = userProfile?.role;
                let shouldRefreshMessages = false;

                if (role === 'nutritionist' || role === 'admin' || role === 'super_admin') {
                  shouldRefreshMessages =
                    payload.new.sender_id === selectedConversation ||
                    payload.new.recipient_id === selectedConversation;
                } else {
                  shouldRefreshMessages = payload.new.conversation_id === selectedConversation;
                }

                if (shouldRefreshMessages) {
                  fetchMessagesForConversation(selectedConversation);
                }
              }

              // Play sound and show toast only for incoming messages
              if (payload.new.recipient_id === user.id && payload.new.sender_id !== user.id) {
                playNotificationSound();
                toast({
                  title: '💬 New Message',
                  description: 'You have received a new message',
                  duration: 3000,
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, userProfile?.role, selectedConversation]);

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const role = userProfile?.role;
      let query;

      if (role === 'nutritionist' || role === 'admin' || role === 'super_admin') {
        // Nutritionists/admins see messages where they are sender or recipient
        query = supabase
          .from('messages')
          .select(`
            *,
            sender:user_profiles!messages_sender_id_fkey(id, full_name, email, profile_picture_url),
            recipient:user_profiles!messages_recipient_id_fkey(id, full_name, email, profile_picture_url)
          `)
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
      } else {
        // Regular users see conversations
        query = supabase
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
          .eq('user_id', user.id)
          .order('last_message_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (role === 'nutritionist' || role === 'admin' || role === 'super_admin') {
        // Group messages by conversation partner
        const conversationMap = new Map();
        data?.forEach(msg => {
          // Add null checks to prevent crashes
          if (!msg || !msg.sender_id || !msg.recipient_id) return;

          const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
          const partner = msg.sender_id === user.id ? (msg.recipient || {}) : (msg.sender || {});

          // Skip if partner data is invalid
          if (!partner || !partner.id) return;

          if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, {
              id: partnerId,
              partner,
              lastMessage: msg,
              unreadCount: msg.recipient_id === user.id && !msg.is_read ? 1 : 0
            });
          } else {
            const conv = conversationMap.get(partnerId);
            if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
              conv.lastMessage = msg;
            }
            if (msg.recipient_id === user.id && !msg.is_read) {
              conv.unreadCount++;
            }
          }
        });

        setConversations(Array.from(conversationMap.values()));
        setUnreadCount(Array.from(conversationMap.values()).reduce((sum, conv) => sum + conv.unreadCount, 0));
      } else {
        setConversations(data || []);
        setUnreadCount(data?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch all users for admin/nutritionist to message
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, profile_picture_url, role')
        .neq('id', user.id) // Exclude self
        .order('full_name');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Open user picker
  const openUserPicker = () => {
    setShowUserPicker(true);
    fetchAllUsers();
  };

  // Select user to message
  const selectUserToMessage = (userId) => {
    setSelectedConversation(userId);
    setShowUserPicker(false);
    setUserSearchQuery('');
    fetchMessagesForConversation(userId);
  };

  const fetchMessagesForConversation = async (conversationId) => {
    try {
      const role = userProfile?.role;
      let query;

      if (role === 'nutritionist' || role === 'admin' || role === 'super_admin') {
        // Fetch messages between user and selected partner
        query = supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${conversationId}),and(sender_id.eq.${conversationId},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
      } else {
        // Fetch messages from conversation
        query = supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      setUserMessages(data || []);

      // Mark messages as read
      if (role === 'nutritionist' || role === 'admin' || role === 'super_admin') {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('recipient_id', user.id)
          .eq('sender_id', conversationId);
      } else {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .eq('recipient_id', user.id);
      }

      fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendUserMessage = async () => {
    if (!input.trim() || !selectedConversation) return;

    const messageText = input.trim();
    setInput('');

    try {
      const role = userProfile?.role;
      const messageData = {
        message_text: messageText,
        sender_id: user.id,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      if (role === 'nutritionist' || role === 'admin' || role === 'super_admin') {
        messageData.recipient_id = selectedConversation;
      } else {
        messageData.conversation_id = selectedConversation;
        messageData.recipient_id = conversations.find(c => c.id === selectedConversation)?.nutritionist?.id;
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      // Real-time subscription will handle showing the message

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Get suggested prompts based on user role
  const getSuggestedPrompts = () => {
    if (isVisitor) {
      return [
        "What features does GreenoFig offer?",
        "Tell me about the pricing plans",
        "I'd like to speak with someone from your team"
      ];
    }

    const role = userProfile?.role;

    if (role === 'admin' || role === 'super_admin') {
      return [
        "Show me platform analytics overview",
        "What are the best practices for user engagement?",
        "Help me analyze subscription trends"
      ];
    } else if (role === 'nutritionist') {
      return [
        "Suggest evidence-based nutrition strategies",
        "Help me create a client meal plan template",
        "What are current nutrition research trends?"
      ];
    } else {
      return [
        "Give me a healthy breakfast idea",
        "Suggest a quick 15-minute workout",
        "How can I improve my sleep quality?"
      ];
    }
  };

  const suggestedPrompts = getSuggestedPrompts();

  // Show tooltip after 3 seconds, hide after 8 seconds
  useEffect(() => {
    const showTimer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, userMessages]);

  // Load initial welcome message based on role
  useEffect(() => {
    if (isOpen && messages.length === 0 && activeTab === 'ai') {
      let welcomeText = '';

      if (isVisitor) {
        // Welcome message for visitors
        welcomeText = `Hi there! 👋 Welcome to GreenoFig! I'm your Website Assistant. I can help answer questions about our platform, features, pricing, and how we can support your health journey. If you'd like to speak with our team, just let me know!`;
      } else {
        const role = userProfile?.role;
        if (role === 'admin' || role === 'super_admin') {
          welcomeText = `Hi ${userProfile?.full_name?.split(' ')[0] || 'Admin'}! 👋 I'm your AI Business Assistant. I can help with analytics, strategies, and platform insights.`;
        } else if (role === 'nutritionist') {
          welcomeText = `Hi ${userProfile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI Nutrition Assistant. I can help with evidence-based strategies, client plans, and research.`;
        } else {
          welcomeText = `Hi ${userProfile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI Health Coach. How can I help you today?`;
        }
      }

      const welcomeMessage = {
        id: Date.now(),
        text: welcomeText,
        sender: 'ai',
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, isVisitor, userProfile, activeTab]);

  const submitLeadForm = async (e) => {
    e.preventDefault();
    if (!visitorEmail.trim() || !visitorName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your name and email',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingLead(true);

    try {
      // Create a visitor_inquiries entry
      const { error } = await supabase
        .from('visitor_inquiries')
        .insert([{
          name: visitorName,
          email: visitorEmail,
          question: visitorQuestion || input,
          conversation_history: JSON.stringify(messages),
          status: 'pending',
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast({
        title: 'Thank you!',
        description: 'Our team will get back to you shortly via email.',
      });

      // Add confirmation message
      const confirmMessage = {
        id: Date.now(),
        text: `Thank you, ${visitorName}! I've forwarded your information to our team. Someone will reach out to you at ${visitorEmail} shortly. Is there anything else I can help you with about our website?`,
        sender: 'ai',
      };
      setMessages(prev => [...prev, confirmMessage]);

      // Reset form
      setShowLeadForm(false);
      setVisitorName('');
      setVisitorEmail('');
      setVisitorQuestion('');

    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your information. Please try again or email us directly at support@greenofig.com',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleSendMessage = async (e, promptText) => {
    if (e) e.preventDefault();

    if (activeTab === 'messages') {
      sendUserMessage();
      return;
    }

    const messageText = promptText || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = { text: messageText, sender: 'user', user_id: user?.id };

    // Optimistically update UI
    const optimisticUserMessage = { ...userMessage, id: Date.now(), created_at: new Date().toISOString() };
    const newMessages = [...messages, optimisticUserMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Detect if visitor wants to talk to someone
      const wantsHumanContact = isVisitor && (
        messageText.toLowerCase().includes('talk to someone') ||
        messageText.toLowerCase().includes('speak with') ||
        messageText.toLowerCase().includes('contact') ||
        messageText.toLowerCase().includes('representative') ||
        messageText.toLowerCase().includes('human') ||
        messageText.toLowerCase().includes('real person') ||
        messageText.toLowerCase().includes('team member')
      );

      if (wantsHumanContact) {
        const leadPrompt = {
          text: "I'd be happy to connect you with our team! Please provide your name and email address, and someone from our team will reach out to you shortly.",
          sender: 'ai',
          id: Date.now() + 1,
        };
        setMessages(prev => [...prev, leadPrompt]);
        setShowLeadForm(true);
        setIsLoading(false);
        return;
      }

      const { data: functionData, error: functionError } = await supabase.functions.invoke('ai-coach-memory', {
        body: JSON.stringify({
          messages: newMessages.slice(-10),
          userProfile: isVisitor ? {
            isVisitor: true,
            role: 'visitor',
            systemPrompt: 'You are a helpful Website Assistant for GreenoFig, an AI-powered health and wellness platform. You can ONLY answer questions about: the website features, pricing plans, how the platform works, subscription details, privacy and security, payment methods, and general information about our services. If asked about personal health advice, meal plans, or fitness routines, politely explain that users need to sign up to access our AI Health Coach. Keep responses friendly, concise, and focused on helping visitors understand our platform.'
          } : {
            ...userProfile,
            isAdmin: userProfile?.role === 'admin' || userProfile?.role === 'super_admin',
            isNutritionist: userProfile?.role === 'nutritionist',
          }
        }),
      });

      if (functionError) {
        throw functionError;
      }

      const aiResponse = {
        text: functionData.reply,
        sender: 'ai',
        user_id: user?.id,
        id: Date.now() + 1,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('AI Coach error:', error);
      const errorMessage = {
        text: "I'm having trouble connecting right now. Please try again! 😊",
        sender: 'ai',
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const selectConversation = (convId) => {
    setSelectedConversation(convId);
    fetchMessagesForConversation(convId);
  };

  const handleDragEnd = (event, info) => {
    // Get the button's current position relative to viewport
    const screenWidth = window.innerWidth;
    const buttonElement = event.target.getBoundingClientRect();
    const buttonCenterX = buttonElement.left + buttonElement.width / 2;

    // Determine which side the button is closer to
    const newPosition = buttonCenterX < screenWidth / 2 ? 'left' : 'right';

    // Save position to state and localStorage
    setButtonPosition(newPosition);
    localStorage.setItem('chatButtonPosition', newPosition);
  };

  return (
    <div ref={chatRef}>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              [buttonPosition]: 16 // Reduced for tighter edge snap
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
              mass: 0.8
            }}
            className="fixed bottom-6 z-[9999]"
            style={{ [buttonPosition]: '16px' }}
          >
            {/* Tooltip popup */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: buttonPosition === 'right' ? 20 : -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: buttonPosition === 'right' ? 20 : -20, scale: 0.8 }}
                  className={`absolute bottom-20 bg-card rounded-lg shadow-xl p-3 w-56 border border-primary/20 ${
                    buttonPosition === 'right' ? 'right-0' : 'left-0'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        Need help?
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chat with AI Coach or message your nutritionist!
                      </p>
                    </div>
                  </div>
                  {/* Arrow pointing to button */}
                  <div className={`absolute -bottom-2 w-4 h-4 bg-card border-r border-b border-primary/20 transform rotate-45 ${
                    buttonPosition === 'right' ? 'right-6' : 'left-6'
                  }`}></div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              drag="x"
              dragConstraints={{
                left: -(window.innerWidth - 96), // Allow drag across screen (leave 96px for button + padding)
                right: window.innerWidth - 96
              }}
              dragElastic={0.1}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              onClick={toggleOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-16 w-16 rounded-full shadow-2xl cursor-grab active:cursor-grabbing relative bg-gradient-to-br from-primary to-green-400 touch-none select-none"
            >
              {/* Unread badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg z-10"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}

              {/* Glowing pulse effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 10px hsl(var(--primary) / 0.3)',
                    '0 0 20px hsl(var(--primary) / 0.4)',
                    '0 0 10px hsl(var(--primary) / 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 rounded-full"
              />

              {/* Logo - reduced animation for performance */}
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <img
                  src={logoUrl}
                  alt="GreenoFig AI Coach"
                  className="h-12 w-12 object-contain drop-shadow-lg"
                  style={{ filter: 'brightness(0.75) contrast(1.15)' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              [buttonPosition]: 16
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed w-[calc(100vw-32px)] max-w-[320px] md:max-w-[340px] bg-card rounded-2xl shadow-2xl z-[9999] border border-border overflow-hidden flex flex-col"
            style={{
              [buttonPosition]: '16px',
              bottom: '16px',
              height: isMinimized ? '60px' : 'auto',
              maxHeight: isMinimized ? '60px' : '550px'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-green-400 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <div className={`rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 ${isMinimized ? 'h-8 w-8' : 'h-10 w-10'}`}>
                  <img
                    src={logoUrl}
                    alt="GreenoFig"
                    className={`rounded-full object-cover ${isMinimized ? 'h-6 w-6' : 'h-8 w-8'}`}
                  />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-semibold text-white text-sm truncate whitespace-nowrap">
                    {isVisitor ? 'Website Assistant' : (activeTab === 'ai' ? 'AI Health Coach' : 'Messages')}
                  </h3>
                  {!isMinimized && (
                    <p className="text-xs text-white/80 truncate whitespace-nowrap">
                      {isVisitor ? 'Ask me about GreenoFig!' : (activeTab === 'ai' ? (isLoading ? 'Thinking...' : 'Online') : `${conversations.length} conversations`)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
                >
                  {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleOpen}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs - Only show for logged-in users */}
            {!isMinimized && !isVisitor && (
              <div className="flex border-b border-border bg-muted/30">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                    activeTab === 'ai'
                      ? 'bg-background text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  AI Coach
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all relative ${
                    activeTab === 'messages'
                      ? 'bg-background text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-[10px]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </button>
              </div>
            )}

            {/* Content */}
            {!isMinimized && activeTab === 'ai' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30" style={{ maxHeight: '320px' }}>
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2.5 shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-br from-primary to-green-400 text-primary-foreground'
                              : 'bg-card border border-border text-card-foreground'
                          }`}
                        >
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Prompts */}
                {messages.length <= 1 && !isLoading && !showLeadForm && (
                  <div className="px-3 pb-2 pt-1">
                    <div className="space-y-2">
                      {suggestedPrompts.map((prompt, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={(e) => handleSendMessage(e, prompt)}
                          className="w-full p-2 bg-muted hover:bg-accent rounded-lg text-left text-xs transition-colors"
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input or Lead Capture Form - Always visible */}
                <div className="p-4 bg-card border-t border-border">
                  {showLeadForm ? (
                    // Lead Capture Form for Visitors
                    <form onSubmit={submitLeadForm} className="space-y-3">
                      <div>
                        <Label htmlFor="visitor-name" className="text-xs font-medium">Name *</Label>
                        <Input
                          id="visitor-name"
                          type="text"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          placeholder="Your name"
                          className="mt-1 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="visitor-email" className="text-xs font-medium">Email *</Label>
                        <Input
                          id="visitor-email"
                          type="email"
                          value={visitorEmail}
                          onChange={(e) => setVisitorEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="mt-1 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="visitor-question" className="text-xs font-medium">Question (Optional)</Label>
                        <Textarea
                          id="visitor-question"
                          value={visitorQuestion}
                          onChange={(e) => setVisitorQuestion(e.target.value)}
                          placeholder="Tell us how we can help..."
                          className="mt-1 text-sm resize-none"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLeadForm(false)}
                          className="flex-1"
                          disabled={isSubmittingLead}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmittingLead}
                          className="flex-1 bg-gradient-to-br from-primary to-green-400"
                        >
                          {isSubmittingLead ? 'Sending...' : 'Submit'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    // Regular Chat Input
                    <>
                      <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={isVisitor ? "Ask about our platform..." : "Ask me anything..."}
                          className="flex-1 min-h-[48px] max-h-[120px] resize-none text-sm bg-background border-input focus:border-ring focus:ring-2 focus:ring-primary/20 rounded-lg p-3"
                          rows={2}
                        />
                        <Button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          size="icon"
                          className="h-12 w-12 bg-gradient-to-br from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 shrink-0 shadow-md transition-all"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </form>
                      <p className="text-[10px] text-muted-foreground mt-2 text-center">
                        Press Enter to send • Shift+Enter for new line
                      </p>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Messages Tab */}
            {!isMinimized && activeTab === 'messages' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* New Message Button for Admin/Nutritionist */}
                {!selectedConversation && !showUserPicker && (userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || userProfile?.role === 'nutritionist') && (
                  <div className="p-3 border-b border-border">
                    <Button
                      onClick={openUserPicker}
                      className="w-full bg-gradient-to-br from-primary to-green-400"
                      size="sm"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                )}

                {/* User Picker */}
                {showUserPicker && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowUserPicker(false);
                            setUserSearchQuery('');
                          }}
                          className="h-8 w-8 p-0"
                          title="Back to conversations"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="text-sm font-semibold">Select User to Message</h3>
                      </div>
                      <Input
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-border">
                      {allUsers
                        .filter(u =>
                          u.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                        )
                        .map((user) => (
                          <motion.button
                            key={user.id}
                            onClick={() => selectUserToMessage(user.id)}
                            className="w-full p-3 hover:bg-muted/50 transition-colors text-left flex items-center gap-3"
                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {user.profile_picture_url ? (
                                <img src={user.profile_picture_url} alt={user.full_name} className="h-full w-full rounded-full object-cover" />
                              ) : (
                                <span className="text-sm font-semibold text-primary">
                                  {user.full_name?.charAt(0) || '?'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {user.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                              {user.role}
                            </Badge>
                          </motion.button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Conversations List */}
                {!selectedConversation && !showUserPicker && (
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Start chatting with your {userProfile?.role === 'user' ? 'nutritionist' : 'clients'}!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {conversations.map((conv) => {
                          const partner = conv.partner || conv.nutritionist;
                          const lastMsg = conv.lastMessage || { message_text: conv.last_message, created_at: conv.last_message_at };
                          const unread = conv.unreadCount || conv.unread_count || 0;

                          return (
                            <motion.button
                              key={conv.id}
                              onClick={() => selectConversation(conv.id)}
                              className="w-full p-3 hover:bg-muted/50 transition-colors text-left flex items-start gap-3"
                              whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            >
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {partner?.profile_picture_url ? (
                                  <img src={partner.profile_picture_url} alt={partner.full_name} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-sm font-semibold text-primary">
                                    {partner?.full_name?.charAt(0) || '?'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {partner?.full_name || 'Unknown'}
                                  </p>
                                  {lastMsg?.created_at && (
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                      {format(new Date(lastMsg.created_at), 'MMM d')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {lastMsg?.message_text || 'No messages yet'}
                                </p>
                              </div>
                              {unread > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-[10px] flex-shrink-0">
                                  {unread}
                                </Badge>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Chat View */}
                {selectedConversation && (
                  <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-3 border-b border-border flex items-center gap-3 bg-muted/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedConversation(null);
                          setUserMessages([]);
                        }}
                        className="h-8 w-8 p-0"
                        title="Back to conversations"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {conversations.find(c => c.id === selectedConversation)?.partner?.full_name ||
                           conversations.find(c => c.id === selectedConversation)?.nutritionist?.full_name ||
                           'Conversation'}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/30" style={{ maxHeight: '320px' }}>
                      {userMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm ${
                              msg.sender_id === user.id
                                ? 'bg-gradient-to-br from-primary to-green-400 text-primary-foreground'
                                : 'bg-card border border-border text-card-foreground'
                            }`}
                          >
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.message_text}</p>
                            <span className="text-[10px] opacity-70 mt-1 block">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-card border-t border-border">
                      <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-1 min-h-[48px] max-h-[120px] resize-none text-sm bg-background border-input focus:border-ring focus:ring-2 focus:ring-primary/20 rounded-lg p-3"
                          rows={2}
                        />
                        <Button
                          type="submit"
                          disabled={!input.trim()}
                          size="icon"
                          className="h-12 w-12 bg-gradient-to-br from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 shrink-0 shadow-md transition-all"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingAiChat;

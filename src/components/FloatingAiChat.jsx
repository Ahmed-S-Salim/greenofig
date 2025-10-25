import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import logoUrl from '@/assets/Remove background project.png';

const FloatingAiChat = () => {
  const { userProfile, user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

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

  useEffect(scrollToBottom, [messages]);

  // Load initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && userProfile) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Hi ${userProfile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI Health Coach. How can I help you today?`,
        sender: 'ai',
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userProfile]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to use the AI Coach',
        variant: 'destructive',
      });
      return;
    }

    const userMessage = { text: input, sender: 'user', user_id: user.id };

    // Optimistically update UI
    const optimisticUserMessage = { ...userMessage, id: Date.now(), created_at: new Date().toISOString() };
    const newMessages = [...messages, optimisticUserMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI Coach Edge Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('ai-coach-memory', {
        body: JSON.stringify({ messages: newMessages.slice(-10), userProfile }),
      });

      if (functionError) {
        throw functionError;
      }

      const aiResponse = {
        text: functionData.reply,
        sender: 'ai',
        user_id: user.id,
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

  return (
    <div ref={chatRef}>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Tooltip popup */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  className="absolute bottom-20 right-0 bg-card rounded-lg shadow-xl p-3 w-56 border border-primary/20"
                >
                  <div className="flex items-start gap-2">
                    <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        Need health advice?
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chat with our AI Health Coach for personalized wellness tips!
                      </p>
                    </div>
                  </div>
                  {/* Arrow pointing to button */}
                  <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-primary/20 transform rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              onClick={toggleOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-16 w-16 rounded-full shadow-2xl cursor-pointer relative bg-gradient-to-br from-primary to-green-400"
            >
              {/* Glowing pulse effect - reduced */}
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

              {/* Logo with animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                  y: [0, -2, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 flex items-center justify-center p-2"
              >
                <img
                  src={logoUrl}
                  alt="GreenoFig AI Coach"
                  className="h-12 w-12 object-contain drop-shadow-lg"
                />
              </motion.div>
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
              height: isMinimized ? '60px' : '480px'
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-[340px] bg-card rounded-2xl shadow-2xl z-50 border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-green-400 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(255, 255, 255, 0.3)',
                      '0 0 20px rgba(255, 255, 255, 0.5)',
                      '0 0 10px rgba(255, 255, 255, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={logoUrl}
                    alt="GreenoFig"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    AI Health Coach
                    <Sparkles className="h-4 w-4" />
                  </h3>
                  <p className="text-xs text-white/80">
                    {isLoading ? 'Thinking...' : 'Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
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

                {/* Input */}
                <div className="p-3 bg-card border-t border-border">
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 min-h-[40px] max-h-[90px] resize-none text-sm bg-background border-input focus:border-ring rounded-lg"
                      rows={1}
                    />
                    <Button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-10 w-10 bg-gradient-to-br from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 shrink-0 shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
                    Press Enter to send
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingAiChat;

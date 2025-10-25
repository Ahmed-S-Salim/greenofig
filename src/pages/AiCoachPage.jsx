import React, { useState, useRef, useEffect, useCallback } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Helmet } from 'react-helmet';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Send, Bot, User, Loader2 } from 'lucide-react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from "@/components/ui/use-toast";

    const AiCoachPage = () => {
      const { userProfile, user } = useAuth();
      const { toast } = useToast();
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [isHistoryLoading, setIsHistoryLoading] = useState(true);
      const messagesEndRef = useRef(null);

      const suggestedPrompts = [
        "Give me a healthy breakfast idea.",
        "Suggest a quick 15-minute workout.",
        "How can I increase my energy levels?",
        "What's a good way to de-stress?",
      ];

      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(scrollToBottom, [messages]);
      
      const fetchChatHistory = useCallback(async () => {
        if (!user) return;
        try {
          setIsHistoryLoading(true);
          const { data, error } = await supabase
            .from('ai_chat_messages')
            .select('id, text, sender, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (error) throw error;
          
          if (data && data.length > 0) {
            setMessages(data);
          } else if(userProfile) {
            const welcomeMessage = {
              id: Date.now(),
              text: `Hello ${userProfile?.full_name?.split(' ')[0] || 'there'}! I'm your personal AI Health Coach. How can I help you achieve your wellness goals today?`,
              sender: 'ai',
            };
            setMessages([welcomeMessage]);
          }
        } catch (error) {
           toast({
            variant: "destructive",
            title: "Error fetching history",
            description: "Could not load your previous conversation.",
          });
        } finally {
          setIsHistoryLoading(false);
        }
      }, [user, userProfile, toast]);

      useEffect(() => {
        fetchChatHistory();
      }, [fetchChatHistory]);


      const handleSendMessage = async (e, messageText) => {
        if (e) e.preventDefault();
        const currentInput = messageText || input;
        if (!currentInput.trim() || isLoading) return;

        const userMessage = { text: currentInput, sender: 'user', user_id: user.id };
        
        // Optimistically update UI
        const optimisticUserMessage = { ...userMessage, id: Date.now(), created_at: new Date().toISOString() };
        const newMessages = [...messages, optimisticUserMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        // Save user message to DB
        await supabase.from('ai_chat_messages').insert(userMessage);

        try {
            const { data: functionData, error: functionError } = await supabase.functions.invoke('ai-coach-memory', {
                body: JSON.stringify({ messages: newMessages.slice(-10), userProfile }), // Send last 10 messages for context
            });

            if (functionError) {
                throw functionError;
            }

            const aiResponse = { 
              text: functionData.reply, 
              sender: 'ai',
              user_id: user.id
            };
            
            // Save AI message to DB
            const { data: savedAiMessage, error: saveError } = await supabase.from('ai_chat_messages').insert(aiResponse).select().single();
            if(saveError) throw saveError;
            
            // Update UI with confirmed message from DB
            setMessages((prev) => [...prev.filter(m => m.id !== optimisticUserMessage.id), optimisticUserMessage, savedAiMessage]);

        } catch (error) {
            const errorResponse = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
                sender: 'ai',
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
      };

      return (
        <>
          <Helmet>
            <title>AI Coach - GreenoFig</title>
            <meta name="description" content="Chat with your personal AI health and wellness coach." />
          </Helmet>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[calc(100vh-120px)]"
          >
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {isHistoryLoading && (
                 <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 </div>
              )}
              <AnimatePresence>
                {!isHistoryLoading && messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-lg p-4 rounded-2xl shadow-md ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                     {message.sender === 'user' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-3 justify-start"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div className="max-w-lg p-4 rounded-2xl shadow-md bg-muted text-foreground rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && !isLoading && !isHistoryLoading &&(
              <div className="p-4 md:px-6">
                <div className="grid grid-cols-2 gap-3">
                  {suggestedPrompts.map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={(e) => handleSendMessage(e, prompt)}
                      className="p-3 bg-muted hover:bg-accent rounded-lg text-left text-sm"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 md:p-6 border-t border-border bg-background">
              <form onSubmit={handleSendMessage} className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Ask your AI coach anything..."
                  className="w-full pr-20 py-3 resize-none bg-muted border-border"
                  rows={1}
                  disabled={isLoading || isHistoryLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={isLoading || isHistoryLoading || !input.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      );
    };

    export default AiCoachPage;
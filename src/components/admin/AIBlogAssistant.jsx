import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  User,
  Send,
  Copy,
  Sparkles,
  Search,
  Loader2,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AIBlogAssistant = ({ onContentGenerated, onSEOGenerated }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI blog writing assistant. Tell me what topic you'd like to write about, and I'll help you create amazing content for your health and wellness blog!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedSEO, setGeneratedSEO] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBlogWithGemini = async (topic) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Write a comprehensive, engaging blog post about "${topic}" for a health and wellness website called GreenoFig. The blog should be:

- Professional yet conversational
- 1500-2000 words
- Well-structured with clear headings (use HTML tags: h2, h3)
- Include actionable tips and advice
- Use bullet points and lists where appropriate
- Include a compelling introduction and conclusion
- SEO-friendly
- Written in HTML format

Write only the blog content, starting with an h2 heading. Do not include a title or meta information.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            }
          })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0]) {
        return data.candidates[0].content.parts[0].text;
      }
      throw new Error('No content generated');
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };

  const generateSEOWithGemini = async (blogContent) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Based on this blog content, generate SEO elements in JSON format:

Blog Content:
${blogContent.substring(0, 1000)}...

Generate a JSON object with these fields:
{
  "title": "Compelling blog title (50-60 characters)",
  "metaTitle": "SEO-optimized meta title (50-60 characters)",
  "metaDescription": "Engaging meta description (150-160 characters)",
  "slug": "url-friendly-slug",
  "excerpt": "Brief excerpt (150-200 characters)",
  "focusKeyword": "main keyword phrase",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Return ONLY the JSON object, no other text.`
              }]
            }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 500,
            }
          })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0]) {
        const jsonText = data.candidates[0].content.parts[0].text;
        // Extract JSON from markdown code blocks if present
        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/) || jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        return JSON.parse(jsonText);
      }
      throw new Error('No SEO data generated');
    } catch (error) {
      console.error('SEO generation error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Check if user is asking to write a blog
    const isGenerateRequest = userMessage.toLowerCase().includes('write') ||
                              userMessage.toLowerCase().includes('create') ||
                              userMessage.toLowerCase().includes('blog about') ||
                              messages.length === 1; // First user message

    if (isGenerateRequest) {
      setIsGenerating(true);

      // Add loading message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '✨ Generating your blog post... This may take a minute.'
      }]);

      try {
        // Generate blog content
        const content = await generateBlogWithGemini(userMessage);
        setGeneratedContent(content);

        // Update last message with success
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: `✅ I've generated a comprehensive blog post for you! You can preview it below and copy it to the editor.\n\nWould you like me to generate SEO elements (title, meta description, keywords) as well?`
          };
          return newMessages;
        });

      } catch (error) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: '❌ Sorry, I encountered an error generating the blog. Please try again or rephrase your request.'
          };
          return newMessages;
        });
        toast({
          title: 'Error',
          description: 'Failed to generate blog content',
          variant: 'destructive'
        });
      } finally {
        setIsGenerating(false);
      }
    } else if (userMessage.toLowerCase().includes('seo') || userMessage.toLowerCase().includes('yes')) {
      // Generate SEO if content exists
      if (generatedContent) {
        setIsGenerating(true);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '🔍 Generating SEO elements...'
        }]);

        try {
          const seo = await generateSEOWithGemini(generatedContent);
          setGeneratedSEO(seo);

          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: `✅ SEO elements generated! Check the preview below to see how it will look on Google.\n\nYou can now copy everything to your blog editor!`
            };
            return newMessages;
          });

        } catch (error) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: '❌ Sorry, I had trouble generating SEO elements. You can create them manually in the editor.'
            };
            return newMessages;
          });
        } finally {
          setIsGenerating(false);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Please generate a blog post first, then I can help with SEO!'
        }]);
      }
    } else {
      // General conversation
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I can help you write blog posts! Just tell me what topic you want to write about, or ask me to generate a blog about a specific subject.'
      }]);
    }
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      toast({
        title: 'Content Copied!',
        description: 'Blog content has been added to the editor'
      });
    }
  };

  const handleCopySEO = () => {
    if (generatedSEO) {
      onSEOGenerated(generatedSEO);
      toast({
        title: 'SEO Data Applied!',
        description: 'Title, meta description, and keywords have been added'
      });
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm your AI blog writing assistant. Tell me what topic you'd like to write about, and I'll help you create amazing content for your health and wellness blog!"
    }]);
    setGeneratedContent('');
    setGeneratedSEO(null);
  };

  return (
    <div className="space-y-4">
      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Blog Writing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-3 p-4 bg-muted/20 rounded-lg">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="e.g., Write a blog about the benefits of morning meditation..."
              disabled={isGenerating}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isGenerating || !input.trim()}
              size="icon"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="icon"
              disabled={isGenerating}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Generated Blog Content
              </CardTitle>
              <Button onClick={handleCopyContent} size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy to Editor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto p-4 bg-muted/20 rounded-lg">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: generatedContent }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Preview */}
      {generatedSEO && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-500" />
                Google Search Preview
              </CardTitle>
              <Button onClick={handleCopySEO} size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply SEO Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Search Preview */}
            <div className="p-4 bg-white border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>greenofig.com</span>
                  <span>›</span>
                  <span className="text-gray-500">{generatedSEO.slug}</span>
                </div>
                <h3 className="text-xl text-blue-600 hover:underline cursor-pointer">
                  {generatedSEO.metaTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  {generatedSEO.metaDescription}
                </p>
              </div>
            </div>

            <Separator />

            {/* SEO Details */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Title</p>
                <p className="text-sm text-muted-foreground">{generatedSEO.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Excerpt</p>
                <p className="text-sm text-muted-foreground">{generatedSEO.excerpt}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Focus Keyword</p>
                <Badge variant="secondary">{generatedSEO.focusKeyword}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {generatedSEO.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIBlogAssistant;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, FileText, Target, TrendingUp, Copy, Download, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AIBlogGenerator = ({ user }) => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [targetAudience, setTargetAudience] = useState('general');
  const [contentType, setContentType] = useState('guide');
  const [tone, setTone] = useState('professional');
  const [wordCount, setWordCount] = useState('2000');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const contentTypes = [
    { value: 'guide', label: 'Ultimate Guide', description: 'Comprehensive how-to guides' },
    { value: 'listicle', label: 'Listicle', description: 'Top 10, Best of lists' },
    { value: 'comparison', label: 'Comparison', description: 'Product/method comparisons' },
    { value: 'tutorial', label: 'Tutorial', description: 'Step-by-step instructions' },
    { value: 'case-study', label: 'Case Study', description: 'Success stories & results' },
    { value: 'faq', label: 'FAQ', description: 'Question & answer format' },
  ];

  const audiences = [
    { value: 'general', label: 'General Audience' },
    { value: 'beginners', label: 'Beginners' },
    { value: 'fitness-enthusiasts', label: 'Fitness Enthusiasts' },
    { value: 'weight-loss', label: 'Weight Loss Seekers' },
    { value: 'muscle-building', label: 'Muscle Builders' },
    { value: 'busy-professionals', label: 'Busy Professionals' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly & Conversational' },
    { value: 'motivational', label: 'Motivational' },
    { value: 'educational', label: 'Educational' },
    { value: 'casual', label: 'Casual' },
  ];

  const generateBlogPost = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic Required',
        description: 'Please enter a blog topic',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);

    try {
      // Construct the prompt for AI
      const prompt = `You are an expert SEO content writer specializing in health, wellness, nutrition, and fitness.

Create a comprehensive, SEO-optimized blog post with the following specifications:

**Topic**: ${topic}
**Target Keywords**: ${keywords || 'Derive from topic'}
**Target Audience**: ${audiences.find(a => a.value === targetAudience)?.label}
**Content Type**: ${contentTypes.find(c => c.value === contentType)?.label}
**Tone**: ${tones.find(t => t.value === tone)?.label}
**Target Word Count**: ${wordCount} words

**Requirements**:
1. Create a compelling, click-worthy headline (50-60 characters)
2. Write an engaging meta description (150-160 characters)
3. Start with a hook that grabs attention
4. Use H2 and H3 headers for structure (include keywords naturally)
5. Include actionable tips and practical advice
6. Add internal linking suggestions (to other relevant topics)
7. Include a call-to-action at the end
8. Naturally integrate the target keywords throughout
9. Write in ${tones.find(t => t.value === tone)?.label.toLowerCase()} tone
10. Make it valuable, informative, and engaging

**Format the response as JSON**:
{
  "title": "SEO-optimized blog title",
  "slug": "url-friendly-slug",
  "metaDescription": "Compelling meta description",
  "content": "Full blog post content in markdown format",
  "excerpt": "2-3 sentence excerpt for previews",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "readingTime": "estimated reading time in minutes",
  "seoScore": "estimated SEO score out of 100"
}

Generate the blog post now.`;

      // Call OpenAI API through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are an expert SEO content writer. Always respond with valid JSON as specified.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 4000,
        },
      });

      if (error) throw error;

      // Parse the AI response
      let blogData;
      try {
        // Try to extract JSON from the response
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          blogData = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, create a basic structure
          blogData = {
            title: topic,
            slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            metaDescription: `Discover everything you need to know about ${topic}`,
            content: data.response,
            excerpt: data.response.substring(0, 200) + '...',
            keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
            readingTime: Math.ceil(data.response.split(' ').length / 200),
            seoScore: 75,
          };
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Failed to parse AI response');
      }

      setGeneratedContent(blogData);

      toast({
        title: 'Blog Post Generated! ✨',
        description: `Created a ${blogData.readingTime}-minute read with SEO score: ${blogData.seoScore}/100`,
      });
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate blog post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveToDrafts = async () => {
    if (!generatedContent) return;

    try {
      const { error } = await supabase.from('blog_posts').insert({
        title: generatedContent.title,
        slug: generatedContent.slug,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        meta_description: generatedContent.metaDescription,
        author_id: user.id,
        published: false,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: 'Saved to Drafts',
        description: 'Blog post has been saved. Edit and publish from the Blog Manager.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard',
    });
  };

  const downloadMarkdown = () => {
    if (!generatedContent) return;

    const markdown = `---
title: ${generatedContent.title}
slug: ${generatedContent.slug}
metaDescription: ${generatedContent.metaDescription}
keywords: ${generatedContent.keywords.join(', ')}
readingTime: ${generatedContent.readingTime} min
---

# ${generatedContent.title}

${generatedContent.content}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedContent.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'Blog post downloaded as markdown file',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Blog Content Generator
        </h2>
        <p className="text-text-secondary mt-1">
          Generate SEO-optimized blog posts instantly with AI. Perfect for ranking on Google!
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Content Specifications
          </CardTitle>
          <CardDescription>
            Provide details about the blog post you want to create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Blog Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., How to Lose Weight with AI Health Coaching"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={generating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="e.g., ai health coach, weight loss, meal planning"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={generating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType} disabled={generating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience} disabled={generating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((aud) => (
                    <SelectItem key={aud.value} value={aud.value}>
                      {aud.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Writing Tone</Label>
              <Select value={tone} onValueChange={setTone} disabled={generating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="word-count">Target Word Count</Label>
              <Select value={wordCount} onValueChange={setWordCount} disabled={generating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1,000 words (5 min read)</SelectItem>
                  <SelectItem value="1500">1,500 words (7 min read)</SelectItem>
                  <SelectItem value="2000">2,000 words (10 min read)</SelectItem>
                  <SelectItem value="2500">2,500 words (12 min read)</SelectItem>
                  <SelectItem value="3000">3,000 words (15 min read)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateBlogPost} disabled={generating} className="w-full gap-2" size="lg">
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Blog Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Generated Content
                </CardTitle>
                <CardDescription className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Target className="w-3 h-3" />
                      SEO Score: {generatedContent.seoScore}/100
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {generatedContent.readingTime} min read
                    </Badge>
                    {generatedContent.keywords.map((kw) => (
                      <Badge key={kw} variant="secondary">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedContent.content)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={downloadMarkdown}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" onClick={saveToDrafts}>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Drafts
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <Label className="text-xs text-text-secondary">TITLE</Label>
              <h3 className="text-2xl font-bold mt-1">{generatedContent.title}</h3>
            </div>

            {/* Meta Description */}
            <div>
              <Label className="text-xs text-text-secondary">META DESCRIPTION</Label>
              <p className="text-sm text-text-secondary mt-1">{generatedContent.metaDescription}</p>
            </div>

            {/* Excerpt */}
            <div>
              <Label className="text-xs text-text-secondary">EXCERPT</Label>
              <p className="text-sm mt-1">{generatedContent.excerpt}</p>
            </div>

            {/* Content Preview */}
            <div>
              <Label className="text-xs text-text-secondary">CONTENT PREVIEW</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {generatedContent.content.split('\n').map((para, idx) => (
                    <p key={idx} className="mb-2">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">SEO Tips for Maximum Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Use the target keyword in the title, first paragraph, and headers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Add internal links to other relevant blog posts and pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Include images with alt text containing your keywords</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Publish consistently (3-5 posts per week) for best results</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Share on social media and encourage engagement</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIBlogGenerator;

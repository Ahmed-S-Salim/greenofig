import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Zap, PlayCircle, PauseCircle, Plus, Trash2, RefreshCw, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Textarea } from '@/components/ui/textarea';

const AutoBlogScheduler = ({ user }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [postsPerWeek, setPostsPerWeek] = useState(3);
  const [publishTime, setPublishTime] = useState('09:00');
  const [autoPublish, setAutoPublish] = useState(false);
  const [contentQueue, setContentQueue] = useState([]);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [schedulerConfig, setSchedulerConfig] = useState(null);

  // Pre-defined topic templates for automation
  const topicTemplates = [
    { topic: 'The Ultimate Guide to {keyword}', keywords: 'ai health coaching, weight loss, meal planning' },
    { topic: 'How to Lose Weight with {keyword}', keywords: 'ai health coach, personalized nutrition' },
    { topic: 'Complete Guide to {keyword}', keywords: 'macro tracking, calorie counting' },
    { topic: '{keyword}: A Science-Based Approach', keywords: 'muscle building, strength training' },
    { topic: 'Best {keyword} for Weight Loss', keywords: 'healthy foods, meal plans, exercises' },
    { topic: '{keyword} for Beginners: Everything You Need to Know', keywords: 'fitness, nutrition, wellness' },
    { topic: '30-Day {keyword} Challenge', keywords: 'fitness, weight loss, healthy eating' },
    { topic: 'Common {keyword} Mistakes and How to Avoid Them', keywords: 'dieting, workout, meal prep' },
    { topic: 'The Truth About {keyword}', keywords: 'intermittent fasting, carbs, protein' },
    { topic: '{keyword} vs {keyword}: Which is Better?', keywords: 'keto vs paleo, cardio vs weights' },
  ];

  useEffect(() => {
    loadSchedulerConfig();
    loadContentQueue();
    loadGeneratedPosts();
  }, []);

  const loadSchedulerConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'auto_blog_scheduler')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        const config = data.value;
        setIsEnabled(config.enabled || false);
        setPostsPerWeek(config.postsPerWeek || 3);
        setPublishTime(config.publishTime || '09:00');
        setAutoPublish(config.autoPublish || false);
        setSchedulerConfig(config);
      }
    } catch (error) {
      console.error('Error loading scheduler config:', error);
    }
  };

  const loadContentQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_content_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        console.error('Content queue table may not exist:', error);
        return;
      }

      setContentQueue(data || []);
    } catch (error) {
      console.error('Error loading content queue:', error);
    }
  };

  const loadGeneratedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setGeneratedPosts(data || []);
    } catch (error) {
      console.error('Error loading generated posts:', error);
    }
  };

  const saveSchedulerConfig = async () => {
    try {
      const config = {
        enabled: isEnabled,
        postsPerWeek: parseInt(postsPerWeek),
        publishTime,
        autoPublish,
        lastRun: schedulerConfig?.lastRun || null,
        totalGenerated: schedulerConfig?.totalGenerated || 0,
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: 'auto_blog_scheduler',
          value: config,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      setSchedulerConfig(config);

      toast({
        title: 'Scheduler Updated',
        description: `Auto-blogging is now ${isEnabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addTopicToQueue = async () => {
    if (!newTopic.trim()) {
      toast({
        title: 'Topic Required',
        description: 'Please enter a blog topic',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, check if the table exists by trying to select from it
      const { error: tableCheckError } = await supabase
        .from('blog_content_queue')
        .select('id')
        .limit(1);

      // If table doesn't exist, create it first
      if (tableCheckError && tableCheckError.code === '42P01') {
        toast({
          title: 'Setting up Blog Queue',
          description: 'Creating content queue table... Please run the migration first.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('blog_content_queue')
        .insert({
          topic: newTopic,
          keywords: newKeywords,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      setNewTopic('');
      setNewKeywords('');
      loadContentQueue();

      toast({
        title: 'Topic Added',
        description: 'Topic added to content queue',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeFromQueue = async (id) => {
    try {
      const { error } = await supabase
        .from('blog_content_queue')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadContentQueue();

      toast({
        title: 'Removed',
        description: 'Topic removed from queue',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const generateNextPost = async () => {
    if (contentQueue.length === 0) {
      toast({
        title: 'Queue Empty',
        description: 'Add topics to the queue first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const nextTopic = contentQueue[0];

      const prompt = `You are an expert SEO content writer specializing in health, wellness, nutrition, and fitness.

Create a comprehensive, SEO-optimized blog post with the following specifications:

**Topic**: ${nextTopic.topic}
**Target Keywords**: ${nextTopic.keywords}
**Target Audience**: Health-conscious individuals seeking AI-powered wellness solutions
**Content Type**: Ultimate Guide
**Tone**: Professional yet friendly
**Target Word Count**: 2000 words

**Requirements**:
1. Create a compelling, click-worthy headline (50-60 characters)
2. Write an engaging meta description (150-160 characters)
3. Start with a hook that grabs attention
4. Use H2 and H3 headers for structure (include keywords naturally)
5. Include actionable tips and practical advice
6. Add internal linking suggestions (to other relevant topics)
7. Include a call-to-action at the end
8. Naturally integrate the target keywords throughout
9. Make it valuable, informative, and engaging

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

Generate the blog post now. Return ONLY the JSON object, no other text.`;

      // Call Gemini API via PHP proxy (to bypass CORS)
      const response = await fetch('/api-generate-blog.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0]) {
        throw new Error('No content generated from Gemini');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      let blogData;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          blogData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          // Fallback if JSON parsing fails
          blogData = {
            title: nextTopic.topic,
            slug: nextTopic.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            metaDescription: `Discover everything you need to know about ${nextTopic.topic}`,
            content: aiResponse,
            excerpt: aiResponse.substring(0, 200) + '...',
            keywords: nextTopic.keywords.split(',').map(k => k.trim()),
            readingTime: Math.ceil(aiResponse.split(' ').length / 200),
            seoScore: 75,
          };
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        throw new Error('Failed to parse AI response');
      }

      // Save to blog posts
      const { error: insertError } = await supabase.from('blog_posts').insert({
        title: blogData.title,
        slug: blogData.slug,
        content: blogData.content,
        excerpt: blogData.excerpt,
        meta_description: blogData.metaDescription,
        author_id: user.id,
        status: autoPublish ? 'published' : 'draft',
        created_at: new Date().toISOString(),
        published_at: autoPublish ? new Date().toISOString() : null,
      });

      if (insertError) throw insertError;

      // Update queue status
      await supabase
        .from('blog_content_queue')
        .update({ status: 'generated', generated_at: new Date().toISOString() })
        .eq('id', nextTopic.id);

      loadContentQueue();
      loadGeneratedPosts();

      toast({
        title: 'Blog Post Generated!',
        description: `"${blogData.title}" has been ${autoPublish ? 'published' : 'saved as draft'}`,
      });
    } catch (error) {
      console.error('Error generating post:', error);
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBulkTopics = async () => {
    const topics = [
      { topic: 'The Ultimate Guide to AI Health Coaching', keywords: 'ai health coach, ai coaching app, personalized health' },
      { topic: 'How to Lose Weight with Personalized Meal Plans', keywords: 'weight loss, meal planning, personalized nutrition' },
      { topic: 'Complete Guide to Tracking Macros for Beginners', keywords: 'macro tracking, macronutrients, calorie counting' },
      { topic: 'Best Foods for Muscle Building and Recovery', keywords: 'muscle building, protein foods, recovery nutrition' },
      { topic: '30-Day Fitness Challenge with AI Coaching', keywords: 'fitness challenge, 30 day workout, ai fitness' },
      { topic: 'Intermittent Fasting: A Complete Guide', keywords: 'intermittent fasting, fasting benefits, weight loss' },
      { topic: 'Sleep and Weight Loss: The Surprising Connection', keywords: 'sleep quality, weight loss, health habits' },
      { topic: 'How to Stay Motivated on Your Health Journey', keywords: 'motivation, health goals, consistency' },
      { topic: 'Understanding BMI and Body Composition', keywords: 'bmi calculator, body composition, health metrics' },
      { topic: 'Meal Prep for Busy Professionals', keywords: 'meal prep, healthy eating, time management' },
    ];

    try {
      for (const topic of topics) {
        await supabase.from('blog_content_queue').insert({
          topic: topic.topic,
          keywords: topic.keywords,
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      }

      loadContentQueue();

      toast({
        title: 'Topics Added',
        description: `${topics.length} topics added to queue`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getPublishSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const postsCount = parseInt(postsPerWeek);

    if (postsCount === 0) return [];

    const interval = Math.floor(7 / postsCount);
    const schedule = [];

    for (let i = 0; i < postsCount; i++) {
      schedule.push(days[i * interval]);
    }

    return schedule;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Automated Blog Scheduler
        </h2>
        <p className="text-text-secondary mt-1">
          Set it and forget it! Automatically generate and publish blog posts to rank on Google.
        </p>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <Clock className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="queue">
            <Calendar className="w-4 h-4 mr-2" />
            Content Queue ({contentQueue.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <CheckCircle className="w-4 h-4 mr-2" />
            Generated ({generatedPosts.length})
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure how often and when blog posts should be generated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Enable Auto-Blogging</Label>
                  <p className="text-sm text-text-secondary">
                    Automatically generate and publish blog posts
                  </p>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              </div>

              {/* Posts Per Week */}
              <div className="space-y-2">
                <Label>Posts Per Week</Label>
                <Select value={postsPerWeek.toString()} onValueChange={setPostsPerWeek}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 post per week</SelectItem>
                    <SelectItem value="2">2 posts per week</SelectItem>
                    <SelectItem value="3">3 posts per week (Recommended)</SelectItem>
                    <SelectItem value="4">4 posts per week</SelectItem>
                    <SelectItem value="5">5 posts per week</SelectItem>
                    <SelectItem value="7">Daily (7 posts per week)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-secondary">
                  Schedule: {getPublishSchedule().join(', ')} at {publishTime}
                </p>
              </div>

              {/* Publish Time */}
              <div className="space-y-2">
                <Label>Publish Time (24-hour format)</Label>
                <Input
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                />
                <p className="text-xs text-text-secondary">
                  Best times for engagement: 9:00 AM or 2:00 PM
                </p>
              </div>

              {/* Auto-Publish */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Auto-Publish</Label>
                  <p className="text-sm text-text-secondary">
                    Publish immediately without review (or save as draft)
                  </p>
                </div>
                <Switch
                  checked={autoPublish}
                  onCheckedChange={setAutoPublish}
                />
              </div>

              <Button onClick={saveSchedulerConfig} className="w-full" size="lg">
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Preview Schedule */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Publishing Schedule Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isEnabled ? (
                  <>
                    <div className="flex items-center gap-2 text-green-500">
                      <PlayCircle className="w-5 h-5" />
                      <span className="font-semibold">Scheduler is ACTIVE</span>
                    </div>
                    <p className="text-sm">
                      {postsPerWeek} blog post{postsPerWeek > 1 ? 's' : ''} will be generated every week
                    </p>
                    <p className="text-sm">
                      Publishing on: {getPublishSchedule().join(', ')}
                    </p>
                    <p className="text-sm">
                      Time: {publishTime}
                    </p>
                    <p className="text-sm">
                      Mode: {autoPublish ? 'Auto-publish immediately' : 'Save as draft for review'}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PauseCircle className="w-5 h-5" />
                    <span>Scheduler is currently disabled</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Topics to Queue</CardTitle>
              <CardDescription>
                Add blog topics that will be generated automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Blog Topic</Label>
                <Input
                  placeholder="e.g., How to Lose Weight with AI Health Coaching"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Keywords (comma-separated)</Label>
                <Input
                  placeholder="e.g., ai health coach, weight loss, meal planning"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addTopicToQueue} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Queue
                </Button>
                <Button onClick={generateBulkTopics} variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add 10 Topics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Queue List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Queue ({contentQueue.length} topics)</CardTitle>
                <Button size="sm" variant="outline" onClick={generateNextPost} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Next
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contentQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No topics in queue</p>
                  <p className="text-sm mt-1">Add topics to start auto-generating content</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contentQueue.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30">
                      <Badge variant="outline" className="mt-1">#{index + 1}</Badge>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.topic}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Keywords: {item.keywords}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromQueue(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Generated Posts</CardTitle>
              <CardDescription>
                Last 10 blog posts generated by the auto-blogger
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No posts generated yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedPosts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg hover:bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{post.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(post.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={post.published ? 'default' : 'secondary'}>
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoBlogScheduler;

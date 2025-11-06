import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Save,
  Wand2,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  Target,
  Sparkles,
  Calendar,
  Globe,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Bot
} from 'lucide-react';
import { format } from 'date-fns';
import AutoBlogScheduler from '@/components/admin/AutoBlogScheduler';

const BlogManagement = () => {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSEOAnalysis, setShowSEOAnalysis] = useState(false);
  const [seoScore, setSeoScore] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    keywords: [],
    category: '',
    tags: [],
    status: 'draft',
    scheduled_for: ''
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [keywordRankings, setKeywordRankings] = useState([]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [user]);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, statusFilter, posts]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch blog posts'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    setFilteredPosts(filtered);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title) => {
    setPostForm({
      ...postForm,
      title,
      slug: generateSlug(title),
      meta_title: title.substring(0, 60)
    });
  };

  const handleOpenEditor = (post = null) => {
    if (post) {
      setEditingPost(post);
      setPostForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        featured_image_url: post.featured_image_url || '',
        meta_title: post.meta_title || post.title,
        meta_description: post.meta_description || '',
        focus_keyword: post.focus_keyword || '',
        keywords: post.keywords || [],
        category: post.category || '',
        tags: post.tags || [],
        status: post.status,
        scheduled_for: post.scheduled_for || ''
      });
    } else {
      setEditingPost(null);
      setPostForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image_url: '',
        meta_title: '',
        meta_description: '',
        focus_keyword: '',
        keywords: [],
        category: '',
        tags: [],
        status: 'draft',
        scheduled_for: ''
      });
    }
    setShowEditor(true);
  };

  const handleSavePost = async () => {
    if (!postForm.title || !postForm.content) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Title and content are required'
      });
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...postForm,
        author_id: user.id,
        published_at: postForm.status === 'published' ? new Date().toISOString() : null
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({ title: 'Post updated successfully' });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) throw error;
        toast({ title: 'Post created successfully' });
      }

      setShowEditor(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save post'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({ title: 'Post deleted successfully' });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete post'
      });
    }
  };

  const handleGenerateWithAI = async (type) => {
    if (!aiPrompt && type === 'custom') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a prompt'
      });
      return;
    }

    setAiGenerating(true);
    try {
      let prompt = '';

      switch (type) {
        case 'outline':
          prompt = `Create a detailed blog post outline about "${postForm.title || aiPrompt}". Include main sections, subsections, and key points to cover.`;
          break;
        case 'full':
          prompt = `Write a comprehensive, SEO-optimized blog post about "${postForm.title || aiPrompt}". Make it informative, engaging, and around 1500 words. Focus on nutrition and wellness.`;
          break;
        case 'intro':
          prompt = `Write an engaging introduction paragraph for a blog post titled "${postForm.title}". Hook the reader and introduce the main topic.`;
          break;
        case 'conclusion':
          prompt = `Write a compelling conclusion for a blog post about "${postForm.title}". Summarize key points and include a call to action.`;
          break;
        case 'meta':
          prompt = `Create an SEO-optimized meta description (max 160 characters) for a blog post titled "${postForm.title}"`;
          break;
        case 'custom':
          prompt = aiPrompt;
          break;
        default:
          prompt = aiPrompt;
      }

      // Simulate AI generation (you would call your AI API here)
      // For now, using a placeholder
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generatedContent = `[AI Generated Content for: ${type}]\n\n${prompt}\n\n[This is a placeholder. Integrate with OpenAI, Claude, or your AI service here.]`;

      // Save to AI prompts history
      await supabase.from('blog_ai_prompts').insert({
        user_id: user.id,
        blog_post_id: editingPost?.id,
        prompt,
        model: 'gpt-4',
        generated_content: generatedContent,
        context_type: type
      });

      if (type === 'full' || type === 'outline' || type === 'intro') {
        setPostForm({ ...postForm, content: postForm.content + '\n\n' + generatedContent });
      } else if (type === 'meta') {
        setPostForm({ ...postForm, meta_description: generatedContent.substring(0, 160) });
      }

      toast({
        title: 'Content generated!',
        description: 'AI-generated content has been added'
      });
      setShowAIAssistant(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating with AI:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate content'
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const analyzeSEO = () => {
    const score = {
      overall: 0,
      content: 0,
      readability: 0,
      keyword: 0,
      meta: 0,
      issues: [],
      suggestions: []
    };

    // Content Score (0-25)
    const contentLength = postForm.content.length;
    if (contentLength > 1500) score.content = 25;
    else if (contentLength > 1000) score.content = 20;
    else if (contentLength > 500) score.content = 15;
    else {
      score.content = 10;
      score.issues.push({ type: 'content_length', severity: 'high', message: 'Content is too short. Aim for 1500+ words.' });
    }

    // Keyword Score (0-25)
    if (postForm.focus_keyword) {
      const keyword = postForm.focus_keyword.toLowerCase();
      const titleHasKeyword = postForm.title.toLowerCase().includes(keyword);
      const contentHasKeyword = postForm.content.toLowerCase().includes(keyword);
      const metaHasKeyword = postForm.meta_description.toLowerCase().includes(keyword);

      if (titleHasKeyword) score.keyword += 10;
      else score.issues.push({ type: 'keyword_title', severity: 'high', message: 'Focus keyword not in title' });

      if (contentHasKeyword) score.keyword += 10;
      else score.issues.push({ type: 'keyword_content', severity: 'medium', message: 'Focus keyword not in content' });

      if (metaHasKeyword) score.keyword += 5;
      else score.suggestions.push({ type: 'keyword_meta', suggestion: 'Add focus keyword to meta description' });
    } else {
      score.issues.push({ type: 'no_keyword', severity: 'high', message: 'No focus keyword set' });
    }

    // Meta Score (0-25)
    if (postForm.meta_title && postForm.meta_title.length <= 60) score.meta += 12;
    else if (!postForm.meta_title) score.issues.push({ type: 'no_meta_title', severity: 'high', message: 'Missing meta title' });
    else score.issues.push({ type: 'meta_title_long', severity: 'medium', message: 'Meta title too long (60 char max)' });

    if (postForm.meta_description && postForm.meta_description.length <= 160) score.meta += 13;
    else if (!postForm.meta_description) score.issues.push({ type: 'no_meta_desc', severity: 'high', message: 'Missing meta description' });
    else score.issues.push({ type: 'meta_desc_long', severity: 'medium', message: 'Meta description too long (160 char max)' });

    // Readability Score (0-25)
    const sentences = postForm.content.split(/[.!?]+/).length;
    const words = postForm.content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence < 20) score.readability = 25;
    else if (avgWordsPerSentence < 25) score.readability = 20;
    else {
      score.readability = 15;
      score.suggestions.push({ type: 'readability', suggestion: 'Break down long sentences for better readability' });
    }

    score.overall = score.content + score.keyword + score.meta + score.readability;

    setSeoScore(score);
    setShowSEOAnalysis(true);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !postForm.keywords.includes(keywordInput.trim())) {
      setPostForm({
        ...postForm,
        keywords: [...postForm.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setPostForm({
      ...postForm,
      keywords: postForm.keywords.filter(k => k !== keyword)
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !postForm.tags.includes(tagInput.trim())) {
      setPostForm({
        ...postForm,
        tags: [...postForm.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setPostForm({
      ...postForm,
      tags: postForm.tags.filter(t => t !== tag)
    });
  };

  const PostCard = ({ post }) => {
    const statusColors = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      scheduled: 'bg-blue-500',
      archived: 'bg-red-500'
    };

    return (
      <Card className="glass-effect hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt || 'No excerpt'}</p>
            </div>
            <Badge className={statusColors[post.status]}>
              {post.status}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span>{post.view_count || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{post.published_at ? format(new Date(post.published_at), 'MMM d') : 'Not published'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span>{post.focus_keyword || 'No keyword'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenEditor(post)} className="flex-1">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            {post.status === 'published' && (
              <Button variant="outline" size="sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleDeletePost(post.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
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
            <FileText className="w-8 h-8 text-primary" />
            Blog Management
          </h2>
          <p className="text-muted-foreground mt-1">Create SEO-optimized content with AI assistance</p>
        </div>
        <Button onClick={() => handleOpenEditor()}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="glass-effect">
          <TabsTrigger value="posts">
            <FileText className="w-4 h-4 mr-2" />
            My Posts
          </TabsTrigger>
          <TabsTrigger value="auto-scheduler">
            <Bot className="w-4 h-4 mr-2" />
            Auto Scheduler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* Search and Filters */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All ({posts.length})
              </Button>
              <Button
                variant={statusFilter === 'published' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('published')}
                size="sm"
              >
                Published
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('draft')}
                size="sm"
              >
                Drafts
              </Button>
              <Button
                variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('scheduled')}
                size="sm"
              >
                Scheduled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <Card className="glass-effect">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first blog post to get started'}
            </p>
            <Button onClick={() => handleOpenEditor()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        {/* Auto Scheduler Tab */}
        <TabsContent value="auto-scheduler">
          <AutoBlogScheduler user={userProfile} />
        </TabsContent>
      </Tabs>

      {/* Post Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="glass-effect custom-scrollbar max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="content" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={postForm.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Slug</label>
                <div className="flex gap-2">
                  <Input
                    value={postForm.slug}
                    onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                    placeholder="post-url-slug"
                  />
                  <Button variant="outline" size="icon" onClick={() => setPostForm({ ...postForm, slug: generateSlug(postForm.title) })}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Excerpt</label>
                <Textarea
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                  placeholder="Brief summary of the post..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center justify-between">
                  Content *
                  <Button variant="outline" size="sm" onClick={() => setShowAIAssistant(true)}>
                    <Wand2 className="w-4 h-4 mr-1" />
                    AI Generate
                  </Button>
                </label>
                <Textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Write your post content here..."
                  rows={15}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {postForm.content.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Featured Image URL</label>
                <Input
                  value={postForm.featured_image_url}
                  onChange={(e) => setPostForm({ ...postForm, featured_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">SEO Optimization</h3>
                <Button variant="outline" onClick={analyzeSEO}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze SEO
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Meta Title</label>
                <Input
                  value={postForm.meta_title}
                  onChange={(e) => setPostForm({ ...postForm, meta_title: e.target.value })}
                  placeholder="SEO title (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {postForm.meta_title.length}/60 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Meta Description</label>
                <Textarea
                  value={postForm.meta_description}
                  onChange={(e) => setPostForm({ ...postForm, meta_description: e.target.value })}
                  placeholder="SEO description (max 160 characters)"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {postForm.meta_description.length}/160 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Focus Keyword</label>
                <Input
                  value={postForm.focus_keyword}
                  onChange={(e) => setPostForm({ ...postForm, focus_keyword: e.target.value })}
                  placeholder="Main keyword to rank for"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Keywords</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Add keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {postForm.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-primary/60 hover:text-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={postForm.category}
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {postForm.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-secondary-foreground/60 hover:text-secondary-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select
                  value={postForm.status}
                  onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {postForm.status === 'scheduled' && (
                <div className="min-w-0">
                  <label className="text-sm font-medium mb-2 block">Schedule For</label>
                  <Input
                    type="datetime-local"
                    value={postForm.scheduled_for}
                    onChange={(e) => setPostForm({ ...postForm, scheduled_for: e.target.value })}
                    className="w-full min-w-0"
                  />
                </div>
              )}
            </TabsContent>

            {/* AI Assistant Tab */}
            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Content Generator
                  </CardTitle>
                  <CardDescription>
                    Generate high-quality content using AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleGenerateWithAI('outline')}
                      disabled={aiGenerating}
                    >
                      Generate Outline
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGenerateWithAI('intro')}
                      disabled={aiGenerating}
                    >
                      Generate Introduction
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGenerateWithAI('conclusion')}
                      disabled={aiGenerating}
                    >
                      Generate Conclusion
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGenerateWithAI('meta')}
                      disabled={aiGenerating}
                    >
                      Generate Meta Desc
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium mb-2 block">Custom Prompt</label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe what you want AI to generate..."
                      rows={4}
                    />
                    <Button
                      onClick={() => handleGenerateWithAI('custom')}
                      disabled={aiGenerating}
                      className="w-full mt-2"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="default"
                    onClick={() => handleGenerateWithAI('full')}
                    disabled={aiGenerating}
                    className="w-full"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Full Post...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Full Blog Post
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePost} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {postForm.status === 'published' ? 'Publish' : 'Save Draft'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SEO Analysis Dialog */}
      <Dialog open={showSEOAnalysis} onOpenChange={setShowSEOAnalysis}>
        <DialogContent className="glass-effect custom-scrollbar max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SEO Analysis</DialogTitle>
          </DialogHeader>

          {seoScore && (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <div className="text-5xl font-bold mb-2">{seoScore.overall}/100</div>
                <p className="text-muted-foreground">Overall SEO Score</p>
              </div>

              {/* Individual Scores */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-card border border-border rounded-lg">
                  <div className="text-2xl font-bold">{seoScore.content}</div>
                  <p className="text-xs text-muted-foreground">Content</p>
                </div>
                <div className="text-center p-4 bg-card border border-border rounded-lg">
                  <div className="text-2xl font-bold">{seoScore.keyword}</div>
                  <p className="text-xs text-muted-foreground">Keyword</p>
                </div>
                <div className="text-center p-4 bg-card border border-border rounded-lg">
                  <div className="text-2xl font-bold">{seoScore.meta}</div>
                  <p className="text-xs text-muted-foreground">Meta</p>
                </div>
                <div className="text-center p-4 bg-card border border-border rounded-lg">
                  <div className="text-2xl font-bold">{seoScore.readability}</div>
                  <p className="text-xs text-muted-foreground">Readability</p>
                </div>
              </div>

              {/* Issues */}
              {seoScore.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    Issues Found
                  </h4>
                  <div className="space-y-2">
                    {seoScore.issues.map((issue, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          issue.severity === 'high'
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-amber-500/10 border-amber-500'
                        }`}
                      >
                        <p className="text-sm">{issue.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {seoScore.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Suggestions
                  </h4>
                  <div className="space-y-2">
                    {seoScore.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-primary/10 rounded-lg border border-primary">
                        <p className="text-sm">{suggestion.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;

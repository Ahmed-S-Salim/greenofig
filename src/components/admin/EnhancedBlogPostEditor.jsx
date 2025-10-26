import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RichTextEditor from '@/components/RichTextEditor';
import SEOPreview from '@/components/SEOPreview';
import AIBlogAssistant from '@/components/admin/AIBlogAssistant';
import {
  Loader2,
  Save,
  ArrowLeft,
  Eye,
  Calendar,
  Tag,
  Folder,
  Star,
  Clock,
  X,
  Sparkles
} from 'lucide-react';

const EnhancedBlogPostEditor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Basic fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState('draft');

  // SEO fields
  const [slug, setSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');

  // Publishing fields
  const [featured, setFeatured] = useState(false);
  const [scheduledPublishAt, setScheduledPublishAt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Data
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [readingTime, setReadingTime] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!postId);
  const [activeTab, setActiveTab] = useState('editor');
  const [autoSlug, setAutoSlug] = useState(true);

  // Helper function to get back URL based on user role
  const getBackUrl = () => {
    const role = userProfile?.role;
    if (role === 'nutritionist') {
      return '/app/nutritionist?tab=blog';
    }
    return '/app/admin?tab=blog';
  };

  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      const [categoriesRes, tagsRes] = await Promise.all([
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('blog_tags').select('*').order('name')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
    };
    fetchData();
  }, []);

  // Fetch existing post
  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        setIsFetching(true);

        // Fetch post data
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (postError) {
          console.error('Error fetching post:', postError);
          toast({ title: 'Error fetching post data', description: postError.message, variant: 'destructive' });
          navigate(getBackUrl());
          setIsFetching(false);
          return;
        }

        // Fetch post tags separately to avoid relationship error
        const { data: postTags, error: tagsError } = await supabase
          .from('blog_post_tags')
          .select('tag_id')
          .eq('post_id', postId);

        if (tagsError) {
          console.error('Error fetching tags:', tagsError);
        }

        if (postData) {
          setTitle(postData.title);
          setContent(postData.content || '');
          setCoverImageUrl(postData.cover_image_url || '');
          setStatus(postData.status);
          setSlug(postData.slug || '');
          setMetaDescription(postData.meta_description || '');
          setExcerpt(postData.excerpt || '');
          setKeywords(postData.keywords || []);
          setFeatured(postData.featured || false);
          setScheduledPublishAt(postData.scheduled_publish_at || '');
          setCategoryId(postData.category_id || '');
          setReadingTime(postData.reading_time_minutes || 0);
          setAutoSlug(false);

          // Set selected tags
          if (postTags && postTags.length > 0) {
            setSelectedTags(postTags.map(pt => pt.tag_id));
          }
        }
        setIsFetching(false);
      };
      fetchPost();
    }
  }, [postId, navigate, getBackUrl]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [title, autoSlug]);

  // Calculate reading time
  useEffect(() => {
    if (content) {
      const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const minutes = Math.ceil(wordCount / 200); // Average reading speed
      setReadingTime(minutes);
    }
  }, [content]);

  // Auto-generate excerpt from content if not set
  useEffect(() => {
    if (content && !excerpt) {
      const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
      const autoExcerpt = text.substring(0, 200).trim() + '...';
      setExcerpt(autoExcerpt);
    }
  }, [content, excerpt]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }

    if (!slug) {
      toast({ title: 'Slug is required', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const postData = {
      title,
      content,
      cover_image_url: coverImageUrl || null,
      status: scheduledPublishAt && status === 'published' ? 'scheduled' : status,
      author_id: user.id,
      slug,
      meta_description: metaDescription || null,
      excerpt: excerpt || null,
      keywords: keywords.length > 0 ? keywords : null,
      featured,
      scheduled_publish_at: scheduledPublishAt || null,
      category_id: categoryId || null,
      reading_time_minutes: readingTime,
      published_at: status === 'published' && !postId ? new Date().toISOString() : undefined,
    };

    let savedPostId = postId;
    let error;

    if (postId) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', postId);
      error = updateError;
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();
      error = insertError;
      if (insertData) savedPostId = insertData.id;
    }

    if (error) {
      toast({ title: 'Error saving post', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Save tags
    if (savedPostId) {
      // Delete existing tags
      await supabase.from('blog_post_tags').delete().eq('post_id', savedPostId);

      // Insert new tags
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          post_id: savedPostId,
          tag_id: tagId
        }));
        await supabase.from('blog_post_tags').insert(tagInserts);
      }
    }

    toast({ title: 'Post saved successfully!' });
    navigate(getBackUrl());
    setLoading(false);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-6 px-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(getBackUrl())} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">{postId ? 'Edit Post' : 'Create New Post'}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab('preview')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {postId ? 'Update Post' : 'Save Post'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ai-assistant">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="ai-assistant" className="space-y-4">
              <AIBlogAssistant
                onContentGenerated={(generatedContent) => {
                  setContent(generatedContent);
                  setActiveTab('editor');
                }}
                onSEOGenerated={(seoData) => {
                  setTitle(seoData.title);
                  setSlug(seoData.slug);
                  setMetaDescription(seoData.metaDescription);
                  setExcerpt(seoData.excerpt);
                  setKeywords(seoData.keywords);
                  setActiveTab('seo');
                }}
              />
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <Card className="glass-effect">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Post Title *</Label>
                    <Input
                      id="title"
                      placeholder="Your amazing blog post title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-2xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Write your masterpiece here..."
                    />
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>Reading time: ~{readingTime} min</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief summary of your post (auto-generated if empty)"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover-image">Cover Image URL</Label>
                    <Input
                      id="cover-image"
                      placeholder="https://source.unsplash.com/random"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                    />
                    {coverImageUrl && (
                      <img
                        src={coverImageUrl}
                        alt="Cover preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="auto-slug" className="text-xs text-text-secondary">
                          Auto-generate
                        </Label>
                        <Switch
                          id="auto-slug"
                          checked={autoSlug}
                          onCheckedChange={setAutoSlug}
                        />
                      </div>
                    </div>
                    <Input
                      id="slug"
                      placeholder="your-post-slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setAutoSlug(false);
                      }}
                      disabled={autoSlug}
                    />
                    <p className="text-xs text-text-secondary">
                      URL: greenofig.com/blog/{slug || 'your-post-slug'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea
                      id="meta-description"
                      placeholder="Brief description for search engines (120-160 characters)"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-text-secondary text-right">
                      {metaDescription.length}/160
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        id="keywords"
                        placeholder="Add keyword and press Enter"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddKeyword}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <SEOPreview
                title={title}
                metaDescription={metaDescription}
                slug={slug}
                excerpt={excerpt}
              />
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card className="glass-effect">
                <CardContent className="p-8">
                  {coverImageUrl && (
                    <img
                      src={coverImageUrl}
                      alt={title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  <h1 className="text-4xl font-bold mb-4">{title || 'Your Post Title'}</h1>
                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-6">
                    <span>{readingTime} min read</span>
                    {categoryId && (
                      <span>
                        {categories.find(c => c.id === categoryId)?.name}
                      </span>
                    )}
                  </div>
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: content || '<p>Your content will appear here...</p>' }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Publishing
                </Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={scheduledPublishAt}
                  onChange={(e) => setScheduledPublishAt(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {postId && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Reading Time:</span>
                  <span>{readingTime} min</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedBlogPostEditor;

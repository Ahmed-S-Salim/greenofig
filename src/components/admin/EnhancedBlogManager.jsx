import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  BarChart3,
  Target,
  Sparkles,
  Calendar,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  RefreshCw,
  Download,
  MoreVertical,
  Check,
  X,
  Wand2
} from 'lucide-react';
import { format } from 'date-fns';

const EnhancedBlogManager = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [comments, setComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    totalViews: 0,
    totalComments: 0,
    pendingComments: 0,
    avgViewsPerPost: 0
  });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchAuthors();
    fetchComments();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, statusFilter, authorFilter, categoryFilter, posts]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:user_profiles!blog_posts_author_id_fkey(id, full_name, email)
        `)
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

  const fetchAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .in('role', ['nutritionist', 'admin', 'super_admin'])
        .order('full_name', { ascending: true });

      if (error) throw error;
      setAuthors(data || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          blog_post:blog_posts(title, slug),
          user:user_profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
      setPendingComments(data?.filter(c => !c.is_approved) || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: postsData } = await supabase.from('blog_posts').select('status, view_count');
      const { data: commentsData } = await supabase.from('blog_comments').select('is_approved');

      if (postsData) {
        const totalViews = postsData.reduce((sum, p) => sum + (p.view_count || 0), 0);
        const analytics = {
          totalPosts: postsData.length,
          publishedPosts: postsData.filter(p => p.status === 'published').length,
          draftPosts: postsData.filter(p => p.status === 'draft').length,
          scheduledPosts: postsData.filter(p => p.status === 'scheduled').length,
          totalViews,
          totalComments: commentsData?.length || 0,
          pendingComments: commentsData?.filter(c => !c.is_approved).length || 0,
          avgViewsPerPost: postsData.length > 0 ? Math.round(totalViews / postsData.length) : 0
        };
        setAnalytics(analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

    if (authorFilter !== 'all') {
      filtered = filtered.filter(post => post.author_id === authorFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }

    setFilteredPosts(filtered);
  };

  const handleBulkAction = async (action) => {
    if (selectedPosts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No posts selected',
        description: 'Please select posts to perform bulk actions'
      });
      return;
    }

    try {
      switch (action) {
        case 'publish':
          await supabase
            .from('blog_posts')
            .update({ status: 'published', published_at: new Date().toISOString() })
            .in('id', selectedPosts);
          toast({ title: `Published ${selectedPosts.length} posts` });
          break;
        case 'draft':
          await supabase
            .from('blog_posts')
            .update({ status: 'draft' })
            .in('id', selectedPosts);
          toast({ title: `Moved ${selectedPosts.length} posts to draft` });
          break;
        case 'archive':
          await supabase
            .from('blog_posts')
            .update({ status: 'archived' })
            .in('id', selectedPosts);
          toast({ title: `Archived ${selectedPosts.length} posts` });
          break;
        case 'delete':
          if (confirm(`Delete ${selectedPosts.length} posts permanently?`)) {
            await supabase
              .from('blog_posts')
              .delete()
              .in('id', selectedPosts);
            toast({ title: `Deleted ${selectedPosts.length} posts` });
          }
          break;
      }
      setSelectedPosts([]);
      fetchPosts();
      fetchAnalytics();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to perform bulk action'
      });
    }
  };

  const handleTogglePostSelection = (postId) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(p => p.id));
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
      fetchAnalytics();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete post'
      });
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: true })
        .eq('id', commentId);

      if (error) throw error;

      toast({ title: 'Comment approved' });
      fetchComments();
      fetchAnalytics();
    } catch (error) {
      console.error('Error approving comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve comment'
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({ title: 'Comment deleted' });
      fetchComments();
      fetchAnalytics();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete comment'
      });
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {change && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {change}
              </p>
            )}
          </div>
          <div className={`p-4 rounded-full ${color || 'bg-primary/10'}`}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PostCard = ({ post }) => {
    const statusColors = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      scheduled: 'bg-blue-500',
      archived: 'bg-red-500'
    };

    const isSelected = selectedPosts.includes(post.id);

    return (
      <Card className={`glass-effect hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleTogglePostSelection(post.id)}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt || 'No excerpt'}</p>
            </div>
            <Badge className={statusColors[post.status]}>
              {post.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{post.author?.full_name || 'Unknown'}</span>
            </div>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const isGitHubPages = window.location.hostname.includes('github.io');
                const basePath = isGitHubPages ? '/greenofig' : '';
                const role = user?.role === 'nutritionist' ? 'nutritionist' : 'admin';
                window.location.href = `${basePath}/app/${role}/blog/edit/${post.id}`;
              }}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDeletePost(post.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
            {post.status === 'published' && (
              <Button variant="outline" size="sm" onClick={() => {
                const isGitHubPages = window.location.hostname.includes('github.io');
                const basePath = isGitHubPages ? '/greenofig' : '';
                window.open(`${basePath}/blog/${post.slug}`, '_blank');
              }}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
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
          <p className="text-muted-foreground mt-1">Manage all blog posts, categories, and comments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPosts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            const isGitHubPages = window.location.hostname.includes('github.io');
            const basePath = isGitHubPages ? '/greenofig' : '';
            const role = user?.role === 'nutritionist' ? 'nutritionist' : 'admin';
            window.location.href = `${basePath}/app/${role}/blog/new`;
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">
            Posts ({analytics.totalPosts})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({analytics.pendingComments} pending)
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {/* Search and Filters */}
          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="space-y-4">
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
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-md"
                  >
                    <option value="all">All Authors</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.full_name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bulk Actions */}
                {selectedPosts.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedPosts.length} posts selected
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('publish')}>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('draft')}>
                        <FileText className="w-4 h-4 mr-1" />
                        Draft
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                        <Archive className="w-4 h-4 mr-1" />
                        Archive
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select All ({filteredPosts.length} posts)
                  </span>
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
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No blog posts yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={FileText}
              title="Total Posts"
              value={analytics.totalPosts}
            />
            <StatCard
              icon={CheckCircle2}
              title="Published"
              value={analytics.publishedPosts}
            />
            <StatCard
              icon={Eye}
              title="Total Views"
              value={analytics.totalViews.toLocaleString()}
            />
            <StatCard
              icon={TrendingUp}
              title="Avg Views/Post"
              value={analytics.avgViewsPerPost}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={FileText}
              title="Drafts"
              value={analytics.draftPosts}
            />
            <StatCard
              icon={Calendar}
              title="Scheduled"
              value={analytics.scheduledPosts}
            />
            <StatCard
              icon={MessageSquare}
              title="Total Comments"
              value={analytics.totalComments}
            />
            <StatCard
              icon={AlertCircle}
              title="Pending Comments"
              value={analytics.pendingComments}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts
                  .filter(p => p.status === 'published')
                  .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                  .slice(0, 10)
                  .map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground">{post.author?.full_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{post.view_count || 0}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog Categories</CardTitle>
              <CardDescription>Manage content categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div key={category.id} className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {posts.filter(p => p.category === category.slug).length} posts
                      </span>
                      <Badge variant="outline">{category.slug}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Comments ({pendingComments.length})</CardTitle>
              <CardDescription>Review and moderate comments</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingComments.length > 0 ? (
                <div className="space-y-3">
                  {pendingComments.map(comment => (
                    <div key={comment.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{comment.author_name || comment.user?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            on "{comment.blog_post?.title}"
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{comment.content}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveComment(comment.id)}>
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteComment(comment.id)}>
                          <X className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No pending comments</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comments.filter(c => c.is_approved).slice(0, 10).map(comment => (
                  <div key={comment.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{comment.author_name || comment.user?.full_name}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      on "{comment.blog_post?.title}"
                    </p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedBlogManager;

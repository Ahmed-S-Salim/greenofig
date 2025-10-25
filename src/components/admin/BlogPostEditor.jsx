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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const BlogPostEditor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!postId);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        setIsFetching(true);
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) {
          toast({ title: 'Error fetching post data', description: error.message, variant: 'destructive' });
          navigate('/app/admin');
        } else if (data) {
          setTitle(data.title);
          setContent(data.content);
          setCoverImageUrl(data.cover_image_url || '');
          setStatus(data.status);
        }
        setIsFetching(false);
      };
      fetchPost();
    }
  }, [postId, navigate]);

  const handleSave = async () => {
    if (!title || !content) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }
    setLoading(true);

    const postData = {
      title,
      content,
      cover_image_url: coverImageUrl,
      status,
      author_id: user.id,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    let error;
    if (postId) {
      const { error: updateError } = await supabase.from('blog_posts').update(postData).eq('id', postId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('blog_posts').insert(postData);
      error = insertError;
    }

    if (error) {
      toast({ title: 'Error saving post', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Post saved successfully!' });
      navigate('/app/admin');
    }
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
      className="max-w-4xl mx-auto py-10"
    >
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">{postId ? 'Edit Post' : 'Create New Post'}</h1>
      </div>

      <Card className="glass-effect">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input id="title" placeholder="Your amazing blog post title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" placeholder="Write your masterpiece here..." value={content} onChange={(e) => setContent(e.target.value)} rows={15} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover Image URL</Label>
            <Input id="cover-image" placeholder="https://source.unsplash.com/random" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Status: <span className="capitalize ml-2 font-semibold">{status}</span></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-effect">
                <DropdownMenuItem onClick={() => setStatus('draft')}>Draft</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus('published')}>Published</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus('archived')}>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {postId ? 'Update Post' : 'Save Post'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlogPostEditor;
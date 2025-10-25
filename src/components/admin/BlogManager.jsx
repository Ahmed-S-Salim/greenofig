import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Loader2, FileText } from 'lucide-react';

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        status,
        created_at,
        user_profiles (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching blog posts', description: error.message, variant: 'destructive' });
    } else {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
    if (error) {
      toast({ title: 'Error deleting post', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Post deleted successfully' });
      fetchPosts();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Blog Post Management</h2>
        <Button onClick={() => navigate('/app/admin/blog/new')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </motion.div>

      <Card className="glass-effect">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-4 text-lg">Loading Posts...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4">Title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <motion.tr variants={itemVariants} key={post.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 font-medium">{post.title}</td>
                      <td className="p-4 text-text-secondary">{post.user_profiles?.full_name || 'N/A'}</td>
                      <td className="p-4">{getStatusBadge(post.status)}</td>
                      <td className="p-4 text-text-secondary">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/app/admin/blog/edit/${post.id}`)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {posts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-white">No blog posts</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlogManager;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Loader2, Calendar, User, ArrowLeft } from 'lucide-react';
import SiteLayout from '@/components/SiteLayout';
import { toast } from '@/components/ui/use-toast';
import FloatingFruits from '@/components/ui/FloatingFruits';

const BlogPage = ({ logoUrl }) => {
  const { postId } = useParams();
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (postId) {
        // Fetch single post - simplified query without user_profiles join
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            title,
            content,
            featured_image_url,
            published_at,
            author_id
          `)
          .eq('id', postId)
          .single();

        if (error || !data) {
          console.error('Post fetch error:', error);
          toast({ title: 'Error fetching post', description: 'This blog post could not be found.', variant: 'destructive' });
          navigate('/blog');
        } else {
          setPost(data);
        }
      } else {
        // Fetch all posts - simplified query without user_profiles join to avoid RLS issues
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            content,
            featured_image_url,
            published_at,
            author_id
          `)
          .eq('status', 'published')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Blog fetch error:', error);
          toast({ title: 'Error fetching blog posts', description: error.message, variant: 'destructive' });
          setPosts([]);
        } else {
          setPosts(data || []);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [postId, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  const truncateText = (text, length) => {
    if (!text) return '';
    const strippedText = text.replace(/<\/?[^>]+(>|$)/g, "");
    if (strippedText.length <= length) return strippedText;
    return strippedText.substring(0, length) + '...';
  };

  // Grid View Component (Original BlogPage style)
  const GridView = () => {
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No Posts Yet!</h2>
          <p className="text-text-secondary mt-2">Check back soon for exciting articles on health and wellness.</p>
        </div>
      );
    }

    return (<motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
    >
      {posts.map((post) => (
        <motion.div variants={itemVariants} key={post.id}>
          <Card className="h-full flex flex-col glass-effect overflow-hidden group rounded-2xl" style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}>
            <div className="aspect-video overflow-hidden cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>
              <img
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src={post.featured_image_url || "https://images.unsplash.com/photo-1504983875-d3b163aba9e6"} />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>{post.title}</CardTitle>
              <div className="flex items-center gap-2 pt-2">
                <img alt="GreenoFig Team" className="w-6 h-6 rounded-full" src="https://images.unsplash.com/photo-1652841190565-b96e0acbae17" />
                <span className="text-sm text-text-secondary">GreenoFig Team</span>
                <span className="text-sm text-text-secondary">·</span>
                <span className="text-sm text-text-secondary">{new Date(post.published_at).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-text-secondary">{truncateText(post.content, 100)}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate(`/blog/${post.id}`)} variant="link" className="p-0 text-primary">
                Read More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>);
  };

  // Featured View Component (Original ArticlesPage style)
  const FeaturedView = () => {
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No Posts Yet!</h2>
          <p className="text-text-secondary mt-2">Check back soon for exciting articles on health and wellness.</p>
        </div>
      );
    }

    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    return (<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12 max-w-7xl mx-auto">
      {featuredPost && (
        <motion.div variants={itemVariants} className="group">
          <div className="grid lg:grid-cols-2 gap-8 items-center glass-effect p-8 rounded-2xl" style={{
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}>
            <div className="aspect-video overflow-hidden rounded-lg cursor-pointer" onClick={() => navigate(`/blog/${featuredPost.id}`)}>
              <img
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src={featuredPost.featured_image_url || "https://images.unsplash.com/photo-1543362906-acfc16c67564"}
              />
            </div>
            <div>
              <p className="text-sm text-primary font-semibold mb-2">Featured Article</p>
              <h2 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/blog/${featuredPost.id}`)}>{featuredPost.title}</h2>
              <p className="text-text-secondary mb-4">{truncateText(featuredPost.content, 150)}</p>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>GreenoFig Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(featuredPost.published_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {otherPosts.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post) => (
            <motion.div variants={itemVariants} key={post.id} className="glass-effect p-6 rounded-2xl group flex flex-col" style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}>
              <div className="aspect-video overflow-hidden rounded-lg mb-4 cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>
                <img
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={post.featured_image_url || "https://images.unsplash.com/photo-1490645935967-10de6ba17061"}
                />
              </div>
              <h3 className="text-xl font-bold mb-2 flex-grow group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>{post.title}</h3>
              <p className="text-text-secondary text-sm mb-4">{truncateText(post.content, 80)}</p>
              <div className="flex items-center justify-between text-xs text-text-secondary mt-auto">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>GreenoFig Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(post.published_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Single Post View
  if (postId && post) {
    return (
      <SiteLayout logoUrl={logoUrl}>
        <Helmet>
          <title>{post.title} - GreenoFig Blog</title>
          <meta name="description" content={post.content.substring(0, 160)} />
        </Helmet>
        <FloatingFruits />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto px-4 py-8"
        >
          <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          <article>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight"
            >
              {post.title}
            </motion.h1>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
              className="flex items-center gap-6 text-text-secondary mb-8"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>GreenoFig Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="aspect-video rounded-xl overflow-hidden mb-8 glass-effect"
            >
              <img src={post.featured_image_url || 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6'} alt={post.title} className="w-full h-full object-cover" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="prose prose-invert max-w-none text-lg leading-relaxed text-text-secondary prose-h2:text-text-primary prose-h3:text-text-primary prose-strong:text-text-primary"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </article>
        </motion.div>
      </SiteLayout>
    );
  }

  // Blog List View
  return (
    <SiteLayout logoUrl={logoUrl}>
      <Helmet>
        <title>Blog - GreenoFig</title>
        <meta name="description" content="Latest articles, tips, and insights on health, wellness, and nutrition from the GreenoFig team." />
        <link rel="canonical" href="https://greenofig.com/blog" />
        <meta property="og:title" content="Blog - GreenoFig" />
        <meta property="og:description" content="Latest articles, tips, and insights on health, wellness, and nutrition from the GreenoFig team." />
        <meta property="og:url" content="https://greenofig.com/blog" />
        <meta property="og:type" content="website" />
      </Helmet>
      <FloatingFruits />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Green Fruit Banner - FULL WIDTH */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 rounded-3xl overflow-hidden mx-auto max-w-7xl"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 139, 34, 0.12), rgba(16, 185, 129, 0.12))',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.1)',
          }}
        >
          {/* Static fruit decorations */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute top-4 left-6 text-4xl">🍏</div>
            <div className="absolute top-6 right-10 text-5xl">🥦</div>
            <div className="absolute bottom-4 left-16 text-4xl">🥝</div>
            <div className="absolute bottom-6 right-8 text-5xl">🥒</div>
            <div className="absolute top-12 left-1/3 text-3xl">🥑</div>
            <div className="absolute bottom-10 right-1/3 text-4xl">🍊</div>
          </div>

          <div className="relative z-10 text-center py-16 px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
              The <span className="gradient-text">GreenoFig</span> Blog
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-text-secondary">
              Insights, tips, and stories on your journey to a healthier life.
            </p>
          </div>
        </motion.div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">No Posts Yet!</h2>
            <p className="text-text-secondary mt-2">Check back soon for exciting articles on health and wellness.</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="glass-effect bg-transparent border border-primary/20 p-1">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-6"
                >
                  All Posts
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-text-primary rounded-full px-6"
                >
                  Featured Articles
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              <GridView />
            </TabsContent>

            <TabsContent value="featured">
              <FeaturedView />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </SiteLayout>
  );
};

export default BlogPage;
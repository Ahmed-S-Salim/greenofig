import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/config';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Loader2, Calendar, User, ArrowLeft, Clock, List } from 'lucide-react';
import SiteLayout from '@/components/SiteLayout';
import { toast } from '@/components/ui/use-toast';
import DOMPurify from 'dompurify';
import FloatingFruits from '@/components/ui/FloatingFruits';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import AdContainer from '@/components/ads/AdContainer';

const BlogPage = ({ logoUrl }) => {
  const { t } = useTranslation();
  const params = useParams();
  const { hasAds } = useFeatureAccess();
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [tableOfContents, setTableOfContents] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // Helper function to check if string is a UUID
  const isUUID = (str) => {
    if (!str) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  // Helper function to get localized content
  const getLocalizedContent = (post, field) => {
    if (!post) return '';
    const currentLang = localStorage.getItem('language') || 'en';
    const arField = `${field}_ar`;
    return (currentLang === 'ar' && post[arField]) ? post[arField] : post[field];
  };

  // Helper function to create URL-friendly slug from title (extracts 3 main keywords)
  const createSlug = (title) => {
    if (!title) return '';

    // Common words to filter out (stop words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'your', 'you', 'how'];

    // Split title into words and filter
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .split(/\s+/)
      .filter(word => word.length > 0 && !stopWords.includes(word));

    // Take first 3 meaningful words
    const keywords = words.slice(0, 3);

    return keywords.join('-');
  };

  // Helper function to get post URL (uses only slug, stores ID in state)
  const getPostUrl = (postData) => {
    if (!postData) return '#';
    const slug = createSlug(postData.title);
    // Store the ID-to-slug mapping for navigation
    return `/blog/${slug}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      // If we already have a post, use transition mode (smoother)
      // Otherwise use loading mode (initial load)
      if (post) {
        setIsTransitioning(true);
      } else {
        setLoading(true);
      }

      // Extract postId and slug from params
      let postId = null;
      let slug = null;

      if (params.postId) {
        if (isUUID(params.postId)) {
          postId = params.postId;
          slug = params.slug; // Optional slug after UUID
        } else {
          // If postId is not a UUID, treat it as a slug
          slug = params.postId;
        }
      } else if (params.slug) {
        slug = params.slug;
      }

      if (postId || slug) {
        // If we have a slug, we need to fetch posts and match by title
        if (slug && !postId) {
          // Fetch all published posts to find by slug
          const { data: allPosts, error: fetchError } = await supabase
            .from('blog_posts')
            .select(`
              id,
              title,
              title_ar,
              content,
              content_ar,
              featured_image_url,
              published_at,
              author_id
            `)
            .eq('status', 'published')
            .not('published_at', 'is', null);

          if (fetchError || !allPosts) {
            console.error('Posts fetch error:', fetchError);
            toast({ title: 'Error fetching post', description: 'This blog post could not be found.', variant: 'destructive' });
            navigate('/blog');
          } else {
            // Find post by matching slug
            const foundPost = allPosts.find(p => createSlug(p.title) === slug);

            if (!foundPost) {
              toast({ title: 'Post not found', description: 'This blog post could not be found.', variant: 'destructive' });
              navigate('/blog');
            } else {
              setPost(foundPost);

              // Fetch related posts
              const { data: related } = await supabase
                .from('blog_posts')
                .select('id, title, title_ar, featured_image_url, published_at')
                .eq('status', 'published')
                .neq('id', foundPost.id)
                .not('published_at', 'is', null)
                .order('published_at', { ascending: false })
                .limit(3);

              if (related) {
                setRelatedPosts(related);
              }
            }
          }
        } else if (postId) {
          // Backwards compatibility: Fetch by ID
          const { data, error } = await supabase
            .from('blog_posts')
            .select(`
              title,
              title_ar,
              content,
              content_ar,
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

            // Fetch related posts (same author or recent)
            const { data: related } = await supabase
              .from('blog_posts')
              .select('id, title, title_ar, featured_image_url, published_at')
              .eq('status', 'published')
              .neq('id', postId)
              .not('published_at', 'is', null)
              .order('published_at', { ascending: false })
              .limit(3);

            if (related) {
              setRelatedPosts(related);
            }
          }
        }
      } else {
        // Fetch recent posts - optimized query without content for faster loading
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            title_ar,
            featured_image_url,
            published_at,
            author_id
          `)
          .eq('status', 'published')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Blog fetch error:', error);
          toast({ title: 'Error fetching blog posts', description: error.message, variant: 'destructive' });
          setPosts([]);
        } else {
          setPosts(data || []);
        }
      }

      setLoading(false);
      setIsTransitioning(false);
    };

    fetchData();
  }, [params.postId, params.slug, navigate]);

  // Scroll to top when post changes
  useEffect(() => {
    if (post && !isTransitioning) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [post, isTransitioning]);

  // Extract table of contents from post content
  useEffect(() => {
    if (post && post.content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = post.content;
      const headings = tempDiv.querySelectorAll('h2, h3');

      const toc = Array.from(headings).map((heading, index) => {
        const id = `section-${index}`;
        const text = heading.textContent;
        const level = heading.tagName.toLowerCase();
        return { id, text, level };
      });

      setTableOfContents(toc);
    }
  }, [post]);

  // Add IDs to headings and track scroll position
  useEffect(() => {
    if (contentRef.current && tableOfContents.length > 0) {
      const headings = contentRef.current.querySelectorAll('h2, h3');
      headings.forEach((heading, index) => {
        heading.id = `section-${index}`;
      });

      const handleScroll = () => {
        const scrollPosition = window.scrollY + 100;

        for (let i = headings.length - 1; i >= 0; i--) {
          const heading = headings[i];
          if (heading.offsetTop <= scrollPosition) {
            setActiveSection(heading.id);
            break;
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [tableOfContents]);

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
          <h2 className="text-2xl font-semibold">{t('blog.noPostsFound')}</h2>
          <p className="text-text-secondary mt-2">{t('blog.subtitle')}</p>
        </div>
      );
    }

    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {posts.map((post, index) => (
        <div key={post.id} className="animate-item">
          <Card className="card card-scale h-full flex flex-col glass-effect overflow-hidden group rounded-2xl" style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}>
            <div className="aspect-video overflow-hidden cursor-pointer img-zoom" onClick={() => navigate(getPostUrl(post))}>
              <img
                alt={getLocalizedContent(post, 'title')}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src={post.featured_image_url || "https://images.unsplash.com/photo-1504983875-d3b163aba9e6"} />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(getPostUrl(post))}>{getLocalizedContent(post, 'title')}</CardTitle>
              <div className="flex items-center gap-2 pt-2">
                <img alt="GreenoFig Team" className="w-6 h-6 rounded-full" src="https://images.unsplash.com/photo-1652841190565-b96e0acbae17" />
                <span className="text-sm text-text-secondary">GreenoFig Team</span>
                <span className="text-sm text-text-secondary">·</span>
                <span className="text-sm text-text-secondary">{new Date(post.published_at).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-text-secondary">Click to read this article about health and wellness.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate(getPostUrl(post))} variant="link" className="p-0 text-primary">
                {t('blog.readMore')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>);
  };

  // Featured View Component - Shows additional articles
  const FeaturedView = () => {
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No Posts Yet!</h2>
          <p className="text-text-secondary mt-2">Check back soon for exciting articles on health and wellness.</p>
        </div>
      );
    }

    const otherPosts = posts.slice(1); // Skip first post as it's shown above

    return (<div className="space-y-12 max-w-7xl mx-auto">
      {otherPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post, index) => (
            <div key={post.id} className="card card-scale glass-effect p-6 rounded-2xl group flex flex-col animate-item" style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}>
              <div className="aspect-video overflow-hidden rounded-lg mb-4 cursor-pointer img-zoom" onClick={() => navigate(getPostUrl(post))}>
                <img
                  alt={getLocalizedContent(post, 'title')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={post.featured_image_url || "https://images.unsplash.com/photo-1490645935967-10de6ba17061"}
                />
              </div>
              <h3 className="text-xl font-bold mb-2 flex-grow group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(getPostUrl(post))}>{getLocalizedContent(post, 'title')}</h3>
              <p className="text-text-secondary text-sm mb-4">Explore this article on health and wellness.</p>
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
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-text-secondary">Check back soon for more articles!</p>
        </div>
      )}
    </div>);
  };

  // Single Post View - Show if URL indicates single post (even if still loading)
  if (params.postId || params.slug) {
    // If we have the post data, show it
    if (post) {
      return (
        <>
          <FloatingFruits />
          <SiteLayout logoUrl={logoUrl}>
          <Helmet>
            <title>{getLocalizedContent(post, 'title')} - GreenoFig Blog</title>
            <meta name="description" content={getLocalizedContent(post, 'content').substring(0, 160)} />
          </Helmet>
          <div className="page-section max-w-7xl mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('blog.backToBlog')}
            </Button>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* Main Article Content */}
            <article>
              <h1 className="hero-content text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                {getLocalizedContent(post, 'title')}
              </h1>

              <div className="section-content flex items-center gap-6 text-text-secondary mb-8">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>GreenoFig Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>4 min read</span>
                </div>
              </div>

              <div className="animate-item aspect-video rounded-xl overflow-hidden mb-8 glass-effect img-zoom">
                <img src={post.featured_image_url || 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6'} alt={getLocalizedContent(post, 'title')} className="w-full h-full object-cover" />
              </div>

              <div
                ref={contentRef}
                className="section-content prose prose-invert max-w-none text-lg leading-relaxed text-text-secondary prose-h2:text-text-primary prose-h3:text-text-primary prose-strong:text-text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 prose-a:transition-colors prose-a:duration-200 glass-effect rounded-xl p-8 border border-border/50"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getLocalizedContent(post, 'content').replace(/\n/g, '<br />'), {
                  ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'span', 'div'],
                  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'target', 'rel'],
                  ADD_ATTR: ['target'],
                  FORCE_BODY: true
                }) }}
              />

              {/* Related Posts Section */}
              {relatedPosts.length > 0 && (
                <div className="mt-16 pt-8 border-t border-border/50">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <ArrowRight className="w-6 h-6 text-primary" />
                    {t('blog.relatedPosts')}
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <Card
                        key={relatedPost.id}
                        className="card card-scale glass-effect overflow-hidden group cursor-pointer"
                        onClick={() => navigate(getPostUrl(relatedPost))}
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={relatedPost.featured_image_url || 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6'}
                            alt={getLocalizedContent(relatedPost, 'title')}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            {getLocalizedContent(relatedPost, 'title')}
                          </CardTitle>
                          <p className="text-xs text-text-secondary">
                            {new Date(relatedPost.published_at).toLocaleDateString()}
                          </p>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Table of Contents Sidebar */}
            {tableOfContents.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 glass-effect rounded-xl p-6 border border-border/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <List className="w-5 h-5 text-primary" />
                    {t('blog.tableOfContents')}
                  </h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`block text-sm transition-all duration-200 ${
                          item.level === 'h3' ? 'pl-4' : ''
                        } ${
                          activeSection === item.id
                            ? 'text-primary font-semibold'
                            : 'text-text-secondary hover:text-primary'
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </div>
      </SiteLayout>
      </>
      );
    } else {
      // Loading state while fetching post - don't show blog list
      return (
        <>
          <FloatingFruits />
          <SiteLayout logoUrl={logoUrl}>
            <div className="page-section max-w-7xl mx-auto px-4 py-8">
              <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
              <div className="text-center py-20">
                {loading && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />}
              </div>
            </div>
          </SiteLayout>
        </>
      );
    }
  }

  // Blog List View
  return (
    <>
      <FloatingFruits />
      <SiteLayout logoUrl={logoUrl}>
      <Helmet>
        <title>{t('blog.title')} - GreenoFig</title>
        <meta name="description" content={t('blog.subtitle')} />
        <link rel="canonical" href="https://greenofig.com/blog" />
        <meta property="og:title" content={`${t('blog.title')} - GreenoFig`} />
        <meta property="og:description" content={t('blog.subtitle')} />
        <meta property="og:url" content="https://greenofig.com/blog" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="w-full">
        {/* Green Fruit Banner - FULL WIDTH RECTANGULAR with Glass Morphism */}
        <div className="hero-section relative overflow-hidden w-full pb-6 z-20"
          style={{
            background: 'rgba(125, 230, 75, 0.2)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(125, 230, 75, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        >
          <div className="hero-content relative z-10 text-center py-10 px-4 flex flex-col justify-center min-h-[200px]">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 text-white">
              {i18n.language === 'ar' ? (
                <>
                  <span className="gradient-text">مدونة</span> الصحة والعافية
                </>
              ) : (
                <>
                  Health & Wellness <span className="gradient-text">Blog</span>
                </>
              )}
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-200">
              {t('blog.subtitle')}
            </p>
          </div>
        </div>

        {/* Featured Post Behind Banner */}
        {!loading && posts.length > 0 && (
          <div className="w-full relative px-4 sm:px-6 lg:px-8">
            <div className="section-content w-full mx-auto -mt-4 relative z-0">
              <div className="card card-scale grid lg:grid-cols-2 gap-0 glass-effect rounded-2xl border border-green-500/30 overflow-hidden" style={{ minHeight: '210px' }}>
                <div className="cursor-pointer h-full" onClick={() => navigate(getPostUrl(posts[0]))}>
                  <img
                    alt={getLocalizedContent(posts[0], 'title')}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    src={posts[0].featured_image_url || "https://images.unsplash.com/photo-1543362906-acfc16c67564"}
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <p className="text-sm text-primary font-semibold mb-3">Latest Article</p>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white hover:text-primary transition-colors cursor-pointer leading-tight" onClick={() => navigate(getPostUrl(posts[0]))}>{getLocalizedContent(posts[0], 'title')}</h2>
                  <p className="text-text-secondary text-sm md:text-base mb-6 leading-relaxed">Discover the latest insights on health, wellness, and nutrition from the GreenoFig team.</p>
                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(posts[0].published_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>4 min read</span>
                    </div>
                  </div>
                  <Button onClick={() => navigate(getPostUrl(posts[0]))} className="btn-primary">
                    Read Full Article <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Native Ad for Blog - Only for Basic users */}
          {hasAds && (
            <div className="mb-8">
              <AdContainer placementName="blog_inline" />
            </div>
          )}

          <h2 className="text-3xl font-bold mb-8 text-center">More Articles</h2>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold">No Posts Yet!</h2>
              <p className="text-text-secondary mt-2">Check back soon for exciting articles on health and wellness.</p>
            </div>
          ) : (
            <GridView />
          )}
        </div>
      </div>
    </SiteLayout>
    </>
  );
};

export default BlogPage;
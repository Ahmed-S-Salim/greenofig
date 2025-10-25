import { supabase } from './customSupabaseClient';

/**
 * Track a blog post view
 * Call this when a user views a blog post
 */
export const trackBlogView = async (postId, userId = null) => {
  try {
    // Get IP address (client-side approximation - for real IP, use server-side)
    const ipAddress = null; // Would need server-side implementation

    // Get user agent
    const userAgent = navigator.userAgent;

    // Get referrer
    const referrer = document.referrer || null;

    // Insert view record
    const { error } = await supabase.from('blog_post_views').insert({
      post_id: postId,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer,
      viewed_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking blog view:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error tracking blog view:', error);
    return { success: false, error };
  }
};

/**
 * Get view analytics for a specific post
 */
export const getPostAnalytics = async (postId, daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const { data, error } = await supabase
      .from('blog_post_views')
      .select('*')
      .eq('post_id', postId)
      .gte('viewed_at', startDate.toISOString());

    if (error) {
      console.error('Error fetching post analytics:', error);
      return { success: false, error };
    }

    // Calculate analytics
    const totalViews = data.length;
    const uniqueUsers = new Set(data.filter(v => v.user_id).map(v => v.user_id)).size;

    // Group by date
    const viewsByDate = data.reduce((acc, view) => {
      const date = new Date(view.viewed_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Top referrers
    const referrers = data.reduce((acc, view) => {
      if (view.referrer) {
        acc[view.referrer] = (acc[view.referrer] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      success: true,
      analytics: {
        totalViews,
        uniqueUsers,
        viewsByDate,
        topReferrers: Object.entries(referrers)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([url, count]) => ({ url, count }))
      }
    };
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    return { success: false, error };
  }
};

/**
 * Get popular posts
 */
export const getPopularPosts = async (limit = 10, daysBack = 30) => {
  try {
    const { data, error } = await supabase
      .rpc('get_popular_posts', {
        days_back: daysBack,
        limit_count: limit
      });

    if (error) {
      console.error('Error fetching popular posts:', error);
      return { success: false, error };
    }

    return { success: true, posts: data };
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    return { success: false, error };
  }
};

/**
 * Get blog statistics
 */
export const getBlogStatistics = async () => {
  try {
    const { data, error } = await supabase.rpc('get_blog_statistics');

    if (error) {
      console.error('Error fetching blog statistics:', error);
      return { success: false, error };
    }

    return { success: true, statistics: data[0] || {} };
  } catch (error) {
    console.error('Error fetching blog statistics:', error);
    return { success: false, error };
  }
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Play, Clock, User, Search, TrendingUp, Award, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MasterclassVideos = () => {
  const { userProfile } = useAuth();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMasterclassVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [searchQuery, selectedCategory, videos]);

  const fetchMasterclassVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('masterclass_videos')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching masterclass videos:', error);
        return;
      }

      setVideos(data || []);
      setFilteredVideos(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchMasterclassVideos:', error);
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        video =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    setFilteredVideos(filtered);
  };

  const playVideo = async (video) => {
    setSelectedVideo(video);

    // Track video view and update progress
    if (userProfile?.id) {
      try {
        // Increment view count
        await supabase
          .from('masterclass_videos')
          .update({ view_count: (video.view_count || 0) + 1 })
          .eq('id', video.id);

        // Check if user has progress for this video
        const { data: existingProgress } = await supabase
          .from('user_video_progress')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('video_id', video.id)
          .maybeSingle();

        if (!existingProgress) {
          // Create new progress record
          await supabase.from('user_video_progress').insert({
            user_id: userProfile.id,
            video_id: video.id,
            progress_seconds: 0,
            completed: false,
          });
        }
      } catch (error) {
        console.error('Error tracking video progress:', error);
      }
    }
  };

  const categories = ['all', 'nutrition', 'cooking', 'mindset', 'fitness', 'lifestyle'];

  if (loading) {
    return (
      <Card className="glass-effect border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-500" />
            Masterclass Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-video bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-effect border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-500" />
              Masterclass Videos
            </CardTitle>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              Elite Exclusive
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Learn from world-class experts in nutrition, fitness, and wellness
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(category => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No videos found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => playVideo(video)}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          <Play className="w-16 h-16 text-purple-500/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-8 h-8 text-black ml-1" />
                        </div>
                      </div>
                      {video.duration_minutes && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {video.duration_minutes} min
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {video.instructor_name}
                      </div>
                      <div className="flex items-center gap-3">
                        {video.view_count > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {video.view_count} views
                          </div>
                        )}
                        {video.category && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {video.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-80">
                    Video player integration coming soon
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    Will support YouTube, Vimeo, and direct video uploads
                  </p>
                </div>
              </div>

              {/* Video Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{selectedVideo.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedVideo.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {selectedVideo.duration_minutes} min
                  </div>
                </div>

                {/* Instructor Info */}
                {selectedVideo.instructor_name && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{selectedVideo.instructor_name}</div>
                        <div className="text-xs text-muted-foreground">Instructor</div>
                      </div>
                    </div>
                    {selectedVideo.instructor_bio && (
                      <p className="text-sm text-muted-foreground">
                        {selectedVideo.instructor_bio}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MasterclassVideos;

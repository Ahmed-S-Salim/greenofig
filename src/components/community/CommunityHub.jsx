import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import {
  Trophy,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Users,
  Target,
  Award,
  Flame,
  Calendar,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Community Hub Component
 * Features:
 * - User success stories
 * - Health challenges (7-day, 30-day)
 * - Leaderboards
 * - Social sharing
 *
 * Addresses competitor advantage: MyFitnessPal & Noom have active communities
 */
const CommunityHub = () => {
  const { userProfile } = useAuth();
  const [successStories, setSuccessStories] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [myAchievements, setMyAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      loadCommunityData();
    }
  }, [userProfile?.id]);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      // Load success stories (approved ones)
      const { data: stories } = await supabase
        .from('success_stories')
        .select(`
          *,
          user_profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      setSuccessStories(stories || []);

      // Load active challenges
      const { data: challenges } = await supabase
        .from('community_challenges')
        .select('*, challenge_participants(count)')
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      setActiveChallenges(challenges || []);

      // Load user's achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', userProfile.id)
        .order('earned_at', { ascending: false });

      setMyAchievements(achievements || []);

      // Load leaderboard (top 10 users by points this month)
      const { data: leaders } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url, community_points')
        .order('community_points', { ascending: false })
        .limit(10);

      setLeaderboard(leaders || []);

    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: userProfile.id,
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: 'Challenge Joined!',
        description: 'Good luck! Check your progress in the Challenges tab.',
      });

      loadCommunityData();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to join challenge',
        variant: 'destructive',
      });
    }
  };

  const likeStory = async (storyId) => {
    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (existing) {
        // Unlike
        await supabase
          .from('story_likes')
          .delete()
          .eq('id', existing.id);
      } else {
        // Like
        await supabase
          .from('story_likes')
          .insert({
            story_id: storyId,
            user_id: userProfile.id,
          });
      }

      loadCommunityData();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                GreenoFig Community
              </CardTitle>
              <CardDescription>
                Connect with others on your health journey
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Your Points</p>
              <p className="text-2xl font-bold text-primary">
                {userProfile?.community_points || 0}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="stories" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="stories">
            <Heart className="h-4 w-4 mr-2" />
            Success Stories
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Trophy className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <TrendingUp className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Success Stories Tab */}
        <TabsContent value="stories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {successStories.map((story) => (
              <Card key={story.id} className="glass-effect">
                <CardContent className="pt-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={story.user_profiles?.avatar_url} />
                      <AvatarFallback>
                        {story.user_profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{story.user_profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(story.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {story.weight_lost}kg lost
                    </Badge>
                  </div>

                  {/* Story Content */}
                  <h3 className="font-semibold mb-2">{story.title}</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    {story.story.substring(0, 150)}...
                  </p>

                  {/* Before/After Photos */}
                  {story.before_photo_url && story.after_photo_url && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Before</p>
                        <img
                          src={story.before_photo_url}
                          alt="Before"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">After</p>
                        <img
                          src={story.after_photo_url}
                          alt="After"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeStory(story.id)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {story.likes_count || 0}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="glass-effect relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  challenge.difficulty === 'easy' ? 'from-green-500/10 to-green-700/10' :
                  challenge.difficulty === 'medium' ? 'from-orange-500/10 to-orange-700/10' :
                  'from-red-500/10 to-red-700/10'
                }`} />
                <CardContent className="relative pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{challenge.title}</h3>
                    </div>
                    <Badge variant="outline">{challenge.duration} days</Badge>
                  </div>

                  <p className="text-sm text-text-secondary mb-4">
                    {challenge.description}
                  </p>

                  {/* Challenge Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 rounded bg-background/30">
                      <p className="text-xs text-text-secondary">Participants</p>
                      <p className="font-semibold">{challenge.challenge_participants?.[0]?.count || 0}</p>
                    </div>
                    <div className="p-2 rounded bg-background/30">
                      <p className="text-xs text-text-secondary">Reward</p>
                      <p className="font-semibold">{challenge.points_reward} pts</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-2 mb-4 text-xs text-text-secondary">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => joinChallenge(challenge.id)}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Join Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Top Contributors This Month</CardTitle>
              <CardDescription>Earn points by completing challenges and sharing progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      user.id === userProfile.id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-background/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-background/50'
                    }`}>
                      {index + 1}
                    </div>

                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p className="font-semibold">
                        {user.full_name}
                        {user.id === userProfile.id && (
                          <Badge variant="secondary" className="ml-2">You</Badge>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-primary">{user.community_points || 0}</p>
                      <p className="text-xs text-text-secondary">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myAchievements.length === 0 ? (
              <Card className="glass-effect col-span-3">
                <CardContent className="text-center py-12">
                  <Award className="h-12 w-12 mx-auto text-text-secondary mb-4" />
                  <p className="text-text-secondary">No achievements yet. Complete challenges to earn badges!</p>
                </CardContent>
              </Card>
            ) : (
              myAchievements.map((achievement) => (
                <Card key={achievement.id} className="glass-effect">
                  <CardContent className="text-center pt-6">
                    <div className="text-4xl mb-3">{achievement.achievements.icon}</div>
                    <h3 className="font-semibold mb-1">{achievement.achievements.name}</h3>
                    <p className="text-xs text-text-secondary mb-3">
                      {achievement.achievements.description}
                    </p>
                    <Badge variant="secondary">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;

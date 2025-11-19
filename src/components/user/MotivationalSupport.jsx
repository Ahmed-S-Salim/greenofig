import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, Trophy, TrendingUp, RefreshCw, Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MotivationalSupport = () => {
  const { t } = useTranslation();
  const [dailyQuote, setDailyQuote] = useState(null);
  const [milestones, setMilestones] = useState([]);

  const motivationalQuotes = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { text: "Health is not about the weight you lose, but about the life you gain.", author: "Unknown" },
    { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
    { text: "Exercise is a celebration of what your body can do, not a punishment for what you ate.", author: "Unknown" },
    { text: "A healthy outside starts from the inside.", author: "Robert Urich" },
    { text: "The greatest wealth is health.", author: "Virgil" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  ];

  const encouragementMessages = [
    { icon: '🎯', title: 'Stay Focused', message: 'Every small step counts towards your big goals!' },
    { icon: '💪', title: 'You\'re Stronger Than You Think', message: 'Keep pushing, you\'ve got this!' },
    { icon: '🌟', title: 'Shine Bright', message: 'Your dedication is inspiring!' },
    { icon: '🔥', title: 'Keep the Fire Burning', message: 'Consistency is the key to success!' },
    { icon: '🎊', title: 'Celebrate Progress', message: 'Be proud of how far you\'ve come!' },
  ];

  const achievementCelebrations = [
    { id: 1, icon: '🏆', title: 'First Week Complete', description: 'You logged 7 days of activity!', unlocked: true },
    { id: 2, icon: '💧', title: 'Hydration Champion', description: 'Met water goal 10 days in a row', unlocked: true },
    { id: 3, icon: '😴', title: 'Sleep Master', description: 'Consistent 7+ hours of sleep', unlocked: false },
    { id: 4, icon: '🥗', title: 'Nutrition Pro', description: 'Tracked all meals for a month', unlocked: false },
  ];

  useEffect(() => {
    loadDailyQuote();
    setMilestones(achievementCelebrations);
  }, []);

  const loadDailyQuote = () => {
    const today = new Date().toDateString();
    const savedQuote = localStorage.getItem('dailyQuote');
    const savedDate = localStorage.getItem('quoteDate');

    if (savedQuote && savedDate === today) {
      setDailyQuote(JSON.parse(savedQuote));
    } else {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setDailyQuote(randomQuote);
      localStorage.setItem('dailyQuote', JSON.stringify(randomQuote));
      localStorage.setItem('quoteDate', today);
    }
  };

  const getNewQuote = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setDailyQuote(randomQuote);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Heart className="w-6 h-6 text-primary" />
            {t('motivationalSupport') || 'Motivational Support'}
          </CardTitle>
          <p className="text-sm text-text-secondary">
            {t('motivationalSupportDescription') || 'Stay inspired on your health journey'}
          </p>
        </CardHeader>
      </Card>

      {/* Daily Quote */}
      {dailyQuote && (
        <Card className="glass-effect border-2 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Quote className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-lg italic mb-3">"{dailyQuote.text}"</p>
                <p className="text-sm text-text-secondary">— {dailyQuote.author}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={getNewQuote}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encouragement Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {encouragementMessages.map((msg, idx) => (
          <Card key={idx} className="glass-effect hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{msg.icon}</div>
              <h3 className="font-semibold mb-2">{msg.title}</h3>
              <p className="text-sm text-text-secondary">{msg.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievement Celebrations */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {t('recentAchievements') || 'Recent Achievements'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  milestone.unlocked
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-muted opacity-60'
                }`}
              >
                <div className="text-4xl">{milestone.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold">{milestone.title}</h4>
                  <p className="text-sm text-text-secondary">{milestone.description}</p>
                </div>
                {milestone.unlocked && (
                  <Badge className="bg-green-500/20 text-green-300">
                    <Star className="w-3 h-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Milestone Messages */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('keepGoing') || 'Keep Going!'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <p className="font-semibold">You're on the right track!</p>
                <p className="text-sm text-text-secondary mt-1">
                  Your consistency over the past week shows real commitment. Keep it up!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Heart className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <p className="font-semibold">Remember why you started</p>
                <p className="text-sm text-text-secondary mt-1">
                  Your health journey is a marathon, not a sprint. Every day is a new opportunity!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Sparkles className="w-5 h-5 text-yellow-500 mt-1" />
              <div>
                <p className="font-semibold">Small wins add up</p>
                <p className="text-sm text-text-secondary mt-1">
                  Celebrate every milestone, no matter how small. Progress is progress!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MotivationalSupport;

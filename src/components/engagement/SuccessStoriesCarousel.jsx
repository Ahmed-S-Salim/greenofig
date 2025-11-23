import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote, TrendingDown, Award, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const SuccessStoriesCarousel = ({ autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const successStories = [
    {
      id: 1,
      name: 'Sarah Thompson',
      age: 32,
      location: 'Dubai, UAE',
      avatar: '/avatars/sarah.jpg',
      beforeWeight: 85,
      afterWeight: 68,
      weightLost: 17,
      timeframe: '4 months',
      tier: 'Premium',
      quote: 'GreenoFig transformed my relationship with food. The personalized meal plans and AI recommendations made losing weight feel effortless. I\'ve never felt better!',
      achievement: 'Lost 17kg in 4 months',
      rating: 5,
      beforePhoto: '/testimonials/sarah-before.jpg',
      afterPhoto: '/testimonials/sarah-after.jpg'
    },
    {
      id: 2,
      name: 'Ahmed Al-Mansoori',
      age: 45,
      location: 'Abu Dhabi, UAE',
      avatar: '/avatars/ahmed.jpg',
      beforeWeight: 105,
      afterWeight: 88,
      weightLost: 17,
      timeframe: '6 months',
      tier: 'Elite',
      quote: 'The DNA analysis feature was game-changing. Understanding my genetic predispositions helped me optimize my diet perfectly. My nutritionist\'s guidance was invaluable.',
      achievement: 'Reversed pre-diabetes',
      rating: 5,
      beforePhoto: '/testimonials/ahmed-before.jpg',
      afterPhoto: '/testimonials/ahmed-after.jpg'
    },
    {
      id: 3,
      name: 'Maya Patel',
      age: 28,
      location: 'London, UK',
      avatar: '/avatars/maya.jpg',
      beforeWeight: 72,
      afterWeight: 65,
      weightLost: 7,
      timeframe: '3 months',
      tier: 'Pro',
      quote: 'As a busy professional, the meal prep guides and shopping lists saved me hours every week. The progress tracking kept me motivated every single day!',
      achievement: 'Achieved dream weight',
      rating: 5,
      beforePhoto: '/testimonials/maya-before.jpg',
      afterPhoto: '/testimonials/maya-after.jpg'
    },
    {
      id: 4,
      name: 'John Martinez',
      age: 38,
      location: 'New York, USA',
      avatar: '/avatars/john.jpg',
      beforeWeight: 95,
      afterWeight: 78,
      weightLost: 17,
      timeframe: '5 months',
      tier: 'Premium',
      quote: 'The gamification features made weight loss fun! Earning achievements and competing on the leaderboard kept me accountable. Best investment in my health!',
      achievement: 'Lost 17kg and gained muscle',
      rating: 5,
      beforePhoto: '/testimonials/john-before.jpg',
      afterPhoto: '/testimonials/john-after.jpg'
    },
    {
      id: 5,
      name: 'Fatima Hassan',
      age: 35,
      location: 'Riyadh, Saudi Arabia',
      avatar: '/avatars/fatima.jpg',
      beforeWeight: 78,
      afterWeight: 63,
      weightLost: 15,
      timeframe: '4 months',
      tier: 'Elite',
      quote: 'Having a dedicated nutritionist who understands my cultural food preferences made all the difference. The app\'s Arabic support is perfect!',
      achievement: 'Fit into wedding dress',
      rating: 5,
      beforePhoto: '/testimonials/fatima-before.jpg',
      afterPhoto: '/testimonials/fatima-after.jpg'
    }
  ];

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlay, interval]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % successStories.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  const currentStory = successStories[currentIndex];

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <Card className="glass-effect overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-purple-500/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">Success Stories</h3>
                <p className="text-sm text-muted-foreground">
                  Real transformations from our community
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                {currentStory.rating}.0
              </Badge>
            </div>
          </div>

          {/* Carousel Content */}
          <div className="relative overflow-hidden min-h-[500px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="p-6"
              >
                {/* User Info */}
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="w-16 h-16 ring-4 ring-primary/20">
                    <AvatarImage src={currentStory.avatar} />
                    <AvatarFallback className="text-xl">
                      {currentStory.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold">{currentStory.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentStory.age} years old • {currentStory.location}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {currentStory.tier} Member
                    </Badge>
                  </div>
                  <Quote className="w-10 h-10 text-primary/20" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-200 dark:border-red-800">
                    <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-600" />
                    <p className="text-2xl font-bold text-red-600">-{currentStory.weightLost}kg</p>
                    <p className="text-xs text-muted-foreground">Weight Lost</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">{currentStory.timeframe}</p>
                    <p className="text-xs text-muted-foreground">Timeframe</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800">
                    <p className="text-lg font-semibold text-green-600 mb-1">
                      {currentStory.beforeWeight}kg → {currentStory.afterWeight}kg
                    </p>
                    <p className="text-xs text-muted-foreground">Transformation</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-200 dark:border-yellow-800">
                    <Award className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <p className="text-xs font-semibold text-yellow-600 leading-tight">
                      {currentStory.achievement}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <div className="relative p-6 rounded-xl bg-muted/50 border">
                  <div className="absolute top-4 left-4 text-4xl text-primary/10">"</div>
                  <p className="text-lg leading-relaxed relative z-10 italic">
                    {currentStory.quote}
                  </p>
                  <div className="absolute bottom-4 right-4 text-4xl text-primary/10 rotate-180">"</div>
                </div>

                {/* Before/After Photos Placeholder */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">BEFORE</p>
                        <p className="text-3xl font-bold">{currentStory.beforeWeight}kg</p>
                      </div>
                    </div>
                    <Badge className="absolute top-2 left-2">Before</Badge>
                  </div>
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-green-200 to-emerald-300 dark:from-green-900 dark:to-emerald-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white mb-1">AFTER</p>
                        <p className="text-3xl font-bold text-white">{currentStory.afterWeight}kg</p>
                      </div>
                    </div>
                    <Badge className="absolute top-2 left-2 bg-green-600">After</Badge>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center justify-center gap-1 mt-6">
                  {[...Array(currentStory.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 left-4 right-4 flex justify-between items-center pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="pointer-events-auto bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="pointer-events-auto bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 p-4 bg-muted/30">
            {successStories.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Summary Footer */}
          <div className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border-t">
            <p className="text-center text-sm text-muted-foreground">
              <span className="font-semibold text-primary">
                {successStories.length} inspiring transformations
              </span>
              {' '}• Join thousands achieving their goals with GreenoFig
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessStoriesCarousel;

import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import SiteLayout from '@/components/SiteLayout';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Star, MessageSquarePlus, Send, Loader2 } from 'lucide-react';
    import { toast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const ReviewCard = ({ review, index }) => {
      const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } },
      };

      const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
      };

      // Use Arabic content if language is Arabic and Arabic content exists
      const currentLang = localStorage.getItem('language') || 'en';
      const customerTitle = (currentLang === 'ar' && review.customer_title_ar) ? review.customer_title_ar : review.customer_title;
      const quote = (currentLang === 'ar' && review.quote_ar) ? review.quote_ar : review.quote;

      return (
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="glass-effect h-full flex flex-col">
            <CardContent className="p-6 flex flex-col flex-grow">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={review.avatar_url || review.customer_image} alt={review.customer_name} />
                  <AvatarFallback>{getInitials(review.customer_name)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-bold text-lg">{review.customer_name}</p>
                  {customerTitle && <p className="text-xs text-text-secondary">{customerTitle}</p>}
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-text-secondary text-sm flex-grow">{quote}</p>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    const ReviewForm = ({ setOpen }) => {
      const { t } = useTranslation();
      const [formData, setFormData] = useState({
        name: '',
        title: '',
        review: '',
        rating: 0
      });
      const [submitting, setSubmitting] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.rating === 0) {
          toast({
            title: t('reviews.ratingRequiredError'),
            description: t('reviews.ratingRequiredMessage'),
            variant: 'destructive'
          });
          return;
        }

        setSubmitting(true);

        try {
          const { error } = await supabase
            .from('testimonials')
            .insert([{
              customer_name: formData.name,
              customer_title: formData.title,
              quote: formData.review,
              rating: formData.rating,
              is_featured: false,
              is_approved: true,
              display_order: 9999,
              created_at: new Date().toISOString()
            }]);

          if (error) throw error;

          toast({
            title: t('reviews.reviewSubmitted'),
            description: t('reviews.thankYou'),
          });

          setOpen(false);
          window.location.reload();
        } catch (error) {
          console.error('Error submitting review:', error);
          toast({
            title: t('reviews.submissionFailed'),
            description: error.message || t('reviews.tryAgainLater'),
            variant: 'destructive'
          });
        } finally {
          setSubmitting(false);
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('reviews.yourName')}</Label>
            <Input
              id="name"
              placeholder={t('reviews.namePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-title">{t('reviews.reviewTitle')}</Label>
            <Input
              id="review-title"
              placeholder={t('reviews.reviewTitlePlaceholder')}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review">{t('reviews.yourReview')}</Label>
            <Textarea
              id="review"
              placeholder={t('reviews.reviewPlaceholder')}
              value={formData.review}
              onChange={(e) => setFormData({...formData, review: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t('reviews.ratingRequired')}</Label>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    i < formData.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => setFormData({...formData, rating: i + 1})}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('reviews.submitting')}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t('reviews.submitReview')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      );
    }

    const ReviewsPage = ({ logoUrl }) => {
      const { t } = useTranslation();
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [reviews, setReviews] = useState([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchReviews = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching testimonials:', error);
            toast({ title: t('reviews.errorLoadingReviews'), description: error.message, variant: 'destructive' });
            setReviews([]);
          } else {
            setReviews(data || []);
          }
          setLoading(false);
        };

        fetchReviews();
      }, [t]);

      return (
        <>
          <Helmet>
            <title>{t('reviews.title')} - GreenoFig</title>
            <meta name="description" content={t('reviews.metaDescription')} />
            <link rel="canonical" href="https://greenofig.com/reviews" />
            <meta property="og:title" content={`${t('reviews.title')} - GreenoFig`} />
            <meta property="og:description" content={t('reviews.metaDescription')} />
            <meta property="og:url" content="https://greenofig.com/reviews" />
            <meta property="og:type" content="website" />
            <meta name="robots" content="index, follow" />
          </Helmet>
          <SiteLayout
            logoUrl={logoUrl}
            pageTitle={<>{t('reviews.pageTitle')}</>}
            pageDescription={t('reviews.pageDescription')}
          >
            <div className="text-center mb-12">
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 hover:shadow-xl transition-all text-primary-foreground shadow-lg">
                    <MessageSquarePlus className="mr-2 h-5 w-5" />
                    {t('reviews.writeReview')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] glass-effect">
                  <DialogHeader>
                    <DialogTitle>{t('reviews.shareYourStory')}</DialogTitle>
                    <DialogDescription>
                      {t('reviews.experienceDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <ReviewForm setOpen={setIsFormOpen} />
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-semibold">{t('reviews.noReviewsYet')}</h2>
                <p className="text-text-secondary mt-2">{t('reviews.beTheFirst')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review, index) => (
                  <ReviewCard key={review.id || index} review={review} index={index} />
                ))}
              </div>
            )}
          </SiteLayout>
        </>
      );
    };

    export default ReviewsPage;
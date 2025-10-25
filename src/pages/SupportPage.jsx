import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Send,
  Loader2,
  MessageSquare,
  CheckCircle,
  Clock,
  ShieldQuestion,
  AlertTriangle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Mail
} from 'lucide-react';

const SupportPage = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');

  // Quick Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackText, setFeedbackText] = useState('');

  // Fetch categories
  const fetchCategories = async () => {
    const { data } = await supabase
      .from('issue_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (data) setCategories(data);
  };

  // Fetch user's issues
  const fetchMyIssues = async () => {
    if (!userProfile?.id) return;

    setLoadingIssues(true);
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
    } else {
      setMyIssues(data || []);
    }
    setLoadingIssues(false);
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchCategories();
      fetchMyIssues();
    }
  }, [userProfile?.id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim() || !category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('issues')
      .insert({
        user_id: userProfile.id,
        subject: subject.trim(),
        description: description.trim(),
        category: category,
        priority: priority,
        status: 'open'
      });

    if (error) {
      toast({
        title: 'Error Creating Ticket',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Support Ticket Created!',
        description: 'A conversation has been started with our support team. Check the Messages page for updates.'
      });

      // Reset form
      setSubject('');
      setDescription('');
      setCategory('');
      setPriority('medium');

      // Refresh issues list
      fetchMyIssues();
    }

    setLoading(false);
  };

  // Handle quick feedback submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your feedback',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const feedbackSubject = `${feedbackType === 'suggestion' ? '💡 Suggestion' : feedbackType === 'complaint' ? '⚠️ Complaint' : '⭐ Praise'} - ${feedbackRating} stars`;

    const { error } = await supabase
      .from('issues')
      .insert({
        user_id: userProfile.id,
        subject: feedbackSubject,
        description: feedbackText.trim(),
        category: 'feedback',
        priority: feedbackType === 'complaint' ? 'high' : 'low',
        status: 'open'
      });

    if (error) {
      toast({
        title: 'Error Submitting Feedback',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Feedback Submitted! 🎉',
        description: 'Thank you! A conversation has been created with our team. Check Messages for any follow-up.'
      });

      // Reset form
      setFeedbackRating(0);
      setFeedbackType('suggestion');
      setFeedbackText('');

      // Refresh issues list
      fetchMyIssues();
    }

    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30"><ShieldQuestion className="w-3 h-3 mr-1" />Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30"><AlertTriangle className="w-3 h-3 mr-1" />Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Support Center</h1>
        <p className="text-text-secondary">Need help? Submit a ticket and our team will assist you.</p>
      </motion.div>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feedback">Quick Feedback</TabsTrigger>
          <TabsTrigger value="create">Create Ticket</TabsTrigger>
          <TabsTrigger value="mytickets">My Tickets ({myIssues.length})</TabsTrigger>
        </TabsList>

        {/* Quick Feedback Tab */}
        <TabsContent value="feedback">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Quick Feedback
              </CardTitle>
              <CardDescription>
                Share your thoughts, suggestions, or report issues quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    How would you rate your experience?
                  </label>
                  <div className="flex gap-2 justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="transition-all transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= feedbackRating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {feedbackRating > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      {feedbackRating === 5 && '🎉 Excellent!'}
                      {feedbackRating === 4 && '😊 Great!'}
                      {feedbackRating === 3 && '👍 Good'}
                      {feedbackRating === 2 && '😐 Could be better'}
                      {feedbackRating === 1 && '😞 Needs improvement'}
                    </p>
                  )}
                </div>

                {/* Feedback Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    What type of feedback is this?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant={feedbackType === 'suggestion' ? 'default' : 'outline'}
                      onClick={() => setFeedbackType('suggestion')}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span>Suggestion</span>
                    </Button>
                    <Button
                      type="button"
                      variant={feedbackType === 'complaint' ? 'default' : 'outline'}
                      onClick={() => setFeedbackType('complaint')}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span>Issue</span>
                    </Button>
                    <Button
                      type="button"
                      variant={feedbackType === 'praise' ? 'default' : 'outline'}
                      onClick={() => setFeedbackType('praise')}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                    >
                      <Star className="w-5 h-5" />
                      <span>Praise</span>
                    </Button>
                  </div>
                </div>

                {/* Feedback Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tell us more <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    placeholder={
                      feedbackType === 'suggestion'
                        ? 'What feature or improvement would you like to see?'
                        : feedbackType === 'complaint'
                        ? 'What issue did you encounter? Please provide details...'
                        : 'What did you love about your experience?'
                    }
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                {/* Info Banner */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-300 mb-1">Direct conversation with our team</p>
                    <p className="text-blue-200/70">
                      Your feedback will create a conversation with our support team. You'll be able to chat with them in the Messages section.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !feedbackText.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Ticket Tab */}
        <TabsContent value="create">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Submit a Support Ticket
              </CardTitle>
              <CardDescription>
                Describe your issue and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name} - {cat.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General inquiry</SelectItem>
                      <SelectItem value="medium">Medium - Standard issue</SelectItem>
                      <SelectItem value="high">High - Affects my work</SelectItem>
                      <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    placeholder="Please provide as much detail as possible about your issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    required
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Include steps to reproduce the issue, error messages, or screenshots if applicable
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tickets Tab */}
        <TabsContent value="mytickets">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>
                View and track your submitted support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingIssues ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : myIssues.length === 0 ? (
                <div className="text-center py-10">
                  <HelpCircle className="w-16 h-16 mx-auto text-text-secondary opacity-50 mb-4" />
                  <p className="text-text-secondary">You haven't submitted any tickets yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myIssues.map(issue => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg glass-effect border border-white/10 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{issue.subject}</h3>
                          <p className="text-sm text-text-secondary line-clamp-2">
                            {issue.description}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {getStatusBadge(issue.status)}
                          {getPriorityBadge(issue.priority)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <div className="flex items-center gap-4">
                          <span>Ticket #{issue.id.slice(0, 8)}</span>
                          {issue.category && (
                            <span className="capitalize">
                              Category: {issue.category.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                          <span>Updated: {new Date(issue.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {issue.status === 'resolved' && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-sm text-green-400">
                            ✓ This issue has been resolved. If you need further assistance, please create a new ticket.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportPage;

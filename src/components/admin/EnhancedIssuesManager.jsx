import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  MoreHorizontal,
  ShieldQuestion,
  Search,
  Filter,
  TrendingUp,
  Users,
  MessageSquare,
  Paperclip,
  User,
  Send,
  StickyNote,
  X
} from 'lucide-react';

const EnhancedIssuesManager = ({ user }) => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  // Modal states
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [issueDetails, setIssueDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch statistics
  const fetchStatistics = async () => {
    const { data, error } = await supabase.rpc('get_issue_statistics', { time_period: 'all' });

    if (error) {
      console.error('Error fetching statistics:', error);
    } else if (data && data.length > 0) {
      setStatistics(data[0]);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    const { data } = await supabase
      .from('issue_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (data) setCategories(data);
  };

  // Fetch admin users for assignment
  const fetchAdminUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('role', ['admin', 'super_admin']);

    if (data) setAdminUsers(data);
  };

  // Fetch issues
  const fetchIssues = async () => {
    setLoading(true);

    // Fetch issues first
    const { data: issuesData, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching issues', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Get all unique user IDs (both issue creators and assigned users)
    const userIds = [...new Set([
      ...issuesData.map(i => i.user_id),
      ...issuesData.filter(i => i.assigned_to).map(i => i.assigned_to)
    ])].filter(Boolean);

    // Fetch user profiles for all those users
    let usersData = [];
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, profile_picture_url')
        .in('id', userIds);

      usersData = users || [];
    }

    // Merge the data
    const enrichedIssues = issuesData.map(issue => ({
      ...issue,
      user_profiles: usersData.find(u => u.id === issue.user_id),
      assigned_user: issue.assigned_to ? usersData.find(u => u.id === issue.assigned_to) : null
    }));

    setIssues(enrichedIssues);
    setFilteredIssues(enrichedIssues);
    setLoading(false);
  };

  // Fetch issue details including comments and activity
  const fetchIssueDetails = async (issueId) => {
    setLoadingDetails(true);

    // Fetch comments
    const { data: commentsData } = await supabase
      .from('issue_comments')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true });

    // Get unique user IDs from comments
    const commentUserIds = [...new Set(commentsData?.map(c => c.user_id) || [])].filter(Boolean);

    // Fetch user profiles
    let commentUsers = [];
    if (commentUserIds.length > 0) {
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, profile_picture_url')
        .in('id', commentUserIds);

      commentUsers = users || [];
    }

    // Merge comment data with user profiles
    const enrichedComments = (commentsData || []).map(comment => ({
      ...comment,
      user_profiles: commentUsers.find(u => u.id === comment.user_id)
    }));

    setComments(enrichedComments);
    setLoadingDetails(false);
  };

  useEffect(() => {
    fetchIssues();
    fetchStatistics();
    fetchCategories();
    fetchAdminUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = issues;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(issue =>
        issue.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.user_profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.user_profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    // Assigned filter
    if (assignedFilter !== 'all') {
      if (assignedFilter === 'unassigned') {
        filtered = filtered.filter(issue => !issue.assigned_to);
      } else if (assignedFilter === 'me') {
        filtered = filtered.filter(issue => issue.assigned_to === user?.id);
      } else {
        filtered = filtered.filter(issue => issue.assigned_to === assignedFilter);
      }
    }

    setFilteredIssues(filtered);
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, assignedFilter, issues, user]);

  // Handle status update
  const handleStatusUpdate = async (issueId, newStatus) => {
    const { error } = await supabase
      .from('issues')
      .update({ status: newStatus })
      .eq('id', issueId);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status Updated', description: `Issue status changed to ${newStatus}` });
      fetchIssues();
      if (selectedIssue?.id === issueId) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    }
  };

  // Handle priority update
  const handlePriorityUpdate = async (issueId, newPriority) => {
    const { error } = await supabase
      .from('issues')
      .update({ priority: newPriority })
      .eq('id', issueId);

    if (error) {
      toast({ title: 'Error updating priority', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Priority Updated', description: `Priority changed to ${newPriority}` });
      fetchIssues();
      if (selectedIssue?.id === issueId) {
        setSelectedIssue({ ...selectedIssue, priority: newPriority });
      }
    }
  };

  // Handle assignment
  const handleAssignment = async (issueId, assignedToUserId) => {
    const { error } = await supabase
      .from('issues')
      .update({ assigned_to: assignedToUserId })
      .eq('id', issueId);

    if (error) {
      toast({ title: 'Error assigning issue', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Issue Assigned', description: 'Issue has been assigned successfully' });
      fetchIssues();
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIssue) return;

    const { error } = await supabase
      .from('issue_comments')
      .insert({
        issue_id: selectedIssue.id,
        user_id: user.id,
        comment_text: newComment,
        is_internal: isInternalNote
      });

    if (error) {
      toast({ title: 'Error adding comment', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Comment Added', description: isInternalNote ? 'Internal note added' : 'Comment added' });
      setNewComment('');
      setIsInternalNote(false);
      fetchIssueDetails(selectedIssue.id);
    }
  };

  // Open issue detail modal
  const openIssueDetail = (issue) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
    fetchIssueDetails(issue.id);
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
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"><AlertTriangle className="w-3 h-3 mr-1" />Urgent</Badge>;
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

  const getCategoryBadge = (categorySlug) => {
    const category = categories.find(c => c.slug === categorySlug);
    if (!category) return null;

    return (
      <Badge
        style={{
          backgroundColor: `${category.color}20`,
          color: category.color,
          borderColor: `${category.color}50`
        }}
      >
        {category.name}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Customer Issues</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">Track and resolve customer support tickets</p>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-effect">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-text-secondary">Total Issues</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{statistics.total_issues || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-text-secondary">Open Issues</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400">{statistics.open_issues || 0}</p>
                </div>
                <ShieldQuestion className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-text-secondary">Avg Response Time</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">
                    {statistics.avg_first_response_minutes ? `${Math.round(statistics.avg_first_response_minutes)}m` : 'N/A'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-text-secondary">Urgent Issues</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-400">{statistics.urgent_issues || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Issues Card */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Customer Issues</CardTitle>
              <p className="text-xs sm:text-sm text-text-secondary">Track and resolve customer support tickets</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2 sm:gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-secondary" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                <SelectTrigger className="w-full text-xs sm:text-sm col-span-2 sm:col-span-1">
                  <SelectValue placeholder="Assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="me">Assigned to Me</SelectItem>
                  <DropdownMenuSeparator />
                  {adminUsers.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>{admin.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
              <span className="ml-3 sm:ml-4 text-sm sm:text-base">Loading Issues...</span>
            </div>
          ) : (
            <ResponsiveTable
              data={filteredIssues}
              columns={[
                {
                  header: 'Priority',
                  accessor: 'priority',
                  render: (issue) => getPriorityBadge(issue.priority)
                },
                {
                  header: 'Subject',
                  accessor: 'subject',
                  render: (issue) => <span className="font-medium text-sm">{issue.subject}</span>
                },
                {
                  header: 'Category',
                  accessor: 'category',
                  render: (issue) => getCategoryBadge(issue.category)
                },
                {
                  header: 'Customer',
                  accessor: 'user_profiles',
                  render: (issue) => (
                    <div>
                      <div className="font-medium text-sm">{issue.user_profiles?.full_name || 'N/A'}</div>
                      <div className="text-xs text-text-secondary">{issue.user_profiles?.email || 'N/A'}</div>
                    </div>
                  )
                },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: (issue) => getStatusBadge(issue.status)
                },
                {
                  header: 'Last Updated',
                  accessor: 'updated_at',
                  render: (issue) => <span className="text-sm text-text-secondary">{new Date(issue.updated_at).toLocaleDateString()}</span>
                }
              ]}
              actions={(issue) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openIssueDetail(issue)}
                  className="h-8 px-2 sm:px-3"
                >
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              )}
              emptyMessage={
                searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No issues match your filters'
                  : 'No customer issues found. Great job!'
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Issue Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedIssue && (
          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-effect">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedIssue.subject}</DialogTitle>
                    <DialogDescription className="mt-2">
                      Issue #{selectedIssue.id.slice(0, 8)} • Created {new Date(selectedIssue.created_at).toLocaleDateString()}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(selectedIssue.priority)}
                    {getStatusBadge(selectedIssue.status)}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Issue Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-text-secondary whitespace-pre-wrap">{selectedIssue.description}</p>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Customer</h3>
                    <div className="text-text-secondary">
                      <p>{selectedIssue.user_profiles?.full_name}</p>
                      <p className="text-sm">{selectedIssue.user_profiles?.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Assigned To</h3>
                    <Select
                      value={selectedIssue.assigned_to || 'unassigned'}
                      onValueChange={(value) => handleAssignment(selectedIssue.id, value === 'unassigned' ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {adminUsers.map(admin => (
                          <SelectItem key={admin.id} value={admin.id}>{admin.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversation ({comments.length})
                  </h3>

                  {loadingDetails ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {comments.map(comment => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-lg ${
                            comment.is_internal
                              ? 'bg-yellow-500/10 border border-yellow-500/30'
                              : 'bg-muted/20'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{comment.user_profiles?.full_name}</span>
                              {comment.is_internal && (
                                <Badge variant="outline" className="text-xs">
                                  <StickyNote className="w-3 h-3 mr-1" />
                                  Internal Note
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-text-secondary">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-text-secondary whitespace-pre-wrap">{comment.comment_text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="mt-4 space-y-3">
                    <Textarea
                      placeholder="Type your response or internal note..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-text-secondary">Internal note (not visible to customer)</span>
                      </label>
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        {isInternalNote ? 'Add Note' : 'Send Reply'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedIssuesManager;

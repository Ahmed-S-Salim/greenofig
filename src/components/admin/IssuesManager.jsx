import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertTriangle, CheckCircle, Clock, Loader2, MoreHorizontal, ShieldQuestion } from 'lucide-react';

const IssuesManager = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        user_profiles (full_name, email, profile_picture_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching issues', description: error.message, variant: 'destructive' });
    } else {
      setIssues(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleStatusUpdate = async (issueId, newStatus) => {
    const { error } = await supabase
      .from('issues')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', issueId);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status Updated!', description: `Issue status changed to ${newStatus}.` });
      fetchIssues(); // Refresh the list
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30"><ShieldQuestion className="w-3 h-3 mr-1" />Open</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'resolved':
        return <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Customer Issues</CardTitle>
        <p className="text-text-secondary">Track and resolve customer support tickets.</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-4 text-lg">Loading Issues...</span>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="overflow-x-auto"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4">Priority</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <motion.tr variants={itemVariants} key={issue.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">{getPriorityIcon(issue.priority)}</td>
                    <td className="p-4 font-medium">{issue.subject}</td>
                    <td className="p-4">
                      <div className="font-medium">{issue.user_profiles?.full_name || 'N/A'}</div>
                      <div className="text-sm text-text-secondary">{issue.user_profiles?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4">{getStatusBadge(issue.status)}</td>
                    <td className="p-4 text-text-secondary">{new Date(issue.updated_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-effect">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(issue.id, 'in_progress')}>Set to In Progress</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(issue.id, 'resolved')}>Set to Resolved</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(issue.id, 'closed')}>Set to Closed</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {issues.length === 0 && (
              <p className="text-text-secondary text-center py-8">No customer issues found. Great job! 🎉</p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssuesManager;
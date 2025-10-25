import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DollarSign, CheckCircle, XCircle, Clock, Settings, Search, Download, TrendingUp, RefreshCw } from 'lucide-react';
import PaymentSettings from './PaymentSettings';

const PaymentsManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, succeeded: 0, pending: 0, failed: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from('payment_transactions')
      .select(`
        *,
        user_profiles (full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error fetching payments', description: error.message, variant: 'destructive' });
    } else {
      setTransactions(data || []);
      calculateStats(data || []);
    }
    setLoading(false);
  };

  const calculateStats = (data) => {
    const total = data.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const succeeded = data.filter(tx => tx.status === 'succeeded').reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const pending = data.filter(tx => tx.status === 'pending').length;
    const failed = data.filter(tx => tx.status === 'failed').length;
    setStats({ total, succeeded, pending, failed });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Succeeded</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      tx.user_profiles?.full_name?.toLowerCase().includes(searchLower) ||
      tx.user_profiles?.email?.toLowerCase().includes(searchLower) ||
      tx.payment_intent_id?.toLowerCase().includes(searchLower)
    );
  });

  if (showSettings) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Payment Settings</h2>
          <Button onClick={() => setShowSettings(false)} variant="outline">
            Back to Payments
          </Button>
        </div>
        <PaymentSettings />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">${stats.total.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Succeeded</p>
                <p className="text-2xl font-bold mt-1">${stats.succeeded.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Failed</p>
                <p className="text-2xl font-bold mt-1">{stats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-3xl font-bold">Payment Transactions</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowSettings(true)} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button onClick={fetchTransactions} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                placeholder="Search by customer name, email, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
        {loading ? (
           <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg flex items-center gap-4 animate-pulse bg-white/5">
                      <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-1/3"></div>
                          <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-white/10 rounded w-1/6"></div>
                      <div className="h-6 bg-white/10 rounded w-1/6"></div>
                  </div>
              ))}
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
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <motion.tr variants={itemVariants} key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-medium">{tx.user_profiles?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-text-secondary">{tx.user_profiles?.email || 'No email'}</div>
                    </td>
                    <td className="p-4 font-semibold text-lg">${parseFloat(tx.amount).toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(tx.status)}</td>
                    <td className="p-4 text-text-secondary">{new Date(tx.created_at).toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && !loading && (
                <p className="text-text-secondary text-center py-8">
                  {searchQuery ? 'No transactions match your search' : 'No payment transactions found.'}
                </p>
            )}
          </motion.div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsManager;
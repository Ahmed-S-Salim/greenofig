import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Search,
  TrendingDown,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  Crown,
  Star,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import TierBadge from './TierBadge';
import ClientDetailsModal from './ClientDetailsModal';

const ClientManagement = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all'); // all, Base, Premium, Elite
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [selectedClient, setSelectedClient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    base: 0,
    premium: 0,
    elite: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    fetchClients();
  }, [user]);

  useEffect(() => {
    filterClients();
    calculateStats();
  }, [searchTerm, tierFilter, statusFilter, clients]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Fetch all user profiles (regular users are potential clients)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch latest progress for each client
      const clientsWithProgress = await Promise.all(
        (data || []).map(async (client) => {
          const { data: progressData } = await supabase
            .from('client_progress')
            .select('*')
            .eq('client_id', client.id)
            .order('date', { ascending: false })
            .limit(2);

          const latestProgress = progressData?.[0];
          const previousProgress = progressData?.[1];

          // Check if client is active (has activity in last 7 days)
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const isActive = latestProgress?.date && new Date(latestProgress.date) > weekAgo;

          return {
            ...client,
            tier: client.tier || 'Base',
            latestWeight: latestProgress?.weight_kg,
            weightChange: latestProgress && previousProgress
              ? (latestProgress.weight_kg - previousProgress.weight_kg).toFixed(1)
              : null,
            lastUpdate: latestProgress?.date,
            isActive,
          };
        })
      );

      setClients(clientsWithProgress);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      total: clients.length,
      base: clients.filter(c => c.tier === 'Base').length,
      premium: clients.filter(c => c.tier === 'Premium').length,
      elite: clients.filter(c => c.tier === 'Elite').length,
      active: clients.filter(c => c.isActive).length,
      inactive: clients.filter(c => !c.isActive).length,
    };
    setStats(stats);
  };

  const filterClients = () => {
    let filtered = clients;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(client => client.tier === tierFilter);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(client => client.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(client => !client.isActive);
    }

    setFilteredClients(filtered);
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 'N/A';
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
  };

  const ClientCard = ({ client }) => {
    const bmi = calculateBMI(client.latestWeight, client.height_cm);
    const isWeightLoss = client.weightChange && parseFloat(client.weightChange) < 0;

    return (
      <Card
        className="glass-effect hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
        onClick={() => handleClientClick(client)}
      >
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">
                  {client.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">{client.full_name || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground truncate">{client.email}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              <TierBadge tier={client.tier} size="sm" />
              <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                client.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {client.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
              <p className="text-lg font-bold">{client.latestWeight ? `${client.latestWeight} kg` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">BMI</p>
              <p className="text-lg font-bold">{bmi}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Progress</p>
              {client.weightChange ? (
                <p className={`text-lg font-bold flex items-center gap-1 ${
                  isWeightLoss ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isWeightLoss ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {Math.abs(client.weightChange)} kg
                </p>
              ) : (
                <p className="text-lg font-bold text-muted-foreground">-</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm mt-auto">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {client.lastUpdate ? format(new Date(client.lastUpdate), 'MMM d, yyyy') : 'No updates'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleClientClick(client); }}>
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <Card className="glass-effect">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Client Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage and track your clients by subscription tier</p>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats.total}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={Sparkles}
          label="Base Tier"
          value={stats.base}
          color="text-gray-600 dark:text-gray-400"
          bgColor="bg-gray-500/10"
        />
        <StatCard
          icon={Star}
          label="Premium Tier"
          value={stats.premium}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={Crown}
          label="Elite Tier"
          value={stats.elite}
          color="text-yellow-600 dark:text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Clients</p>
                <p className="text-3xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground mt-1">Activity in last 7 days</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Estimate</p>
                <p className="text-3xl font-bold">
                  ${(stats.premium * 29 + stats.elite * 59).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Monthly recurring revenue</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Premium: ${stats.premium * 29}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Elite: ${stats.elite * 59}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Tier Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={tierFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTierFilter('all')}
                  className="whitespace-nowrap"
                >
                  All Tiers
                </Button>
                <Button
                  variant={tierFilter === 'Base' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTierFilter('Base')}
                  className={`whitespace-nowrap ${tierFilter === 'Base' ? '' : 'border-gray-500/20'}`}
                >
                  <Sparkles className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="hidden sm:inline">Base</span> ({stats.base})
                </Button>
                <Button
                  variant={tierFilter === 'Premium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTierFilter('Premium')}
                  className={`whitespace-nowrap ${tierFilter === 'Premium' ? '' : 'border-blue-500/20'}`}
                >
                  <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="hidden sm:inline">Premium</span> ({stats.premium})
                </Button>
                <Button
                  variant={tierFilter === 'Elite' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTierFilter('Elite')}
                  className={`whitespace-nowrap ${tierFilter === 'Elite' ? '' : 'border-yellow-500/20'}`}
                >
                  <Crown className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="hidden sm:inline">Elite</span> ({stats.elite})
                </Button>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="whitespace-nowrap"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                  className="whitespace-nowrap"
                >
                  Active ({stats.active})
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                  className="whitespace-nowrap"
                >
                  Inactive ({stats.inactive})
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <Card className="glass-effect">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No clients found</h3>
            <p className="text-muted-foreground">
              {searchTerm || tierFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search'
                : 'Your clients will appear here'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Details Dialog */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUpdate={fetchClients}
        />
      )}
    </div>
  );
};

export default ClientManagement;

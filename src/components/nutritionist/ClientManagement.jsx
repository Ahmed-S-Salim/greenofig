import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  Plus,
  TrendingDown,
  TrendingUp,
  Activity,
  Calendar,
  Mail,
  Phone,
  Edit,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import ClientProfileDialog from './ClientProfileDialog';

const ClientManagement = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [selectedClient, setSelectedClient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [user]);

  useEffect(() => {
    filterClients();
  }, [searchTerm, filter, clients]);

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

          return {
            ...client,
            latestWeight: latestProgress?.weight_kg,
            weightChange: latestProgress && previousProgress
              ? (latestProgress.weight_kg - previousProgress.weight_kg).toFixed(1)
              : null,
            lastUpdate: latestProgress?.date,
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

  const filterClients = () => {
    let filtered = clients;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter
    if (filter === 'active') {
      filtered = filtered.filter(client => client.lastUpdate); // Has recent activity
    } else if (filter === 'inactive') {
      filtered = filtered.filter(client => !client.lastUpdate);
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
          <div className="flex items-start justify-between mb-4">
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
            <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ml-2 ${
              client.lastUpdate ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {client.lastUpdate ? 'Active' : 'Inactive'}
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

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {client.lastUpdate ? format(new Date(client.lastUpdate), 'MMM d, yyyy') : 'No updates'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleClientClick(client); }}>
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

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
          <p className="text-muted-foreground mt-1">Manage and track your clients' progress</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({clients.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilter('inactive')}
              >
                Inactive
              </Button>
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
              {searchTerm ? 'Try adjusting your search' : 'Your clients will appear here'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Profile Dialog */}
      {selectedClient && (
        <ClientProfileDialog
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

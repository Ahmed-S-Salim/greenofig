import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import {
  Tag,
  Star,
  AlertTriangle,
  TrendingUp,
  Eye,
  Clock,
  Users,
  Filter,
  Plus,
  X,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TAG_CATEGORIES = [
  {
    id: 'high-priority',
    name: 'High Priority',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-700 border-red-300',
    dotColor: 'bg-red-500',
    description: 'Clients requiring immediate attention'
  },
  {
    id: 'at-risk',
    name: 'At Risk',
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    dotColor: 'bg-orange-500',
    description: 'Clients showing signs of potential churn'
  },
  {
    id: 'star-client',
    name: 'Star Client',
    icon: Star,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    dotColor: 'bg-yellow-500',
    description: 'High-performing clients with excellent results'
  },
  {
    id: 'needs-attention',
    name: 'Needs Attention',
    icon: Eye,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    dotColor: 'bg-blue-500',
    description: 'Clients who need follow-up or check-in'
  },
  {
    id: 'inactive',
    name: 'Inactive',
    icon: Clock,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    dotColor: 'bg-gray-500',
    description: 'Clients with low activity in the past 2 weeks'
  },
  {
    id: 'making-progress',
    name: 'Making Progress',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-700 border-green-300',
    dotColor: 'bg-green-500',
    description: 'Clients showing consistent progress toward goals'
  }
];

const ClientTags = ({ nutritionistId, compact = false }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [tagStats, setTagStats] = useState({});

  useEffect(() => {
    if (nutritionistId) {
      fetchClients();
      fetchTagStats();
    }
  }, [nutritionistId]);

  const fetchClients = async () => {
    try {
      setLoading(true);

      // Fetch all clients assigned to this nutritionist
      const { data: clientsData, error: clientsError } = await supabase
        .from('nutritionist_clients')
        .select(`
          client_id,
          user_profiles (
            id,
            full_name,
            email,
            avatar_url,
            tier
          ),
          client_tags (
            tag_category,
            created_at
          )
        `)
        .eq('nutritionist_id', nutritionistId);

      if (clientsError) throw clientsError;

      // Transform data
      const transformedClients = clientsData.map(item => ({
        id: item.user_profiles.id,
        name: item.user_profiles.full_name,
        email: item.user_profiles.email,
        avatar: item.user_profiles.avatar_url,
        tier: item.user_profiles.tier,
        tags: item.client_tags || []
      }));

      setClients(transformedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTagStats = async () => {
    try {
      const { data, error } = await supabase
        .from('client_tags')
        .select('tag_category')
        .eq('nutritionist_id', nutritionistId);

      if (error) throw error;

      // Count tags
      const stats = {};
      TAG_CATEGORIES.forEach(category => {
        stats[category.id] = data.filter(t => t.tag_category === category.id).length;
      });

      setTagStats(stats);
    } catch (error) {
      console.error('Error fetching tag stats:', error);
    }
  };

  const addTagToClient = async (clientId, tagCategory) => {
    try {
      // Check if tag already exists
      const { data: existing } = await supabase
        .from('client_tags')
        .select('*')
        .eq('nutritionist_id', nutritionistId)
        .eq('client_id', clientId)
        .eq('tag_category', tagCategory)
        .single();

      if (existing) {
        // Tag already exists, skip
        return;
      }

      const { error } = await supabase
        .from('client_tags')
        .insert({
          nutritionist_id: nutritionistId,
          client_id: clientId,
          tag_category: tagCategory
        });

      if (error) throw error;

      // Refresh clients
      await fetchClients();
      await fetchTagStats();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const removeTagFromClient = async (clientId, tagCategory) => {
    try {
      const { error } = await supabase
        .from('client_tags')
        .delete()
        .eq('nutritionist_id', nutritionistId)
        .eq('client_id', clientId)
        .eq('tag_category', tagCategory);

      if (error) throw error;

      // Refresh clients
      await fetchClients();
      await fetchTagStats();
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const bulkAddTag = async (tagCategory) => {
    try {
      const insertData = selectedClients.map(clientId => ({
        nutritionist_id: nutritionistId,
        client_id: clientId,
        tag_category: tagCategory
      }));

      const { error } = await supabase
        .from('client_tags')
        .upsert(insertData, { onConflict: 'nutritionist_id,client_id,tag_category' });

      if (error) throw error;

      // Clear selection and refresh
      setSelectedClients([]);
      setShowBulkActions(false);
      await fetchClients();
      await fetchTagStats();
    } catch (error) {
      console.error('Error bulk adding tags:', error);
    }
  };

  const bulkRemoveTag = async (tagCategory) => {
    try {
      const { error } = await supabase
        .from('client_tags')
        .delete()
        .eq('nutritionist_id', nutritionistId)
        .in('client_id', selectedClients)
        .eq('tag_category', tagCategory);

      if (error) throw error;

      // Clear selection and refresh
      setSelectedClients([]);
      setShowBulkActions(false);
      await fetchClients();
      await fetchTagStats();
    } catch (error) {
      console.error('Error bulk removing tags:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    // Search filter
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter
    const matchesTags = selectedTags.length === 0 ||
                        selectedTags.every(tagId =>
                          client.tags.some(t => t.tag_category === tagId)
                        );

    return matchesSearch && matchesTags;
  });

  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleTagFilter = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Client Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TAG_CATEGORIES.map(category => (
              <Badge
                key={category.id}
                variant="outline"
                className={`${category.color} cursor-pointer`}
                onClick={() => toggleTagFilter(category.id)}
              >
                <category.icon className="w-3 h-3 mr-1" />
                {category.name}
                <span className="ml-1 px-1.5 py-0.5 bg-white/50 rounded-full text-xs">
                  {tagStats[category.id] || 0}
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tag Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Client Tag Management
          </CardTitle>
          <CardDescription>
            Organize and filter your clients using custom tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TAG_CATEGORIES.map(category => {
              const Icon = category.icon;
              const count = tagStats[category.id] || 0;
              const isActive = selectedTags.includes(category.id);

              return (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      isActive ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => toggleTagFilter(category.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-600'}`} />
                        <span className={`w-2 h-2 rounded-full ${category.dotColor}`} />
                      </div>
                      <div className="text-2xl font-bold mb-1">{count}</div>
                      <div className="text-xs text-gray-600">{category.name}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">Active Filters:</span>
                {selectedTags.map(tagId => {
                  const category = TAG_CATEGORIES.find(c => c.id === tagId);
                  return (
                    <Badge
                      key={tagId}
                      className={`${category.color} cursor-pointer`}
                      onClick={() => toggleTagFilter(tagId)}
                    >
                      {category.name}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  );
                })}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-700"
                  onClick={() => setSelectedTags([])}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Bulk Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedClients.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedClients.length} selected
                </Badge>
                <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Tag Actions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Add Tag to Selected Clients</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {TAG_CATEGORIES.map(category => (
                            <Button
                              key={category.id}
                              variant="outline"
                              size="sm"
                              className={category.color}
                              onClick={() => bulkAddTag(category.id)}
                            >
                              <category.icon className="w-4 h-4 mr-1" />
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Remove Tag from Selected Clients</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {TAG_CATEGORIES.map(category => (
                            <Button
                              key={category.id}
                              variant="outline"
                              size="sm"
                              onClick={() => bulkRemoveTag(category.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClients([])}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Clients ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No clients found matching your filters
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredClients.map(client => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox for selection */}
                      <Checkbox
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => toggleClientSelection(client.id)}
                      />

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {client.name?.charAt(0) || 'C'}
                      </div>

                      {/* Client Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{client.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {client.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">{client.email}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {client.tags.map(tag => {
                            const category = TAG_CATEGORIES.find(c => c.id === tag.tag_category);
                            if (!category) return null;

                            return (
                              <Badge
                                key={tag.tag_category}
                                variant="outline"
                                className={`${category.color} text-xs`}
                              >
                                <category.icon className="w-3 h-3 mr-1" />
                                {category.name}
                                <button
                                  onClick={() => removeTagFromClient(client.id, tag.tag_category)}
                                  className="ml-1 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            );
                          })}

                          {/* Add Tag Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Tag
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Tag to {client.name}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-3">
                                {TAG_CATEGORIES.map(category => {
                                  const hasTag = client.tags.some(t => t.tag_category === category.id);

                                  return (
                                    <Button
                                      key={category.id}
                                      variant={hasTag ? "secondary" : "outline"}
                                      className={`${category.color} justify-start`}
                                      onClick={() => {
                                        if (!hasTag) {
                                          addTagToClient(client.id, category.id);
                                        }
                                      }}
                                      disabled={hasTag}
                                    >
                                      <category.icon className="w-4 h-4 mr-2" />
                                      <div className="text-left">
                                        <div className="font-medium">{category.name}</div>
                                        <div className="text-xs opacity-75">{category.description}</div>
                                      </div>
                                      {hasTag && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                    </Button>
                                  );
                                })}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTags;

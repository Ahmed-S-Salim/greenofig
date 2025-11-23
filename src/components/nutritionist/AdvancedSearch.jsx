import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  Search,
  Filter,
  X,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Tag,
  Award,
  AlertTriangle,
  Star,
  Clock,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SEARCH_FILTERS = {
  tier: {
    label: 'Subscription Tier',
    icon: Award,
    options: [
      { value: 'base', label: 'Base (Free)' },
      { value: 'premium', label: 'Premium' },
      { value: 'pro', label: 'Pro' },
      { value: 'elite', label: 'Elite' }
    ]
  },
  goal_type: {
    label: 'Primary Goal',
    icon: Target,
    options: [
      { value: 'weight_loss', label: 'Weight Loss' },
      { value: 'muscle_gain', label: 'Muscle Gain' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'performance', label: 'Performance' }
    ]
  },
  progress_status: {
    label: 'Progress Status',
    icon: TrendingUp,
    options: [
      { value: 'ahead', label: 'Ahead of Target (>100%)' },
      { value: 'on-track', label: 'On Track (75-100%)' },
      { value: 'behind', label: 'Behind (50-75%)' },
      { value: 'struggling', label: 'Struggling (<50%)' }
    ]
  },
  activity_level: {
    label: 'Activity Level',
    icon: Activity,
    options: [
      { value: 'very-active', label: 'Very Active (Daily logging)' },
      { value: 'active', label: 'Active (5-6 days/week)' },
      { value: 'moderate', label: 'Moderate (3-4 days/week)' },
      { value: 'low', label: 'Low (1-2 days/week)' },
      { value: 'inactive', label: 'Inactive (<1 day/week)' }
    ]
  },
  tags: {
    label: 'Client Tags',
    icon: Tag,
    options: [
      { value: 'high-priority', label: 'High Priority' },
      { value: 'at-risk', label: 'At Risk' },
      { value: 'star-client', label: 'Star Client' },
      { value: 'needs-attention', label: 'Needs Attention' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'making-progress', label: 'Making Progress' }
    ]
  },
  join_date: {
    label: 'Join Date',
    icon: Calendar,
    options: [
      { value: 'last-7-days', label: 'Last 7 days' },
      { value: 'last-30-days', label: 'Last 30 days' },
      { value: 'last-90-days', label: 'Last 90 days' },
      { value: 'older', label: 'Older than 90 days' }
    ]
  }
};

const SAVED_SEARCHES = [
  {
    id: 'at-risk-clients',
    name: 'At-Risk Clients',
    description: 'Clients who are struggling or inactive',
    filters: {
      tags: ['at-risk', 'inactive'],
      activity_level: ['low', 'inactive']
    },
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'star-performers',
    name: 'Star Performers',
    description: 'Highly engaged clients making great progress',
    filters: {
      tags: ['star-client', 'making-progress'],
      progress_status: ['ahead', 'on-track'],
      activity_level: ['very-active', 'active']
    },
    icon: Star,
    color: 'bg-yellow-100 text-yellow-700'
  },
  {
    id: 'new-clients',
    name: 'New Clients',
    description: 'Clients who joined in the last 30 days',
    filters: {
      join_date: ['last-30-days']
    },
    icon: Users,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'premium-clients',
    name: 'Premium+ Clients',
    description: 'Premium, Pro, and Elite tier clients',
    filters: {
      tier: ['premium', 'pro', 'elite']
    },
    icon: Award,
    color: 'bg-purple-100 text-purple-700'
  }
];

const AdvancedSearch = ({ nutritionistId, onResultsChange, compact = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [resultStats, setResultStats] = useState({
    total: 0,
    byTier: {},
    byGoal: {},
    avgProgress: 0
  });

  useEffect(() => {
    if (nutritionistId) {
      performSearch();
    }
  }, [nutritionistId, searchQuery, activeFilters]);

  const performSearch = async () => {
    setLoading(true);

    try {
      // Build query based on filters
      let query = supabase
        .from('nutritionist_clients')
        .select(`
          client_id,
          created_at,
          user_profiles (
            id,
            full_name,
            email,
            avatar_url,
            tier,
            created_at
          ),
          client_goals (
            goal_type,
            target_value,
            current_value,
            status
          ),
          client_tags (
            tag_category
          )
        `)
        .eq('nutritionist_id', nutritionistId);

      const { data, error } = await query;

      if (error) throw error;

      // Process and filter results
      let results = data.map(item => {
        const activeGoal = item.client_goals?.find(g => g.status === 'active');
        const progress = activeGoal
          ? ((activeGoal.current_value / activeGoal.target_value) * 100)
          : 0;

        return {
          id: item.user_profiles.id,
          name: item.user_profiles.full_name,
          email: item.user_profiles.email,
          avatar: item.user_profiles.avatar_url,
          tier: item.user_profiles.tier,
          joinDate: new Date(item.user_profiles.created_at),
          relationshipDate: new Date(item.created_at),
          goalType: activeGoal?.goal_type,
          progress: progress,
          tags: item.client_tags?.map(t => t.tag_category) || []
        };
      });

      // Apply text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(client =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query)
        );
      }

      // Apply filters
      if (activeFilters.tier) {
        results = results.filter(c => activeFilters.tier.includes(c.tier));
      }

      if (activeFilters.goal_type) {
        results = results.filter(c => activeFilters.goal_type.includes(c.goalType));
      }

      if (activeFilters.progress_status) {
        results = results.filter(c => {
          if (activeFilters.progress_status.includes('ahead') && c.progress > 100) return true;
          if (activeFilters.progress_status.includes('on-track') && c.progress >= 75 && c.progress <= 100) return true;
          if (activeFilters.progress_status.includes('behind') && c.progress >= 50 && c.progress < 75) return true;
          if (activeFilters.progress_status.includes('struggling') && c.progress < 50) return true;
          return false;
        });
      }

      if (activeFilters.tags) {
        results = results.filter(c =>
          activeFilters.tags.some(tag => c.tags.includes(tag))
        );
      }

      if (activeFilters.join_date) {
        const now = new Date();
        results = results.filter(c => {
          const daysSinceJoin = Math.floor((now - c.relationshipDate) / (1000 * 60 * 60 * 24));

          if (activeFilters.join_date.includes('last-7-days') && daysSinceJoin <= 7) return true;
          if (activeFilters.join_date.includes('last-30-days') && daysSinceJoin <= 30) return true;
          if (activeFilters.join_date.includes('last-90-days') && daysSinceJoin <= 90) return true;
          if (activeFilters.join_date.includes('older') && daysSinceJoin > 90) return true;
          return false;
        });
      }

      // Calculate stats
      const stats = {
        total: results.length,
        byTier: {},
        byGoal: {},
        avgProgress: results.reduce((sum, c) => sum + c.progress, 0) / results.length || 0
      };

      results.forEach(client => {
        stats.byTier[client.tier] = (stats.byTier[client.tier] || 0) + 1;
        if (client.goalType) {
          stats.byGoal[client.goalType] = (stats.byGoal[client.goalType] || 0) + 1;
        }
      });

      setSearchResults(results);
      setResultStats(stats);

      if (onResultsChange) {
        onResultsChange(results);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFilter = (category, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), value]
    }));
  };

  const removeFilter = (category, value) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      updated[category] = updated[category]?.filter(v => v !== value);
      if (updated[category]?.length === 0) {
        delete updated[category];
      }
      return updated;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  const applySavedSearch = (savedSearch) => {
    setActiveFilters(savedSearch.filters);
    setSearchQuery('');
  };

  const activeFilterCount = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Quick Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-4 space-y-2">
            {SAVED_SEARCHES.slice(0, 2).map(search => (
              <Button
                key={search.id}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => applySavedSearch(search)}
              >
                <search.icon className="w-4 h-4 mr-2" />
                {search.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6" />
            Advanced Client Search
          </CardTitle>
          <CardDescription>
            Search and filter your clients using multiple criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SAVED_SEARCHES.map((search, index) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => applySavedSearch(search)}
                >
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-full ${search.color} mb-3 flex items-center justify-center`}>
                      <search.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">{search.name}</h4>
                    <p className="text-xs text-gray-600">{search.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(SEARCH_FILTERS).map(([category, config]) => (
                    <div key={category}>
                      <label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </label>
                      <div className="space-y-2">
                        {config.options.map(option => (
                          <div key={option.value} className="flex items-center gap-2">
                            <Checkbox
                              checked={activeFilters[category]?.includes(option.value) || false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  addFilter(category, option.value);
                                } else {
                                  removeFilter(category, option.value);
                                }
                              }}
                            />
                            <label className="text-sm cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">Active Filters</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-green-700"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([category, values]) =>
                values.map(value => {
                  const config = SEARCH_FILTERS[category];
                  const option = config.options.find(o => o.value === value);

                  return (
                    <Badge
                      key={`${category}-${value}`}
                      variant="secondary"
                      className="bg-white cursor-pointer"
                      onClick={() => removeFilter(category, value)}
                    >
                      {config.label}: {option?.label}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Search Results ({resultStats.total})
            </CardTitle>
            {resultStats.total > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">
                    Avg Progress: {resultStats.avgProgress.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No clients found matching your search criteria
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {client.name?.charAt(0) || 'C'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{client.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {client.tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">{client.email}</p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {client.goalType && (
                          <Badge variant="secondary" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            {client.goalType.replace('_', ' ')}
                          </Badge>
                        )}
                        {client.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>

                      {client.progress > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                client.progress > 100
                                  ? 'bg-green-600'
                                  : client.progress >= 75
                                  ? 'bg-green-500'
                                  : client.progress >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(client.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12 text-right">
                            {client.progress.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSearch;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Save, Trash2, Database, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const DatabaseStudio = ({ user }) => {
  const [selectedTable, setSelectedTable] = useState('');
  const [queryResults, setQueryResults] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [customQuery, setCustomQuery] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [tables, setTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllTables = useCallback(async () => {
    setIsLoadingTables(true);

    try {
      // Use Supabase RPC to get all table names from information_schema
      const { data, error } = await supabase.rpc('get_all_tables');

      if (error || !data) {
        console.error('Error fetching tables:', error);
        // If RPC doesn't work, try a direct query approach
        // List potential tables and test which ones exist
        const potentialTables = [
          'user_profiles',
          'subscriptions',
          'pricing_plans',
          'features',
          'site_content',
          'blog_posts',
          'ai_chat_messages',
          'health_readings',
          'health_devices',
          'payment_transactions',
          'workouts',
          'exercises',
          'meals',
          'nutrition_plans'
        ];

        const validTables = [];

        // Test each table by trying to select from it
        for (const tableName of potentialTables) {
          try {
            const { error: testError } = await supabase
              .from(tableName)
              .select('*')
              .limit(0);

            if (!testError) {
              validTables.push(tableName);
            }
          } catch (e) {
            // Table doesn't exist, skip
          }
        }

        setTables(validTables);
        if (validTables.length > 0) {
          setSelectedTable(validTables[0]);
        }
      } else {
        // Successfully got tables from RPC
        const tableNames = data.map(t => t.tablename || t.table_name).filter(Boolean);
        setTables(tableNames);
        if (tableNames.length > 0) {
          setSelectedTable(tableNames[0]);
        }
      }
    } catch (err) {
      console.error('Error in fetchAllTables:', err);
      // Fallback to known working tables
      const fallbackTables = ['user_profiles', 'subscriptions'];
      setTables(fallbackTables);
      setSelectedTable(fallbackTables[0]);
    }

    setIsLoadingTables(false);
  }, []);

  const loadTableData = useCallback(async () => {
    if (!selectedTable) return;

    let query = supabase.from(selectedTable).select('*');

    const { data, error } = await query;

    if (error) {
        toast({ title: 'Error fetching data', description: error.message, variant: 'destructive' });
        setQueryResults([]);
    } else {
        setQueryResults(data);
    }
  }, [selectedTable]);

  useEffect(() => {
    fetchAllTables();
    const saved = localStorage.getItem('savedQueries');
    if (saved) {
      setSavedQueries(JSON.parse(saved));
    }
  }, [fetchAllTables]);

  useEffect(() => {
    if (selectedTable) {
      loadTableData();
    }
  }, [selectedTable, loadTableData]);

  const handleRunQuery = async () => {
    if (user?.role !== 'super_admin' && customQuery.trim()) {
      const dangerousKeywords = ['DROP', 'DELETE', 'ALTER', 'TRUNCATE', 'UPDATE'];
      const upperQuery = customQuery.toUpperCase();
      
      if (dangerousKeywords.some(keyword => upperQuery.includes(keyword))) {
        toast({
          title: "Permission Denied",
          description: "Your role cannot run destructive/update queries.",
          variant: "destructive",
        });
        return;
      }
    }

    if (customQuery.trim()) {
        try {
            // NOTE: Running raw SQL from the client-side is DANGEROUS.
            // This should be behind a trusted server/edge function in a real app.
            // Supabase RPC can be used, but must be configured securely.
            // For this project's scope, we proceed with caution.
            const { data, error } = await supabase.rpc('execute_sql', { sql: customQuery });
            if(error) {
                toast({title: 'Query Error', description: error.message, variant: 'destructive'});
            } else {
                setQueryResults(data);
                toast({ title: 'Custom query ran!', description: `Found ${data.length} results.` });
            }
        } catch(e) {
            toast({title: 'RPC Error', description: 'Ensure execute_sql function exists and is accessible.', variant: 'destructive'})
        }

    } else {
        await loadTableData();
        toast({ title: 'Query ran!', description: `Found ${queryResults.length} results.` });
    }
    
    const activity = {
      id: Date.now().toString(),
      userId: user.id,
      action: customQuery || `SELECT * FROM ${selectedTable}`,
      timestamp: new Date().toISOString(),
    };
    
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    logs.push(activity);
    localStorage.setItem('activityLogs', JSON.stringify(logs));
  };

  const handleSaveQuery = () => {
    const queryName = prompt('Enter a name for this query:');
    if (!queryName) return;

    const newQuery = {
      id: Date.now().toString(),
      name: queryName,
      table: selectedTable,
      filters: { ...filters },
      query: customQuery,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedQueries, newQuery];
    setSavedQueries(updated);
    localStorage.setItem('savedQueries', JSON.stringify(updated));
    
    toast({
      title: "Query saved! 💾",
      description: `"${queryName}" has been saved`,
    });
  };

  const handleLoadSavedQuery = (query) => {
    setSelectedTable(query.table);
    setFilters(query.filters);
    setCustomQuery(query.query || '');
    toast({
      title: "Query loaded! 📂",
      description: `Loaded "${query.name}"`,
    });
  };

  const handleDeleteSavedQuery = (queryId) => {
    const updated = savedQueries.filter(q => q.id !== queryId);
    setSavedQueries(updated);
    localStorage.setItem('savedQueries', JSON.stringify(updated));
    toast({
      title: "Query deleted",
      description: "Saved query has been removed",
    });
  };

  const handleExport = () => {
    const csv = convertToCSV(queryResults);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export_${Date.now()}.csv`;
    a.click();
    
    toast({
      title: "Export successful! 📥",
      description: "Data has been downloaded as CSV",
    });
  };

  const convertToCSV = (data) => {
    if (!data || !data.length) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-effect rounded-xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Save className="w-5 h-5 text-purple-400" />
          Saved Queries
        </h3>
        <div className="space-y-2">
          {savedQueries.length === 0 ? (
            <p className="text-sm text-purple-300">No saved queries yet</p>
          ) : (
            savedQueries.map((query) => (
              <div
                key={query.id}
                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => handleLoadSavedQuery(query)}
                    className="text-sm font-semibold text-white hover:text-purple-300 text-left flex-1"
                  >
                    {query.name}
                  </button>
                  <button
                    onClick={() => handleDeleteSavedQuery(query.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-purple-400">Table: {query.table}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <div className="lg:col-span-3 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Query Builder
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Select Table
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoadingTables}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between hover:bg-muted/80 transition-colors"
                >
                  <span className="truncate">
                    {isLoadingTables ? 'Loading tables...' : selectedTable || 'Select a table'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && tables.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto"
                    >
                      {tables.map((table) => (
                        <button
                          key={table}
                          onClick={() => {
                            setSelectedTable(table);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center justify-between group ${
                            selectedTable === table ? 'bg-primary/20 text-primary' : 'text-foreground'
                          }`}
                        >
                          <span className="truncate">{table}</span>
                          {selectedTable === table && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-medium text-purple-200 mb-1 sm:mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full h-10 px-3 py-2 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-medium text-purple-200 mb-1 sm:mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full h-10 px-3 py-2 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-medium text-purple-200 mb-1 sm:mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search..."
                  className="w-full h-10 px-3 py-2 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {user?.role === 'super_admin' && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Custom SQL Query (Super Admin Only)
                </label>
                <textarea
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="SELECT * FROM user_profiles WHERE..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows={4}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button
                onClick={handleRunQuery}
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Query
              </Button>
              <Button
                onClick={handleSaveQuery}
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Query
              </Button>
              <Button
                onClick={handleExport}
                disabled={!queryResults || queryResults.length === 0}
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-bold mb-4">Query Results ({queryResults?.length || 0})</h3>
          <div className="overflow-x-auto max-h-96">
            {!queryResults || queryResults.length === 0 ? (
              <p className="text-purple-300 text-center py-8">No results to display. Run a query to see data.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {Object.keys(queryResults[0]).map((key) => (
                      <th key={key} className="text-left p-3 text-purple-300 font-semibold sticky top-0 bg-indigo-900/50 backdrop-blur-sm">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {queryResults.map((row, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      {Object.keys(queryResults[0]).map((key) => (
                        <td key={key} className="p-3 text-white truncate max-w-xs">
                          {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DatabaseStudio;
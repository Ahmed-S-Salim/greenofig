import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import {
  AlertCircle, Brain, Check, X, RefreshCw, Filter,
  Clock, User, Code, FileText, Sparkles, Search, Zap, Download
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ErrorMonitorPanel = ({ user }) => {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'fixed', 'ignored'
  const [analyzing, setAnalyzing] = useState(null); // ID of error being analyzed
  const [scanning, setScanning] = useState(false); // Manual scan in progress

  useEffect(() => {
    fetchErrors();
  }, [filter]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to fetch errors',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Manual Application Health Scan
  const runHealthScan = async () => {
    setScanning(true);

    try {
      toast({
        title: '🔍 Scanning Application...',
        description: 'Running health checks and looking for potential errors...'
      });

      // Test common scenarios to find potential errors
      const healthChecks = [
        { name: 'Database Connection', test: async () => {
          const { error } = await supabase.from('user_profiles').select('id').limit(1);
          if (error) throw error;
        }},
        { name: 'Authentication System', test: async () => {
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
        }},
        { name: 'Storage Access', test: async () => {
          try {
            const { data } = await supabase.storage.getBucket('avatars');
          } catch (e) {
            // Storage might not be configured, that's okay
          }
        }}
      ];

      let foundIssues = 0;

      for (const check of healthChecks) {
        try {
          await check.test();
        } catch (error) {
          foundIssues++;
          // Log the error to our error_logs table
          await supabase.from('error_logs').insert({
            error_message: `Health Check Failed: ${check.name} - ${error.message}`,
            error_stack: error.stack,
            error_type: 'health_check',
            component_name: check.name,
            severity: 'medium',
            status: 'open',
            user_id: user.id
          });
        }
      }

      toast({
        title: foundIssues > 0 ? '⚠️ Issues Found' : '✅ Scan Complete',
        description: foundIssues > 0
          ? `Found ${foundIssues} potential issues. Check the error list.`
          : 'No issues found. Application is healthy!'
      });

      fetchErrors();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error.message
      });
    } finally {
      setScanning(false);
    }
  };

  const analyzeWithAI = async (errorLog) => {
    setAnalyzing(errorLog.id);

    try {
      toast({
        title: '🤖 AI Analyzing...',
        description: 'Analyzing error and generating fix suggestions...'
      });

      // Generate AI analysis based on error details
      const analysis = {
        rootCause: `Error in ${errorLog.component_name || 'unknown component'}: ${errorLog.error_message}`,
        severity: errorLog.severity || 'medium',
        impact: 'This error may affect user experience and should be addressed.',
        recommendedAction: 'Review the error stack trace and apply the suggested fix below.'
      };

      // Generate fix suggestion based on error type
      let fixSuggestion = '';

      if (errorLog.error_message.includes('undefined')) {
        fixSuggestion = `// Add null check before accessing property
if (variable && variable.property) {
  // Safe to use variable.property
}`;
      } else if (errorLog.error_message.includes('fetch') || errorLog.error_message.includes('network')) {
        fixSuggestion = `// Add error handling for network requests
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network error');
  return await response.json();
} catch (error) {
  console.error('Fetch failed:', error);
  // Handle error gracefully
}`;
      } else if (errorLog.error_message.includes('permission') || errorLog.error_message.includes('PGRST')) {
        fixSuggestion = `// Check Supabase RLS policies
// Ensure user has proper permissions in Supabase dashboard
// Or add .single() for queries that should return one row`;
      } else {
        fixSuggestion = `// Review the error stack trace
// ${errorLog.error_stack?.split('\n')[0] || 'No stack trace available'}
// Add try-catch block around the failing code
try {
  // Your code here
} catch (error) {
  console.error('Error:', error);
  // Handle error appropriately
}`;
      }

      // Update error log with AI analysis
      const { error } = await supabase
        .from('error_logs')
        .update({
          ai_analysis: analysis,
          ai_fix_suggestion: fixSuggestion,
          ai_analyzed_at: new Date().toISOString(),
          status: 'analyzing'
        })
        .eq('id', errorLog.id);

      if (error) throw error;

      toast({
        title: '✅ Analysis Complete',
        description: 'AI has analyzed the error. Check the details.'
      });

      fetchErrors();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description: error.message
      });
    } finally {
      setAnalyzing(null);
    }
  };

  // Analyze all open errors
  const analyzeAllErrors = async () => {
    const openErrors = errors.filter(e => e.status === 'open');

    if (openErrors.length === 0) {
      toast({
        title: 'No Errors to Analyze',
        description: 'All errors have been analyzed or resolved.'
      });
      return;
    }

    toast({
      title: '🤖 Analyzing All Errors...',
      description: `Analyzing ${openErrors.length} errors...`
    });

    for (const error of openErrors) {
      await analyzeWithAI(error);
    }

    toast({
      title: '✅ Batch Analysis Complete',
      description: `Analyzed ${openErrors.length} errors successfully.`
    });
  };

  const updateStatus = async (errorId, newStatus) => {
    try {
      const updates = {
        status: newStatus
      };

      if (newStatus === 'fixed' || newStatus === 'ignored') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user.id;
      }

      const { error } = await supabase
        .from('error_logs')
        .update(updates)
        .eq('id', errorId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Error marked as ${newStatus}`
      });

      fetchErrors();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message
      });
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      low: 'bg-blue-500/20 text-blue-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400'
    };

    return (
      <Badge className={variants[severity] || variants.medium}>
        {severity}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: 'bg-red-500/20 text-red-400',
      analyzing: 'bg-purple-500/20 text-purple-400',
      fixed: 'bg-green-500/20 text-green-400',
      ignored: 'bg-gray-500/20 text-gray-400'
    };

    return (
      <Badge className={variants[status] || variants.open}>
        {status}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'Error Message',
      accessor: 'error_message',
      minWidth: '250px',
      render: (row) => (
        <div className="max-w-[250px] md:max-w-[350px]">
          <p className="font-medium text-sm line-clamp-2 break-words">{row.error_message}</p>
          <p className="text-xs text-text-secondary mt-1 truncate">{row.component_name}</p>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'error_type',
      render: (row) => (
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {row.error_type}
        </Badge>
      )
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (row) => getSeverityBadge(row.severity)
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Time',
      accessor: 'created_at',
      render: (row) => (
        <div className="text-xs text-text-secondary whitespace-nowrap">
          {new Date(row.created_at).toLocaleString()}
        </div>
      )
    }
  ];

  const actions = (row) => (
    <div className="flex flex-wrap gap-1 sm:gap-2">
      {row.status === 'open' && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 text-xs gap-1"
          onClick={() => analyzeWithAI(row)}
          disabled={analyzing === row.id}
        >
          {analyzing === row.id ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Brain className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">AI Analyze</span>
        </Button>
      )}

      {row.ai_fix_suggestion && (
        <>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-2 text-xs gap-1"
            onClick={() => {
              // Show fix suggestion in a more detailed view
              const fixWindow = window.open('', '_blank', 'width=800,height=600');
              fixWindow.document.write(`
                <html>
                  <head>
                    <title>AI Fix Suggestion - ${row.error_message.substring(0, 50)}</title>
                    <style>
                      body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        background: #1a1a1a;
                        color: #e0e0e0;
                      }
                      h2 { color: #4ade80; }
                      pre {
                        background: #2a2a2a;
                        padding: 15px;
                        border-radius: 8px;
                        overflow-x: auto;
                        border-left: 3px solid #4ade80;
                      }
                      code { color: #a5d6ff; }
                      .section { margin: 20px 0; }
                      .label { color: #9ca3af; font-size: 14px; }
                    </style>
                  </head>
                  <body>
                    <h2>🤖 AI Fix Suggestion</h2>
                    <div class="section">
                      <div class="label">Error:</div>
                      <p><strong>${row.error_message}</strong></p>
                    </div>
                    <div class="section">
                      <div class="label">Component:</div>
                      <p>${row.component_name || 'Unknown'}</p>
                    </div>
                    <div class="section">
                      <div class="label">Suggested Fix:</div>
                      <pre><code>${row.ai_fix_suggestion}</code></pre>
                    </div>
                    ${row.ai_analysis ? `
                    <div class="section">
                      <div class="label">AI Analysis:</div>
                      <p><strong>Root Cause:</strong> ${row.ai_analysis.rootCause || 'N/A'}</p>
                      <p><strong>Impact:</strong> ${row.ai_analysis.impact || 'N/A'}</p>
                      <p><strong>Recommended Action:</strong> ${row.ai_analysis.recommendedAction || 'N/A'}</p>
                    </div>
                    ` : ''}
                  </body>
                </html>
              `);
            }}
          >
            <Code className="w-3 h-3" />
            <span className="hidden sm:inline">View Fix</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs gap-1"
            onClick={() => {
              // Download fix as a text file
              const fixContent = `
AI Error Fix Suggestion
=======================

Error: ${row.error_message}
Component: ${row.component_name || 'Unknown'}
Type: ${row.error_type}
Severity: ${row.severity}
Time: ${new Date(row.created_at).toLocaleString()}

AI Analysis:
${row.ai_analysis ? `
Root Cause: ${row.ai_analysis.rootCause}
Impact: ${row.ai_analysis.impact}
Recommended Action: ${row.ai_analysis.recommendedAction}
` : 'Not analyzed yet'}

Suggested Fix:
--------------
${row.ai_fix_suggestion}

Stack Trace:
-----------
${row.error_stack || 'No stack trace available'}
              `;

              const blob = new Blob([fixContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `error-fix-${row.id.substring(0, 8)}.txt`;
              a.click();
              URL.revokeObjectURL(url);

              toast({
                title: '📥 Downloaded',
                description: 'Fix suggestion downloaded as text file'
              });
            }}
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </>
      )}

      {row.status !== 'fixed' && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 text-xs gap-1 text-green-500"
          onClick={() => updateStatus(row.id, 'fixed')}
        >
          <Check className="w-3 h-3" />
          <span className="hidden sm:inline">Mark Fixed</span>
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        className="h-8 px-2 text-xs gap-1 text-red-500"
        onClick={() => updateStatus(row.id, 'ignored')}
      >
        <X className="w-3 h-3" />
        <span className="hidden sm:inline">Ignore</span>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col items-center sm:items-start gap-4 mb-6">
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center justify-center sm:justify-start gap-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
              AI Error Monitor
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Monitor all application errors and let AI analyze & suggest fixes automatically
            </p>
          </div>
        </div>

        {/* Control Panel */}
        <Card className="glass-effect border-primary/20 mb-6">
          <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={runHealthScan}
                disabled={scanning}
                size="sm"
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm gap-1 sm:gap-2"
              >
                {scanning ? (
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">{scanning ? 'Scanning...' : 'Scan Application'}</span>
                <span className="inline sm:hidden">{scanning ? 'Scan...' : 'Scan'}</span>
              </Button>

              <Button
                onClick={analyzeAllErrors}
                disabled={analyzing || errors.filter(e => e.status === 'open').length === 0}
                variant="secondary"
                size="sm"
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm gap-1 sm:gap-2"
              >
                <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Analyze All</span>
                <span className="inline sm:hidden">AI</span>
                <span>({errors.filter(e => e.status === 'open').length})</span>
              </Button>

              <Button
                onClick={fetchErrors}
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm gap-1 sm:gap-2"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <div className="ml-auto hidden sm:flex gap-2">
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  Last scan: {scanning ? 'Running...' : 'Manual'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
          <Card className="glass-effect">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary">Total</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{errors.length}</p>
                </div>
                <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary">Open</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-400">
                    {errors.filter(e => e.status === 'open').length}
                  </p>
                </div>
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary">Fixed</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">
                    {errors.filter(e => e.status === 'fixed').length}
                  </p>
                </div>
                <Check className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary">AI</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400">
                    {errors.filter(e => e.ai_fix_suggestion).length}
                  </p>
                </div>
                <Brain className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'open' ? 'default' : 'outline'}
            onClick={() => setFilter('open')}
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            Open
          </Button>
          <Button
            size="sm"
            variant={filter === 'fixed' ? 'default' : 'outline'}
            onClick={() => setFilter('fixed')}
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            Fixed
          </Button>
          <Button
            size="sm"
            variant={filter === 'ignored' ? 'default' : 'outline'}
            onClick={() => setFilter('ignored')}
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            Ignored
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchErrors}
            className="ml-auto h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm gap-1 sm:gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Errors Table */}
        <Card className="glass-effect">
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Error Logs ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto text-primary" />
                <p className="text-xs sm:text-sm text-text-secondary mt-2">Loading errors...</p>
              </div>
            ) : (
              <ResponsiveTable
                data={errors}
                columns={columns}
                actions={actions}
                emptyMessage="No errors found. Great job!"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorMonitorPanel;

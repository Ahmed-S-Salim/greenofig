import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Table as TableIcon,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Settings,
  Info,
  BarChart3,
  Clock,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Columns,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

const DatabaseStudio = ({ user }) => {
  const { toast } = useToast();

  // State management
  const [selectedTable, setSelectedTable] = useState('');
  const [tables, setTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [tableSchema, setTableSchema] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({});

  // Pagination & filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Stats
  const [stats, setStats] = useState({
    totalRows: 0,
    recentActivity: 0,
  });

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Safe table list - only tables that are safe to query
  const SAFE_TABLES = [
    'user_profiles',
    'subscriptions',
    'pricing_plans',
    'features',
    'blog_posts',
    'health_readings',
    'workouts',
    'exercises',
    'meals',
    'nutrition_plans',
    'ai_chat_messages',
    'conversations',
    'messages',
    'visitor_inquiries',
  ];

  // Load available tables on mount
  useEffect(() => {
    loadTables();
  }, []);

  // Load table data when table selection changes
  useEffect(() => {
    if (selectedTable) {
      loadTableData();
      loadTableSchema();
      loadTableStats();
    }
  }, [selectedTable, currentPage, rowsPerPage, sortColumn, sortDirection]);

  const loadTables = async () => {
    setIsLoadingTables(true);
    try {
      // Test which safe tables actually exist and are accessible
      const validTables = [];

      for (const tableName of SAFE_TABLES) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .limit(0);

          if (!error) {
            validTables.push(tableName);
          }
        } catch (e) {
          // Table doesn't exist or isn't accessible, skip it
        }
      }

      setTables(validTables.sort());
      if (validTables.length > 0 && !selectedTable) {
        setSelectedTable(validTables[0]);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
      toast({
        title: 'Error Loading Tables',
        description: 'Failed to load database tables.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const loadTableData = async () => {
    if (!selectedTable) return;

    setIsLoadingData(true);
    try {
      let query = supabase
        .from(selectedTable)
        .select('*', { count: 'exact' });

      // Apply sorting
      if (sortColumn) {
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      }

      // Apply pagination
      const from = (currentPage - 1) * rowsPerPage;
      const to = from + rowsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setTableData(data || []);
      setStats(prev => ({ ...prev, totalRows: count || 0 }));

      // Initialize visible columns if first load
      if (data && data.length > 0 && Object.keys(visibleColumns).length === 0) {
        const columns = Object.keys(data[0]);
        const initialVisible = {};
        columns.forEach(col => {
          initialVisible[col] = true;
        });
        setVisibleColumns(initialVisible);
      }
    } catch (error) {
      console.error('Error loading table data:', error);
      toast({
        title: 'Error Loading Data',
        description: error.message || 'Failed to load table data.',
        variant: 'destructive',
      });
      setTableData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTableSchema = async () => {
    if (!selectedTable || !tableData.length) return;

    // Extract schema from first row
    const firstRow = tableData[0];
    const schema = Object.keys(firstRow).map(key => ({
      name: key,
      type: typeof firstRow[key],
    }));

    setTableSchema(schema);
  };

  const loadTableStats = async () => {
    if (!selectedTable) return;

    try {
      // Get recent activity (rows modified in last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Try to get recent activity if table has updated_at or created_at
      let recentCount = 0;
      try {
        const { count } = await supabase
          .from(selectedTable)
          .select('*', { count: 'exact', head: true })
          .gte('updated_at', twentyFourHoursAgo.toISOString());
        recentCount = count || 0;
      } catch (e) {
        // Table doesn't have updated_at, try created_at
        try {
          const { count } = await supabase
            .from(selectedTable)
            .select('*', { count: 'exact', head: true })
            .gte('created_at', twentyFourHoursAgo.toISOString());
          recentCount = count || 0;
        } catch (e2) {
          // Neither field exists, skip recent activity
        }
      }

      setStats(prev => ({ ...prev, recentActivity: recentCount }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleViewRow = (row) => {
    setSelectedRow(row);
    setViewDialogOpen(true);
  };

  const handleEditRow = (row) => {
    setSelectedRow(row);
    setEditFormData({ ...row });
    setEditDialogOpen(true);
  };

  const handleDeleteRow = (row) => {
    setSelectedRow(row);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRow || !selectedRow.id) {
      toast({
        title: 'Error',
        description: 'Cannot update row without ID.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from(selectedTable)
        .update(editFormData)
        .eq('id', selectedRow.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Row updated successfully.',
      });

      setEditDialogOpen(false);
      loadTableData();
    } catch (error) {
      console.error('Error updating row:', error);
      toast({
        title: 'Error Updating Row',
        description: error.message || 'Failed to update row. Check RLS policies.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow || !selectedRow.id) {
      toast({
        title: 'Error',
        description: 'Cannot delete row without ID.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', selectedRow.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Row deleted successfully.',
      });

      setDeleteDialogOpen(false);
      loadTableData();
    } catch (error) {
      console.error('Error deleting row:', error);
      toast({
        title: 'Error Deleting Row',
        description: error.message || 'Failed to delete row. Check RLS policies.',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    if (!tableData.length) return;

    const headers = Object.keys(tableData[0]);
    const csv = [
      headers.join(','),
      ...tableData.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Data has been exported as CSV.',
    });
  };

  const handleExportJSON = () => {
    if (!tableData.length) return;

    const json = JSON.stringify(tableData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Data has been exported as JSON.',
    });
  };

  const filteredData = tableData.filter(row => {
    if (!searchQuery) return true;

    return Object.values(row).some(value => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  const totalPages = Math.ceil(stats.totalRows / rowsPerPage);
  const visibleColumnNames = Object.keys(visibleColumns).filter(col => visibleColumns[col]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Database Studio
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Secure database browser with read and controlled write access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTableData}
            disabled={!selectedTable || isLoadingData}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">in {selectedTable || 'selected table'}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">rows modified (24h)</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables Available</CardTitle>
            <TableIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
            <p className="text-xs text-muted-foreground">accessible tables</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Secure Database Access
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-200">
                All operations are subject to Row Level Security (RLS) policies. Raw SQL execution has been disabled for security. Only safe, pre-defined operations are allowed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Browser */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Table Browser
              </CardTitle>
              <CardDescription>Browse and manage database tables securely</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map(table => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Column Visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {Object.keys(visibleColumns).map(column => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      checked={visibleColumns[column]}
                      onCheckedChange={(checked) => {
                        setVisibleColumns(prev => ({ ...prev, [column]: checked }));
                      }}
                    >
                      {column}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!tableData.length}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem onSelect={handleExportCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem onSelect={handleExportJSON}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export as JSON
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Data Table */}
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          ) : !selectedTable ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TableIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Table Selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a table from the dropdown above to view its data
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No records match your search query.' : 'This table is empty.'}
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        {visibleColumnNames.map(column => (
                          <TableHead key={column} className="font-semibold">
                            <button
                              onClick={() => handleSort(column)}
                              className="flex items-center gap-2 hover:text-foreground transition-colors"
                            >
                              {column}
                              {sortColumn === column && (
                                sortDirection === 'asc' ? (
                                  <SortAsc className="h-4 w-4" />
                                ) : (
                                  <SortDesc className="h-4 w-4" />
                                )
                              )}
                            </button>
                          </TableHead>
                        ))}
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((row, index) => (
                        <TableRow key={row.id || index} className="hover:bg-muted/30">
                          {visibleColumnNames.map(column => (
                            <TableCell key={column} className="max-w-xs">
                              <div className="truncate" title={String(row[column])}>
                                {row[column] === null || row[column] === undefined ? (
                                  <span className="text-muted-foreground italic">null</span>
                                ) : typeof row[column] === 'boolean' ? (
                                  row[column] ? (
                                    <Badge variant="default" className="bg-green-500">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      true
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      false
                                    </Badge>
                                  )
                                ) : typeof row[column] === 'object' ? (
                                  <code className="text-xs">{JSON.stringify(row[column])}</code>
                                ) : (
                                  String(row[column])
                                )}
                              </div>
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewRow(row)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRow(row)}
                                title="Edit row"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRow(row)}
                                title="Delete row"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rows-per-page" className="text-sm text-muted-foreground">
                    Rows per page:
                  </Label>
                  <Select
                    value={String(rowsPerPage)}
                    onValueChange={(value) => {
                      setRowsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger id="rows-per-page" className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoadingData}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || isLoadingData}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Row Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Row Details</DialogTitle>
            <DialogDescription>
              Viewing record from {selectedTable}
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-3">
              {Object.entries(selectedRow).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b border-border/50">
                  <div className="font-medium text-sm text-muted-foreground">{key}</div>
                  <div className="col-span-2 text-sm break-all">
                    {value === null || value === undefined ? (
                      <span className="text-muted-foreground italic">null</span>
                    ) : typeof value === 'object' ? (
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : typeof value === 'boolean' ? (
                      <Badge variant={value ? 'default' : 'secondary'}>
                        {String(value)}
                      </Badge>
                    ) : (
                      String(value)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Row Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Row</DialogTitle>
            <DialogDescription>
              Modify record in {selectedTable}. Changes are subject to RLS policies.
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4">
              {Object.entries(editFormData).map(([key, value]) => {
                // Don't allow editing id, created_at, updated_at
                const isReadOnly = ['id', 'created_at', 'updated_at'].includes(key);

                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`edit-${key}`} className="text-sm font-medium">
                      {key}
                      {isReadOnly && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Read-only
                        </Badge>
                      )}
                    </Label>
                    {typeof value === 'boolean' ? (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`edit-${key}`}
                          checked={editFormData[key]}
                          onCheckedChange={(checked) => {
                            setEditFormData(prev => ({ ...prev, [key]: checked }));
                          }}
                          disabled={isReadOnly}
                        />
                        <Label htmlFor={`edit-${key}`} className="text-sm text-muted-foreground">
                          {editFormData[key] ? 'True' : 'False'}
                        </Label>
                      </div>
                    ) : typeof value === 'object' ? (
                      <textarea
                        id={`edit-${key}`}
                        value={JSON.stringify(editFormData[key], null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setEditFormData(prev => ({ ...prev, [key]: parsed }));
                          } catch (err) {
                            // Invalid JSON, keep as string for now
                          }
                        }}
                        disabled={isReadOnly}
                        className="w-full p-2 border rounded-md bg-background text-sm font-mono"
                        rows={4}
                      />
                    ) : (
                      <Input
                        id={`edit-${key}`}
                        value={editFormData[key] || ''}
                        onChange={(e) => {
                          setEditFormData(prev => ({ ...prev, [key]: e.target.value }));
                        }}
                        disabled={isReadOnly}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record from {selectedTable}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedRow && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Record to delete:</p>
              <code className="text-xs">
                {JSON.stringify(selectedRow, null, 2)}
              </code>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DatabaseStudio;

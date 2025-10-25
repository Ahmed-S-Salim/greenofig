import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Mail, Search, Loader2, Badge as BadgeIcon, Download,
  Trash2, UserX, Send, Eye, X, Filter, ChevronLeft, ChevronRight,
  Calendar, Activity, CreditCard, CheckCircle, XCircle, Users, MessageCircle, Gift,
  Clock, DollarSign, ShoppingCart, TrendingUp
} from 'lucide-react';
import { getUserActivityLogs } from '@/lib/activityLogger';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from '@/components/ui/checkbox';
import CustomOfferDialog from './CustomOfferDialog';
import CustomerChatDialog from './CustomerChatDialog';

const CustomersManager = () => {
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isBulkOfferMode, setIsBulkOfferMode] = useState(false);
  const [userActivity, setUserActivity] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withSubscription: 0,
    newThisMonth: 0
  });

  const fetchUsers = async () => {
    setLoading(true);

    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch subscriptions
    const { data: subsData, error: subsError } = await supabase
      .from('subscriptions')
      .select('*');

    if (usersError) {
      toast({ title: 'Error fetching users', description: usersError.message, variant: 'destructive' });
    } else {
      setUsers(usersData || []);
      setSubscriptions(subsData || []);

      // Calculate statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const activeUsers = usersData?.filter(u => u.is_active).length || 0;
      const usersWithSub = usersData?.filter(u =>
        subsData?.some(s => s.user_id === u.id)
      ).length || 0;
      const newThisMonth = usersData?.filter(u => {
        const created = new Date(u.created_at);
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
      }).length || 0;

      setStats({
        total: usersData?.length || 0,
        active: activeUsers,
        withSubscription: usersWithSub,
        newThisMonth: newThisMonth
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Get user subscription
  const getUserSubscription = (userId) => {
    return subscriptions.find(s => s.user_id === userId);
  };

  // Apply filters and search
  useEffect(() => {
    let results = users.filter(user => {
      // Search filter
      const matchesSearch =
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active);

      // Subscription filter
      const userSub = getUserSubscription(user.id);
      const matchesSub = subscriptionFilter === 'all' ||
        (subscriptionFilter === 'with' && userSub) ||
        (subscriptionFilter === 'without' && !userSub);

      return matchesSearch && matchesRole && matchesStatus && matchesSub;
    });

    setFilteredUsers(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, users, subscriptions, roleFilter, statusFilter, subscriptionFilter]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        toast({ title: "Failed to update role", description: error.message, variant: 'destructive' });
    } else {
        toast({ title: "User role updated successfully!" });
        fetchUsers();
    }
  };

  const handleSuspendUser = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast({ title: "Failed to update status", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: currentStatus ? "User suspended" : "User activated" });
      fetchUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userToDelete.id);

    if (error) {
      toast({ title: "Failed to delete user", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: "User deleted successfully" });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    }
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast({ title: "No data to export", variant: 'destructive' });
      return;
    }

    const csvData = filteredUsers.map(user => {
      const sub = getUserSubscription(user.id);
      return {
        Name: user.full_name || 'N/A',
        Email: user.email,
        Role: user.role,
        Status: user.is_active ? 'Active' : 'Inactive',
        Subscription: sub ? sub.plan : 'None',
        Joined: new Date(user.created_at).toLocaleDateString()
      };
    });

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${Date.now()}.csv`;
    a.click();

    toast({ title: "Export successful!", description: "User data downloaded as CSV" });
  };

  const openUserDetails = async (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    setLoadingDetails(true);

    try {
      // Fetch user activity logs
      const activityLogs = await getUserActivityLogs(user.id, 20);
      setUserActivity(activityLogs);

      // Fetch user payment history
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setUserPayments(payments || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const roleBadgeVariant = {
    user: 'secondary',
    nutritionist: 'default',
    admin: 'destructive',
    super_admin: 'destructive',
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Users</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Users</p>
                <p className="text-3xl font-bold text-green-400">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">With Subscription</p>
                <p className="text-3xl font-bold text-blue-400">{stats.withSubscription}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">New This Month</p>
                <p className="text-3xl font-bold text-purple-400">{stats.newThisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-3xl font-bold">User Management</h2>
        <div className="flex gap-2">
          {isBulkOfferMode && selectedUsers.length > 0 && (
            <>
              <Button
                onClick={() => {
                  setIsOfferDialogOpen(true);
                  setSelectedCustomer({ bulk: true, users: selectedUsers });
                }}
                variant="default"
                className="flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Create Bulk Offer ({selectedUsers.length})
              </Button>
              <Button
                onClick={() => {
                  setIsBulkOfferMode(false);
                  setSelectedUsers([]);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </>
          )}
          {!isBulkOfferMode && (
            <>
              <Button
                onClick={() => setIsBulkOfferMode(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Bulk Offers
              </Button>
              <Button onClick={handleExportCSV} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 glass-effect"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] glass-effect">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="glass-effect">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="nutritionist">Nutritionist</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] glass-effect">
            <Activity className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="glass-effect">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
          <SelectTrigger className="w-[180px] glass-effect">
            <CreditCard className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by subscription" />
          </SelectTrigger>
          <SelectContent className="glass-effect">
            <SelectItem value="all">All Subscriptions</SelectItem>
            <SelectItem value="with">With Subscription</SelectItem>
            <SelectItem value="without">No Subscription</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-text-secondary">
        Showing {currentUsers.length} of {filteredUsers.length} users
      </div>

      {/* User List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-effect p-4 rounded-lg flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-white/10"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
          >
            {currentUsers.map(user => {
              const userSub = getUserSubscription(user.id);
              const isSelected = selectedUsers.some(u => u.id === user.id);
              return (
                <motion.div variants={itemVariants} key={user.id}>
                  <Card className={`glass-effect hover:bg-white/10 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {isBulkOfferMode && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers([...selectedUsers, user]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
                              }
                            }}
                          />
                        )}
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profile_picture_url} alt={user.full_name} />
                          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-lg">{user.full_name || 'N/A'}</p>
                            {user.is_active ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <p className="text-sm text-text-secondary flex items-center gap-2">
                            <Mail className="w-4 h-4" />{user.email}
                          </p>
                          {userSub && (
                            <p className="text-xs text-primary flex items-center gap-1 mt-1">
                              <CreditCard className="w-3 h-3" />
                              {userSub.plan} subscription
                            </p>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                           <Badge variant={roleBadgeVariant[user.role] || 'secondary'} className="capitalize mb-1">
                             {user.role?.replace('_', ' ')}
                           </Badge>
                           <p className="text-xs text-text-secondary">
                             Joined {new Date(user.created_at).toLocaleDateString()}
                           </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openUserDetails(user)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCustomer(user);
                              setIsChatDialogOpen(true);
                            }}
                            title="Chat with Customer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <span className="sr-only">Open menu</span>
                                    •••
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-effect">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCustomer(user);
                                    setIsChatDialogOpen(true);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Chat with Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCustomer(user);
                                    setIsOfferDialogOpen(true);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <Gift className="w-4 h-4" />
                                  Create Custom Offer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}>User</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'nutritionist')}>Nutritionist</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>Admin</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleSuspendUser(user.id, user.is_active)}
                                  className="flex items-center gap-2"
                                >
                                  <UserX className="w-4 h-4" />
                                  {user.is_active ? 'Suspend' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="flex items-center gap-2 text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {filteredUsers.length === 0 && (
               <p className="text-text-secondary text-center py-8">No users found.</p>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="glass-effect"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-text-secondary px-4">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="glass-effect"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Enhanced User Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="glass-effect max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedUser.profile_picture_url} />
                    <AvatarFallback className="text-2xl">{getInitials(selectedUser.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedUser.full_name}</h3>
                    <p className="text-text-secondary flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={selectedUser.is_active ? 'default' : 'destructive'}>
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedUser.role?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedCustomer(selectedUser);
                      setIsChatDialogOpen(true);
                      setIsDetailsOpen(false);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCustomer(selectedUser);
                      setIsOfferDialogOpen(true);
                      setIsDetailsOpen(false);
                    }}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Offer
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
                  <TabsTrigger value="payments">Payment History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <p className="text-sm text-text-secondary">Joined</p>
                      </div>
                      <p className="font-semibold">{format(new Date(selectedUser.created_at), 'MMM dd, yyyy')}</p>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <p className="text-sm text-text-secondary">Subscription</p>
                      </div>
                      <p className="font-semibold capitalize">
                        {getUserSubscription(selectedUser.id)?.plan || 'None'}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        <p className="text-sm text-text-secondary">Payments</p>
                      </div>
                      <p className="font-semibold">{userPayments.length}</p>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <p className="text-sm text-text-secondary">Total Spent</p>
                      </div>
                      <p className="font-semibold">
                        ${userPayments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {getUserSubscription(selectedUser.id) && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Current Subscription</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Plan:</span>
                          <span className="font-medium capitalize">{getUserSubscription(selectedUser.id)?.plan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Status:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Started:</span>
                          <span className="font-medium">{format(new Date(getUserSubscription(selectedUser.id)?.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Activity Timeline Tab */}
                <TabsContent value="activity" className="space-y-4">
                  {loadingDetails ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-text-secondary mt-2">Loading activity...</p>
                    </div>
                  ) : userActivity.length > 0 ? (
                    <div className="space-y-3">
                      {userActivity.map((activity, index) => (
                        <div key={activity.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Activity className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium capitalize">
                              {activity.activity_type.replace(/_/g, ' ')}
                            </p>
                            {activity.details && Object.keys(activity.details).length > 0 && (
                              <p className="text-xs text-text-secondary truncate">
                                {JSON.stringify(activity.details)}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-text-secondary" />
                              <p className="text-xs text-text-secondary">
                                {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto text-text-secondary mb-2" />
                      <p className="text-text-secondary">No activity recorded yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* Payment History Tab */}
                <TabsContent value="payments" className="space-y-4">
                  {loadingDetails ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-text-secondary mt-2">Loading payments...</p>
                    </div>
                  ) : userPayments.length > 0 ? (
                    <div className="space-y-3">
                      {userPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              payment.status === 'succeeded' ? 'bg-green-500/20' :
                              payment.status === 'failed' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                            }`}>
                              <DollarSign className={`w-4 h-4 ${
                                payment.status === 'succeeded' ? 'text-green-400' :
                                payment.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">${payment.amount}</p>
                              <p className="text-xs text-text-secondary">
                                {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={payment.status === 'succeeded' ? 'default' : 'destructive'}>
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 mx-auto text-text-secondary mb-2" />
                      <p className="text-text-secondary">No payment history</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="glass-effect">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Offer Dialog */}
      <CustomOfferDialog
        isOpen={isOfferDialogOpen}
        onClose={() => {
          setIsOfferDialogOpen(false);
          setSelectedCustomer(null);
        }}
        user={selectedCustomer}
        onOfferCreated={() => {
          fetchUsers();
        }}
      />

      {/* Customer Chat Dialog */}
      <CustomerChatDialog
        isOpen={isChatDialogOpen}
        onClose={() => {
          setIsChatDialogOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomersManager;

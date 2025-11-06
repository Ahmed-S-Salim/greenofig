import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  Users,
  Plus,
  Search,
  Mail,
  Edit,
  Trash2,
  Shield,
  UserCog,
  User,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Form state for creating user
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'user'
  });

  // Form state for editing user
  const [editForm, setEditForm] = useState({
    email: '',
    full_name: '',
    role: 'user'
  });

  const [creatingUser, setCreatingUser] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.full_name) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in email and full name',
      });
      return;
    }

    setCreatingUser(true);
    try {
      // Generate a temporary random password
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: tempPassword,
        options: {
          data: {
            full_name: newUser.full_name,
            role: newUser.role,
          },
          emailRedirectTo: `${window.location.origin}/reset-password`,
        },
      });

      if (authError) throw authError;

      // Wait a bit for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update the profile with the correct role
      if (newUser.role !== 'user') {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ role: newUser.role })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Error updating role:', updateError);
        }
      }

      toast({
        title: 'User created successfully',
        description: `${newUser.full_name} has been invited to set their password.`,
      });

      setCreateDialogOpen(false);
      setNewUser({ email: '', full_name: '', role: 'user' });

      // Open invite dialog with the temp password
      setSelectedUser({ ...newUser, tempPassword });
      setInviteDialogOpen(true);

      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error creating user',
        description: error.message,
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editForm.email || !editForm.full_name) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all fields',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email: editForm.email,
          full_name: editForm.full_name,
          role: editForm.role,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'User updated',
        description: 'User information has been updated successfully',
      });

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating user',
        description: error.message,
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'User deleted',
        description: 'User has been removed from the system',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting user',
        description: error.message,
      });
    }
  };

  const sendPasswordResetEmail = async (email) => {
    setSendingInvite(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Password reset email sent',
        description: `An email has been sent to ${email} with instructions to set their password.`,
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        variant: 'destructive',
        title: 'Error sending email',
        description: error.message,
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-orange-500" />;
      case 'nutritionist':
        return <UserCog className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      nutritionist: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[role] || colors.user}`}>
        {getRoleIcon(role)}
        {role.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">User Management</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">Manage platform users and roles</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{user.full_name || 'N/A'}</h3>
                          {getRoleBadge(user.role)}
                        </div>
                        <p className="text-sm text-text-secondary flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendPasswordResetEmail(user.email)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Reset Password
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-text-secondary">Try adjusting your search</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="glass-effect max-w-md lg:max-w-lg xl:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account. They will receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input
                placeholder="John Doe"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="glass-effect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="nutritionist">Nutritionist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={creatingUser}>
              {creatingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass-effect max-w-md lg:max-w-lg xl:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                placeholder="user@example.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input
                placeholder="John Doe"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger className="glass-effect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="nutritionist">Nutritionist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Instructions Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="glass-effect max-w-md lg:max-w-lg xl:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              User Created Successfully
            </DialogTitle>
            <DialogDescription>
              The user has been created and can now set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">User Details:</p>
              <p className="text-sm">Email: <span className="font-mono">{selectedUser?.email}</span></p>
              <p className="text-sm">Name: {selectedUser?.full_name}</p>
              <p className="text-sm">Role: {selectedUser?.role}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Next Steps:</p>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>The user will receive a confirmation email from Supabase</li>
                <li>Click the "Send Password Reset" button below to send setup instructions</li>
                <li>The user can then set their own password and login</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                sendPasswordResetEmail(selectedUser?.email);
                setInviteDialogOpen(false);
              }}
              disabled={sendingInvite}
            >
              {sendingInvite && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Mail className="w-4 h-4 mr-2" />
              Send Password Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;

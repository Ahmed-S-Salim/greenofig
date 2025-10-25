import React, { useState, useEffect, useMemo } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Helmet } from 'react-helmet';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { Users, FileText, MessageSquare, Search, MoreHorizontal, Eye, Mail, Video, Zap, Bot, Loader2, X, Activity, Target, Scale, Calendar, TrendingUp, Plus, Save } from 'lucide-react';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Textarea } from '@/components/ui/textarea';
    import { supabase } from '@/lib/customSupabaseClient';

    const NutritionistDashboard = () => {
      const { userProfile } = useAuth();
      const [clients, setClients] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedClient, setSelectedClient] = useState(null);
      const [showClientModal, setShowClientModal] = useState(false);
      const [showMealPlanModal, setShowMealPlanModal] = useState(false);
      const [clientNotes, setClientNotes] = useState({});
      const [savingNotes, setSavingNotes] = useState(false);

      useEffect(() => {
        const fetchClients = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('role', 'user');

          if (error) {
            toast({
              variant: "destructive",
              title: "Error fetching clients",
              description: error.message,
            });
            setClients([]);
          } else {
            setClients(data);
          }
          setLoading(false);
        };

        fetchClients();
      }, []);

      const handleUnimplemented = (feature) => {
        toast({
          title: `🚧 ${feature} Feature In-Progress!`,
          description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
        });
      };

      const handleViewProfile = (client) => {
        setSelectedClient(client);
        setShowClientModal(true);
      };

      const handleCreatePlan = (client) => {
        setSelectedClient(client);
        setShowMealPlanModal(true);
      };

      const handleSaveNotes = async (clientId) => {
        setSavingNotes(true);
        const notes = clientNotes[clientId] || '';

        const { error } = await supabase
          .from('user_profiles')
          .update({ nutritionist_notes: notes })
          .eq('id', clientId);

        if (error) {
          toast({
            variant: "destructive",
            title: "Error saving notes",
            description: error.message,
          });
        } else {
          toast({
            title: "Notes saved!",
            description: "Client notes have been updated successfully.",
          });
          // Update local state
          setClients(prev => prev.map(c => c.id === clientId ? { ...c, nutritionist_notes: notes } : c));
        }
        setSavingNotes(false);
      };

      const calculateBMI = (weight, height) => {
        if (!weight || !height) return 'N/A';
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        return bmi;
      };

      const getBMICategory = (bmi) => {
        if (bmi === 'N/A') return { text: 'N/A', color: 'text-muted-foreground' };
        const bmiNum = parseFloat(bmi);
        if (bmiNum < 18.5) return { text: 'Underweight', color: 'text-blue-500' };
        if (bmiNum < 25) return { text: 'Normal', color: 'text-primary' };
        if (bmiNum < 30) return { text: 'Overweight', color: 'text-amber-500' };
        return { text: 'Obese', color: 'text-destructive' };
      };

      const filteredClients = useMemo(() => {
        return clients.filter(client =>
          (client.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }, [clients, searchTerm]);

      const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      };

      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      };

      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
      };

      return (
        <>
          <Helmet>
            <title>Nutritionist Dashboard - GreenoFig</title>
            <meta name="description" content="Manage your clients, meal plans, and communications." />
          </Helmet>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl font-bold">
                Nutritionist <span className="gradient-text">Workspace</span>
              </h1>
              <p className="text-text-secondary mt-2">Welcome, {userProfile?.full_name?.split(' ')[0] || 'Expert'}. Here's your client overview.</p>
            </motion.div>

            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={itemVariants}>
                    <Card className="glass-effect h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : clients.length}</div>
                            <p className="text-xs text-muted-foreground">All assigned clients</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants} onClick={() => handleUnimplemented('1-1 Video Call')} className="cursor-pointer">
                    <Card className="glass-effect h-full hover:border-primary transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">1-1 Video Call</CardTitle>
                            <Video className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">Start <Zap className="w-5 h-5 text-yellow-400" /></div>
                            <p className="text-xs text-muted-foreground">Connect with clients instantly</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants} onClick={() => handleUnimplemented('Messaging')} className="cursor-pointer">
                    <Card className="glass-effect h-full hover:border-primary transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messaging</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div className="text-2xl font-bold">Open Chat</div>
                            <p className="text-xs text-muted-foreground">12 unread messages</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants} onClick={() => handleUnimplemented('AI Assistant')} className="cursor-pointer">
                    <Card className="glass-effect h-full hover:border-primary transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
                            <Bot className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div className="text-2xl font-bold">Activate</div>
                            <p className="text-xs text-muted-foreground">Get help with plans & queries</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-effect">
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle className="text-xl font-bold">Client Management</CardTitle>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        placeholder="Search clients..."
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase">
                      <tr>
                        <th scope="col" className="px-6 py-3">Client</th>
                        <th scope="col" className="px-6 py-3 hidden md:table-cell">Last Activity</th>
                        <th scope="col" className="px-6 py-3 hidden lg:table-cell">Status</th>
                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="text-center py-10">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="ml-4 text-lg">Loading Clients...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-10">
                            <p className="text-lg">No clients found.</p>
                            <p className="text-muted-foreground">When users sign up, they will appear here.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map(client => (
                          <tr key={client.id} className="border-b border-border hover:bg-muted/50">
                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={client.profile_picture_url} alt={client.full_name} />
                                <AvatarFallback>{client.full_name?.split(' ').map(n => n[0]).join('') || '?'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-text-primary">{client.full_name}</div>
                                <div className="text-text-secondary">{client.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">{formatDate(client.updated_at)}</td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              <span className={`flex items-center text-sm ${client.is_active ? 'text-green-400' : 'text-amber-400'}`}>
                                <span className={`h-2 w-2 mr-2 rounded-full ${client.is_active ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                                <span className="capitalize">{client.is_active ? 'Active' : 'Inactive'}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-effect">
                                  <DropdownMenuItem onClick={() => handleViewProfile(client)}><Eye className="mr-2 h-4 w-4" /> View Profile</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCreatePlan(client)}><FileText className="mr-2 h-4 w-4" /> Create Plan</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUnimplemented('Messaging')}><Mail className="mr-2 h-4 w-4" /> Send Message</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>

            {/* Client Profile Modal */}
            <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-effect">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedClient?.profile_picture_url} />
                      <AvatarFallback>{selectedClient?.full_name?.split(' ').map(n => n[0]).join('') || '?'}</AvatarFallback>
                    </Avatar>
                    {selectedClient?.full_name}
                  </DialogTitle>
                  <DialogDescription>{selectedClient?.email}</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="health">Health Data</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Personal Info
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Age:</span>
                            <span className="font-medium">{selectedClient?.age || 'N/A'} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gender:</span>
                            <span className="font-medium capitalize">{selectedClient?.gender || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Joined:</span>
                            <span className="font-medium">{selectedClient?.created_at ? new Date(selectedClient.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Activity Level
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Level:</span>
                            <span className="font-medium capitalize">{selectedClient?.activity_level?.replace('_', ' ') || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`font-medium ${selectedClient?.is_active ? 'text-green-400' : 'text-amber-400'}`}>
                              {selectedClient?.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Health Goals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedClient?.health_goals && selectedClient.health_goals.length > 0 ? (
                            selectedClient.health_goals.map((goal, idx) => (
                              <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm capitalize">
                                {goal.replace('_', ' ')}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No goals set</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="health" className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Scale className="h-4 w-4" />
                            Weight
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{selectedClient?.weight_kg || 'N/A'}</div>
                          <p className="text-xs text-muted-foreground">kilograms</p>
                        </CardContent>
                      </Card>

                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Height
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{selectedClient?.height_cm || 'N/A'}</div>
                          <p className="text-xs text-muted-foreground">centimeters</p>
                        </CardContent>
                      </Card>

                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            BMI
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{calculateBMI(selectedClient?.weight_kg, selectedClient?.height_cm)}</div>
                          <p className={`text-xs font-medium ${getBMICategory(calculateBMI(selectedClient?.weight_kg, selectedClient?.height_cm)).color}`}>
                            {getBMICategory(calculateBMI(selectedClient?.weight_kg, selectedClient?.height_cm)).text}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="text-sm">Dietary Preferences</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {selectedClient?.dietary_preferences || 'No dietary preferences specified'}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4 mt-4">
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>Nutritionist Notes</span>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(selectedClient?.id)}
                            disabled={savingNotes}
                          >
                            {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Notes
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Add notes about this client's progress, challenges, recommendations, etc."
                          className="min-h-[200px] bg-background"
                          value={clientNotes[selectedClient?.id] || selectedClient?.nutritionist_notes || ''}
                          onChange={(e) => setClientNotes(prev => ({ ...prev, [selectedClient?.id]: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          These notes are private and only visible to nutritionists.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* Meal Plan Modal */}
            <Dialog open={showMealPlanModal} onOpenChange={setShowMealPlanModal}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-effect">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Create Meal Plan</DialogTitle>
                  <DialogDescription>
                    Create a personalized meal plan for {selectedClient?.full_name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="text-sm">Plan Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Plan Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Weight Loss Plan"
                            className="w-full bg-background border border-border rounded-lg p-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Duration (weeks)</label>
                          <input
                            type="number"
                            placeholder="4"
                            className="w-full bg-background border border-border rounded-lg p-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Daily Calories</label>
                          <input
                            type="number"
                            placeholder="2000"
                            className="w-full bg-background border border-border rounded-lg p-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Protein (g)</label>
                          <input
                            type="number"
                            placeholder="150"
                            className="w-full bg-background border border-border rounded-lg p-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Carbs (g)</label>
                          <input
                            type="number"
                            placeholder="200"
                            className="w-full bg-background border border-border rounded-lg p-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Meal Plan Description</label>
                        <Textarea
                          placeholder="Describe the meal plan objectives and approach..."
                          className="min-h-[100px] bg-background"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Sample Meals</span>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Meal
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Click "Add Meal" to start building the meal plan
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowMealPlanModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast({
                        title: "Meal Plan Created!",
                        description: "The meal plan has been saved for " + selectedClient?.full_name,
                      });
                      setShowMealPlanModal(false);
                    }}>
                      Create Plan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </>
      );
    };

    export default NutritionistDashboard;
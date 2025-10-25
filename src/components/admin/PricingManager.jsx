import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Loader2, DollarSign } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const PricingManager = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [formState, setFormState] = useState({ id: null, name: '', description: '', price_monthly: 0, price_yearly: 0, is_popular: false, is_active: true, features: '', display_order: 0 });

    const fetchPlans = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('subscription_plans').select('*').order('display_order');
        if (error) {
            toast({ title: "Error fetching pricing plans", description: error.message, variant: "destructive" });
        } else {
            setPlans(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleFeaturesChange = (e) => {
        setFormState(prev => ({...prev, features: e.target.value }));
    }

    const handleOpenDialog = (plan = null) => {
        setCurrentPlan(plan);
        if (plan) {
            setFormState({...plan, features: Array.isArray(plan.features) ? plan.features.join('\n') : '' });
        } else {
            setFormState({ id: null, name: '', description: '', price_monthly: 0, price_yearly: 0, is_popular: false, is_active: true, features: '', display_order: 0 });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        // Prepare data, ensuring features is an array of strings.
        const dataToSave = { 
            ...formState, 
            features: typeof formState.features === 'string' ? formState.features.split('\n').filter(f => f.trim() !== '') : []
        };
        
        // If it's a new plan, don't include the null ID
        if (!dataToSave.id) {
            delete dataToSave.id;
        }

        const { error } = await supabase.from('subscription_plans').upsert(dataToSave);

        if (error) {
            console.error('Save error:', error);
            toast({ title: "Error saving plan", description: error.message, variant: "destructive" });
        } else {
            toast({ title: `Plan ${currentPlan ? 'updated' : 'created'} successfully` });
            fetchPlans();
            setIsDialogOpen(false);
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
        if (error) {
            toast({ title: "Error deleting plan", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Plan deleted successfully" });
            fetchPlans();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Manage Pricing Plans</h2>
                <Button onClick={() => handleOpenDialog()}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Plan
                </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-effect">
                    <DialogHeader><DialogTitle>{currentPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="name">Plan Name</Label><Input id="name" name="name" value={formState.name} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" name="description" value={formState.description || ''} onChange={handleInputChange} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="price_monthly">Monthly Price</Label><Input id="price_monthly" name="price_monthly" type="number" value={formState.price_monthly} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label htmlFor="price_yearly">Yearly Price (per month)</Label><Input id="price_yearly" name="price_yearly" type="number" value={formState.price_yearly} onChange={handleInputChange} /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="features">Features (one per line)</Label><Textarea id="features" name="features" value={formState.features} onChange={handleFeaturesChange} rows={8} /></div>
                        <div className="flex items-center space-x-2"><Checkbox id="is_popular" name="is_popular" checked={formState.is_popular} onCheckedChange={(checked) => setFormState(prev => ({ ...prev, is_popular: checked }))} /><Label htmlFor="is_popular">Most Popular</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="is_active" name="is_active" checked={formState.is_active} onCheckedChange={(checked) => setFormState(prev => ({ ...prev, is_active: checked }))} /><Label htmlFor="is_active">Active (shown on pricing page)</Label></div>
                        <div className="space-y-2"><Label htmlFor="display_order">Display Order</Label><Input id="display_order" name="display_order" type="number" value={formState.display_order} onChange={handleInputChange} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="glass-effect">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-4 text-lg">Loading Plans...</span></div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-12"><DollarSign className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium">No plans found</h3><p className="mt-1 text-sm text-gray-500">Get started by creating a new plan.</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b border-white/10"><th className="p-4">Name</th><th className="p-4">Monthly Price</th><th className="p-4">Yearly Price</th><th className="p-4">Popular</th><th className="p-4">Active</th><th className="p-4 text-right">Actions</th></tr></thead>
                                <tbody>
                                    {plans.map(plan => (
                                        <tr key={plan.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4 font-medium">{plan.name}</td>
                                            <td className="p-4 text-text-secondary">${plan.price_monthly}</td>
                                            <td className="p-4 text-text-secondary">${plan.price_yearly}</td>
                                            <td className="p-4">{plan.is_popular ? 'Yes' : 'No'}</td>
                                            <td className="p-4">{plan.is_active ? <span className="text-green-400">Yes</span> : <span className="text-gray-500">No</span>}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(plan)}><Edit className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PricingManager;
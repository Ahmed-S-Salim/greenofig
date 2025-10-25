import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Loader2, FileText } from 'lucide-react';

const FeaturesManager = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(null);
    const [formState, setFormState] = useState({ category: '', category_icon: '', name: '', description: '', plan_tier: '', feature_icon: '', display_order: 0 });

    const fetchFeatures = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('features').select('*').order('display_order');
        if (error) {
            toast({ title: "Error fetching features", description: error.message, variant: "destructive" });
        } else {
            setFeatures(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFeatures();
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenDialog = (feature = null) => {
        setCurrentFeature(feature);
        if (feature) {
            setFormState(feature);
        } else {
            setFormState({ category: '', category_icon: '', name: '', description: '', plan_tier: '', feature_icon: '', display_order: 0 });
        }
        setIsDialogOpen(true);
    };
    
    const handleSave = async () => {
        const { error } = await supabase.from('features').upsert(formState);
        if (error) {
            toast({ title: "Error saving feature", description: error.message, variant: "destructive" });
        } else {
            toast({ title: `Feature ${currentFeature ? 'updated' : 'created'} successfully` });
            fetchFeatures();
            setIsDialogOpen(false);
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('features').delete().eq('id', id);
        if (error) {
            toast({ title: "Error deleting feature", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Feature deleted successfully" });
            fetchFeatures();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Manage Features</h2>
                <Button onClick={() => handleOpenDialog()}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Feature
                </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-effect">
                    <DialogHeader>
                        <DialogTitle>{currentFeature ? 'Edit Feature' : 'Create New Feature'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" name="category" value={formState.category} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label htmlFor="category_icon">Category Icon</Label><Input id="category_icon" name="category_icon" value={formState.category_icon || ''} onChange={handleInputChange} placeholder="e.g. Heart"/></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" value={formState.name} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formState.description} onChange={handleInputChange} /></div>
                        <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-2"><Label htmlFor="plan_tier">Plan Tier</Label><Input id="plan_tier" name="plan_tier" value={formState.plan_tier || ''} onChange={handleInputChange} placeholder="e.g. Premium"/></div>
                            <div className="space-y-2"><Label htmlFor="feature_icon">Feature Icon</Label><Input id="feature_icon" name="feature_icon" value={formState.feature_icon || ''} onChange={handleInputChange} placeholder="e.g. CheckCircle"/></div>
                            <div className="space-y-2"><Label htmlFor="display_order">Display Order</Label><Input id="display_order" name="display_order" type="number" value={formState.display_order} onChange={handleInputChange} /></div>
                        </div>
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
                        <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-4 text-lg">Loading Features...</span></div>
                    ) : features.length === 0 ? (
                         <div className="text-center py-12"><FileText className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium">No features found</h3><p className="mt-1 text-sm text-gray-500">Get started by creating a new feature.</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b border-white/10"><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Description</th><th className="p-4 text-right">Actions</th></tr></thead>
                                <tbody>
                                    {features.map(feature => (
                                        <tr key={feature.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4 font-medium">{feature.name}</td>
                                            <td className="p-4 text-text-secondary">{feature.category}</td>
                                            <td className="p-4 text-text-secondary truncate max-w-sm">{feature.description}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(feature)}><Edit className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(feature.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
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

export default FeaturesManager;
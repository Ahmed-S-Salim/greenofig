import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Save, X, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      alert('Error loading testimonials: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Create new testimonial
  const handleCreate = () => {
    setEditingTestimonial({
      customer_name: '',
      customer_title: '',
      customer_company: '',
      quote: '',
      full_review: '',
      rating: 5,
      category: 'general',
      is_featured: false,
      is_active: true,
      verified: false,
    });
    setIsDialogOpen(true);
  };

  // Edit testimonial
  const handleEdit = (testimonial) => {
    setEditingTestimonial({ ...testimonial });
    setIsDialogOpen(true);
  };

  // Save testimonial
  const handleSave = async () => {
    try {
      if (!editingTestimonial.customer_name || !editingTestimonial.quote) {
        alert('Customer name and quote are required');
        return;
      }

      if (editingTestimonial.id) {
        // Update existing
        const { error } = await supabase
          .from('testimonials')
          .update({
            customer_name: editingTestimonial.customer_name,
            customer_title: editingTestimonial.customer_title,
            customer_company: editingTestimonial.customer_company,
            quote: editingTestimonial.quote,
            full_review: editingTestimonial.full_review,
            rating: editingTestimonial.rating,
            category: editingTestimonial.category,
            is_featured: editingTestimonial.is_featured,
            is_active: editingTestimonial.is_active,
            verified: editingTestimonial.verified,
          })
          .eq('id', editingTestimonial.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('testimonials')
          .insert([editingTestimonial]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingTestimonial(null);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Error saving testimonial: ' + error.message);
    }
  };

  // Delete testimonial
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Error deleting testimonial: ' + error.message);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !testimonial.is_featured })
        .eq('id', testimonial.id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Error updating testimonial: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading testimonials...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Testimonials Manager</h2>
          <p className="text-text-secondary mt-1">Manage customer reviews and testimonials</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid gap-4">
        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-text-secondary">No testimonials yet. Click "Add Testimonial" to create one.</p>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={!testimonial.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {testimonial.customer_name}
                      {testimonial.is_featured && (
                        <span className="text-xs font-normal px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded">
                          Featured
                        </span>
                      )}
                      {testimonial.verified && (
                        <span className="text-xs font-normal px-2 py-1 bg-green-500/10 text-green-600 rounded">
                          Verified
                        </span>
                      )}
                      {!testimonial.is_active && (
                        <span className="text-xs font-normal px-2 py-1 bg-gray-500/10 text-gray-600 rounded">
                          Hidden
                        </span>
                      )}
                    </CardTitle>
                    {testimonial.customer_title && (
                      <p className="text-sm text-text-secondary">
                        {testimonial.customer_title}
                        {testimonial.customer_company && ` at ${testimonial.customer_company}`}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={testimonial.is_featured ? 'default' : 'outline'}
                      onClick={() => handleToggleFeatured(testimonial)}
                    >
                      {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(testimonial)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(testimonial.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-text-secondary">"{testimonial.quote}"</p>
                {testimonial.category && (
                  <p className="text-xs text-text-secondary mt-2">Category: {testimonial.category}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTestimonial?.id ? 'Edit Testimonial' : 'Create New Testimonial'}</DialogTitle>
          </DialogHeader>

          {editingTestimonial && (
            <div className="space-y-4">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={editingTestimonial.customer_name}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, customer_name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title/Role</Label>
                  <Input
                    value={editingTestimonial.customer_title || ''}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, customer_title: e.target.value })
                    }
                    placeholder="CEO, Fitness Enthusiast, etc."
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={editingTestimonial.customer_company || ''}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, customer_company: e.target.value })
                    }
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <Label>Quote *</Label>
                <Textarea
                  value={editingTestimonial.quote}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })
                  }
                  placeholder="Short testimonial quote..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Full Review (Optional)</Label>
                <Textarea
                  value={editingTestimonial.full_review || ''}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, full_review: e.target.value })
                  }
                  placeholder="Full detailed review..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rating</Label>
                  <Select
                    value={editingTestimonial.rating?.toString() || '5'}
                    onValueChange={(value) =>
                      setEditingTestimonial({ ...editingTestimonial, rating: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editingTestimonial.category}
                    onValueChange={(value) =>
                      setEditingTestimonial({ ...editingTestimonial, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingTestimonial.is_featured}
                    onCheckedChange={(checked) =>
                      setEditingTestimonial({ ...editingTestimonial, is_featured: checked })
                    }
                  />
                  <Label>Featured (show on homepage)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingTestimonial.verified}
                    onCheckedChange={(checked) =>
                      setEditingTestimonial({ ...editingTestimonial, verified: checked })
                    }
                  />
                  <Label>Verified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingTestimonial.is_active}
                    onCheckedChange={(checked) =>
                      setEditingTestimonial({ ...editingTestimonial, is_active: checked })
                    }
                  />
                  <Label>Active (visible on website)</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManager;

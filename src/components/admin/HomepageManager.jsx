import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
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

const HomepageManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('section_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      alert('Error loading homepage sections: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Create new section
  const handleCreate = () => {
    setEditingSection({
      section_type: 'hero',
      section_order: sections.length,
      is_active: true,
      title: '',
      subtitle: '',
      description: '',
      cta_text: '',
      cta_link: '',
    });
    setIsDialogOpen(true);
  };

  // Edit section
  const handleEdit = (section) => {
    setEditingSection({ ...section });
    setIsDialogOpen(true);
  };

  // Save section
  const handleSave = async () => {
    try {
      if (!editingSection.title) {
        alert('Title is required');
        return;
      }

      if (editingSection.id) {
        // Update existing
        const { error } = await supabase
          .from('homepage_content')
          .update({
            section_type: editingSection.section_type,
            title: editingSection.title,
            subtitle: editingSection.subtitle,
            description: editingSection.description,
            cta_text: editingSection.cta_text,
            cta_link: editingSection.cta_link,
            is_active: editingSection.is_active,
          })
          .eq('id', editingSection.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('homepage_content')
          .insert([editingSection]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingSection(null);
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section: ' + error.message);
    }
  };

  // Delete section
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase
        .from('homepage_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section: ' + error.message);
    }
  };

  // Toggle active status
  const handleToggleActive = async (section) => {
    try {
      const { error } = await supabase
        .from('homepage_content')
        .update({ is_active: !section.is_active })
        .eq('id', section.id);

      if (error) throw error;
      fetchSections();
    } catch (error) {
      console.error('Error toggling section:', error);
      alert('Error updating section: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading homepage sections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Homepage Manager</h2>
          <p className="text-text-secondary mt-1">Manage hero sections, CTAs, and content blocks</p>
        </div>
        <Button size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="grid gap-4">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-text-secondary">No sections yet. Click "Add Section" to create one.</p>
            </CardContent>
          </Card>
        ) : (
          sections.map((section) => (
            <Card key={section.id} className={!section.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {section.title}
                      <span className="text-xs font-normal px-2 py-1 bg-primary/10 rounded">
                        {section.section_type}
                      </span>
                      {!section.is_active && (
                        <span className="text-xs font-normal px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                    {section.subtitle && (
                      <p className="text-sm text-text-secondary mt-1">{section.subtitle}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                      variant={section.is_active ? 'outline' : 'default'}
                      onClick={() => handleToggleActive(section)}
                    >
                      {section.is_active ? 'Hide' : 'Show'}
                    </Button>
                    <Button size="icon" className="h-8 w-8 sm:h-9 sm:w-9 p-0" variant="outline" onClick={() => handleEdit(section)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" className="h-8 w-8 sm:h-9 sm:w-9 p-0" variant="destructive" onClick={() => handleDelete(section.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {section.description && (
                  <p className="text-sm text-text-secondary mb-2">{section.description}</p>
                )}
                {section.cta_text && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">CTA:</span>
                    <span className="text-primary">{section.cta_text}</span>
                    {section.cta_link && (
                      <span className="text-text-secondary">→ {section.cta_link}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-effect max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSection?.id ? 'Edit Section' : 'Create New Section'}</DialogTitle>
          </DialogHeader>

          {editingSection && (
            <div className="space-y-4">
              <div>
                <Label>Section Type</Label>
                <Select
                  value={editingSection.section_type}
                  onValueChange={(value) =>
                    setEditingSection({ ...editingSection, section_type: value })
                  }
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                    <SelectItem value="cta">Call to Action</SelectItem>
                    <SelectItem value="stats">Statistics</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={editingSection.title}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title: e.target.value })
                  }
                  placeholder="Section title"
                />
              </div>

              <div>
                <Label>Subtitle</Label>
                <Input
                  value={editingSection.subtitle || ''}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, subtitle: e.target.value })
                  }
                  placeholder="Section subtitle"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingSection.description || ''}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, description: e.target.value })
                  }
                  placeholder="Section description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CTA Button Text</Label>
                  <Input
                    value={editingSection.cta_text || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, cta_text: e.target.value })
                    }
                    placeholder="Get Started"
                  />
                </div>
                <div>
                  <Label>CTA Button Link</Label>
                  <Input
                    value={editingSection.cta_link || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, cta_link: e.target.value })
                    }
                    placeholder="/signup"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingSection.is_active}
                  onCheckedChange={(checked) =>
                    setEditingSection({ ...editingSection, is_active: checked })
                  }
                />
                <Label>Active (visible on website)</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm" variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageManager;

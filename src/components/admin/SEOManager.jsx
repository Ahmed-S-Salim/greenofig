import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Save, X, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const SEOManager = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch SEO settings
  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('page_path', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      alert('Error loading SEO settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Create new page SEO
  const handleCreate = () => {
    setEditingPage({
      page_path: '/',
      page_name: '',
      meta_title: '',
      meta_description: '',
      og_title: '',
      og_description: '',
      og_image_url: '',
      twitter_title: '',
      twitter_description: '',
      twitter_image_url: '',
      canonical_url: '',
      robots_meta: 'index,follow',
      sitemap_priority: 0.5,
      sitemap_changefreq: 'weekly',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  // Edit page SEO
  const handleEdit = (page) => {
    setEditingPage({ ...page });
    setIsDialogOpen(true);
  };

  // Save SEO settings
  const handleSave = async () => {
    try {
      if (!editingPage.page_path || !editingPage.page_name) {
        alert('Page path and name are required');
        return;
      }

      if (editingPage.id) {
        // Update existing
        const { error } = await supabase
          .from('seo_settings')
          .update({
            page_path: editingPage.page_path,
            page_name: editingPage.page_name,
            meta_title: editingPage.meta_title,
            meta_description: editingPage.meta_description,
            og_title: editingPage.og_title,
            og_description: editingPage.og_description,
            og_image_url: editingPage.og_image_url,
            twitter_title: editingPage.twitter_title,
            twitter_description: editingPage.twitter_description,
            twitter_image_url: editingPage.twitter_image_url,
            canonical_url: editingPage.canonical_url,
            robots_meta: editingPage.robots_meta,
            sitemap_priority: editingPage.sitemap_priority,
            sitemap_changefreq: editingPage.sitemap_changefreq,
            is_active: editingPage.is_active,
          })
          .eq('id', editingPage.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('seo_settings')
          .insert([editingPage]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingPage(null);
      fetchPages();
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      alert('Error saving SEO settings: ' + error.message);
    }
  };

  const handleChange = (field, value) => {
    setEditingPage({ ...editingPage, [field]: value });
  };

  if (loading) {
    return <div className="p-6">Loading SEO settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">SEO Settings Manager</h2>
          <p className="text-text-secondary mt-1">Manage meta tags and SEO for each page</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Page SEO
        </Button>
      </div>

      <div className="grid gap-4">
        {pages.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-text-secondary">No SEO settings yet. Click "Add Page SEO" to create one.</p>
            </CardContent>
          </Card>
        ) : (
          pages.map((page) => (
            <Card key={page.id} className={!page.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {page.page_name}
                      <span className="text-xs font-normal px-2 py-1 bg-primary/10 rounded">
                        {page.page_path}
                      </span>
                      {!page.is_active && (
                        <span className="text-xs font-normal px-2 py-1 bg-gray-500/10 text-gray-600 rounded">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                    {page.meta_description && (
                      <p className="text-sm text-text-secondary mt-1">{page.meta_description}</p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(page)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Meta Title:</span>
                    <p className="text-text-secondary">{page.meta_title || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Sitemap Priority:</span>
                    <p className="text-text-secondary">{page.sitemap_priority} ({page.sitemap_changefreq})</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-effect max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage?.id ? 'Edit SEO Settings' : 'Create New SEO Settings'}</DialogTitle>
          </DialogHeader>

          {editingPage && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Page Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Page Path *</Label>
                    <Input
                      value={editingPage.page_path}
                      onChange={(e) => handleChange('page_path', e.target.value)}
                      placeholder="/about"
                    />
                  </div>
                  <div>
                    <Label>Page Name *</Label>
                    <Input
                      value={editingPage.page_name}
                      onChange={(e) => handleChange('page_name', e.target.value)}
                      placeholder="About Page"
                    />
                  </div>
                </div>
              </div>

              {/* Meta Tags */}
              <div className="space-y-4">
                <h3 className="font-semibold">Meta Tags</h3>
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={editingPage.meta_title || ''}
                    onChange={(e) => handleChange('meta_title', e.target.value)}
                    placeholder="Page Title - Site Name"
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={editingPage.meta_description || ''}
                    onChange={(e) => handleChange('meta_description', e.target.value)}
                    placeholder="Brief description of the page (150-160 characters)"
                    rows={2}
                  />
                </div>
              </div>

              {/* Open Graph */}
              <div className="space-y-4">
                <h3 className="font-semibold">Open Graph (Facebook)</h3>
                <div>
                  <Label>OG Title</Label>
                  <Input
                    value={editingPage.og_title || ''}
                    onChange={(e) => handleChange('og_title', e.target.value)}
                    placeholder="Title for social media sharing"
                  />
                </div>
                <div>
                  <Label>OG Description</Label>
                  <Textarea
                    value={editingPage.og_description || ''}
                    onChange={(e) => handleChange('og_description', e.target.value)}
                    placeholder="Description for social media sharing"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>OG Image URL</Label>
                  <Input
                    type="url"
                    value={editingPage.og_image_url || ''}
                    onChange={(e) => handleChange('og_image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Twitter Card */}
              <div className="space-y-4">
                <h3 className="font-semibold">Twitter Card</h3>
                <div>
                  <Label>Twitter Title</Label>
                  <Input
                    value={editingPage.twitter_title || ''}
                    onChange={(e) => handleChange('twitter_title', e.target.value)}
                    placeholder="Title for Twitter"
                  />
                </div>
                <div>
                  <Label>Twitter Description</Label>
                  <Textarea
                    value={editingPage.twitter_description || ''}
                    onChange={(e) => handleChange('twitter_description', e.target.value)}
                    placeholder="Description for Twitter"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Twitter Image URL</Label>
                  <Input
                    type="url"
                    value={editingPage.twitter_image_url || ''}
                    onChange={(e) => handleChange('twitter_image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Advanced */}
              <div className="space-y-4">
                <h3 className="font-semibold">Advanced Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Canonical URL</Label>
                    <Input
                      type="url"
                      value={editingPage.canonical_url || ''}
                      onChange={(e) => handleChange('canonical_url', e.target.value)}
                      placeholder="https://example.com/page"
                    />
                  </div>
                  <div>
                    <Label>Robots Meta</Label>
                    <Input
                      value={editingPage.robots_meta}
                      onChange={(e) => handleChange('robots_meta', e.target.value)}
                      placeholder="index,follow"
                    />
                  </div>
                  <div>
                    <Label>Sitemap Priority (0.0-1.0)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={editingPage.sitemap_priority}
                      onChange={(e) => handleChange('sitemap_priority', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Change Frequency</Label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editingPage.sitemap_changefreq}
                      onChange={(e) => handleChange('sitemap_changefreq', e.target.value)}
                    >
                      <option value="always">Always</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPage.is_active}
                    onCheckedChange={(checked) => handleChange('is_active', checked)}
                  />
                  <Label>Active</Label>
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
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SEOManager;

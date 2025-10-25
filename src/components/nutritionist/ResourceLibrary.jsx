import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Share2,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Upload,
  X,
  FolderOpen,
  Clock,
  Tag,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const ResourceLibrary = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    resource_type: 'article',
    category: 'nutrition',
    url: '',
    file_url: '',
    tags: [],
    is_public: true
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    { value: 'all', label: 'All Resources', icon: FolderOpen },
    { value: 'nutrition', label: 'Nutrition', icon: BookOpen },
    { value: 'exercise', label: 'Exercise', icon: BookOpen },
    { value: 'wellness', label: 'Wellness', icon: BookOpen },
    { value: 'recipes', label: 'Recipes', icon: BookOpen },
    { value: 'guides', label: 'Guides', icon: FileText }
  ];

  const resourceTypes = [
    { value: 'article', label: 'Article', icon: FileText },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'pdf', label: 'PDF Document', icon: Download },
    { value: 'link', label: 'External Link', icon: LinkIcon }
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, selectedCategory]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('educational_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resources',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredResources(filtered);
  };

  const handleCreateResource = async () => {
    if (!formData.title || !formData.resource_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const resourceData = {
        ...formData,
        created_by: user?.id,
        view_count: 0
      };

      let result;
      if (selectedResource) {
        // Update existing resource
        const { data, error } = await supabase
          .from('educational_resources')
          .update(resourceData)
          .eq('id', selectedResource.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: 'Success',
          description: 'Resource updated successfully'
        });
      } else {
        // Create new resource
        const { data, error } = await supabase
          .from('educational_resources')
          .insert([resourceData])
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: 'Success',
          description: 'Resource created successfully'
        });
      }

      setShowCreateDialog(false);
      resetForm();
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resource',
        variant: 'destructive'
      });
    }
  };

  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      content: resource.content || '',
      resource_type: resource.resource_type,
      category: resource.category,
      url: resource.url || '',
      file_url: resource.file_url || '',
      tags: resource.tags || [],
      is_public: resource.is_public
    });
    setShowCreateDialog(true);
  };

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('educational_resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Resource deleted successfully'
      });

      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive'
      });
    }
  };

  const handleViewResource = async (resource) => {
    setSelectedResource(resource);
    setShowViewDialog(true);

    // Increment view count
    try {
      await supabase
        .from('educational_resources')
        .update({ view_count: (resource.view_count || 0) + 1 })
        .eq('id', resource.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleShareResource = async (resource) => {
    // Placeholder for share functionality
    toast({
      title: 'Share Link Copied',
      description: 'Resource link copied to clipboard'
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      resource_type: 'article',
      category: 'nutrition',
      url: '',
      file_url: '',
      tags: [],
      is_public: true
    });
    setSelectedResource(null);
  };

  const getResourceIcon = (type) => {
    const typeObj = resourceTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : FileText;
  };

  const getResourceColor = (type) => {
    const colors = {
      article: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      video: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      pdf: 'bg-red-500/10 text-red-600 dark:text-red-400',
      link: 'bg-green-500/10 text-green-600 dark:text-green-400'
    };
    return colors[type] || colors.article;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-foreground">Resource Library</h2>
          <p className="text-muted-foreground mt-1">
            Manage educational content and resources for clients
          </p>
        </div>

        <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </motion.div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground"
          />
        </div>

        <div className="flex gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.value)}
                className="whitespace-nowrap"
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-card rounded-xl border border-border"
        >
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Resources Found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first resource'}
          </p>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => {
            const Icon = getResourceIcon(resource.resource_type);
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Resource Header */}
                <div className={`p-4 ${getResourceColor(resource.resource_type)}`}>
                  <div className="flex items-start justify-between">
                    <Icon className="h-8 w-8" />
                    <Badge variant={resource.is_public ? 'default' : 'secondary'}>
                      {resource.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>

                {/* Resource Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                    {resource.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {resource.description || 'No description available'}
                  </p>

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(resource.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {resource.view_count || 0} views
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewResource(resource)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditResource(resource)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareResource(resource)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Resource Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResource ? 'Edit Resource' : 'Add New Resource'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Resource title"
              />
            </div>

            {/* Resource Type & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                <select
                  value={formData.resource_type}
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {resourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {categories.filter(c => c.value !== 'all').map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Brief description"
              />
            </div>

            {/* URL or File URL */}
            {(formData.resource_type === 'link' || formData.resource_type === 'video') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {formData.resource_type === 'pdf' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">File URL</label>
                <input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  placeholder="Upload file and paste URL"
                />
              </div>
            )}

            {/* Content (for articles) */}
            {formData.resource_type === 'article' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm"
                  placeholder="Write your article content here (supports Markdown)"
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  placeholder="Add a tag and press Enter"
                />
                <Button onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <Badge key={idx} className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_public" className="text-sm font-medium text-foreground">
                Make this resource public to all clients
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateResource}>
              {selectedResource ? 'Update' : 'Create'} Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Resource Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedResource && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2 text-foreground">
                      {selectedResource.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge>{selectedResource.resource_type}</Badge>
                      <Badge variant="outline">{selectedResource.category}</Badge>
                      <span>•</span>
                      <span>{format(new Date(selectedResource.created_at), 'MMMM dd, yyyy')}</span>
                      <span>•</span>
                      <span>{selectedResource.view_count || 0} views</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {selectedResource.description && (
                  <div>
                    <p className="text-muted-foreground">
                      {selectedResource.description}
                    </p>
                  </div>
                )}

                {selectedResource.tags && selectedResource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedResource.resource_type === 'article' && selectedResource.content && (
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-foreground">
                      {selectedResource.content}
                    </div>
                  </div>
                )}

                {selectedResource.resource_type === 'link' && selectedResource.url && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <a
                      href={selectedResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open External Link
                    </a>
                  </div>
                )}

                {selectedResource.resource_type === 'video' && selectedResource.url && (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <a
                      href={selectedResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Video className="h-6 w-6" />
                      Watch Video
                    </a>
                  </div>
                )}

                {selectedResource.resource_type === 'pdf' && selectedResource.file_url && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <a
                      href={selectedResource.file_url}
                      download
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => handleShareResource(selectedResource)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceLibrary;

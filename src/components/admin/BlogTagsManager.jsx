import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Tag, Folder, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';

const BlogTagsManager = () => {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('tag');

  // Form state
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [tagsRes, categoriesRes] = await Promise.all([
      supabase.from('blog_tags').select('*').order('name'),
      supabase.from('blog_categories').select('*').order('name')
    ]);

    if (tagsRes.data) setTags(tagsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Tag operations
  const openTagDialog = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
      setTagSlug(tag.slug);
    } else {
      setEditingTag(null);
      setTagName('');
      setTagSlug('');
    }
    setTagDialogOpen(true);
  };

  const saveTag = async () => {
    if (!tagName || !tagSlug) {
      toast({ title: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    const tagData = {
      name: tagName,
      slug: tagSlug
    };

    let error;
    if (editingTag) {
      const { error: updateError } = await supabase
        .from('blog_tags')
        .update(tagData)
        .eq('id', editingTag.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('blog_tags')
        .insert(tagData);
      error = insertError;
    }

    if (error) {
      toast({ title: 'Error saving tag', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Tag ${editingTag ? 'updated' : 'created'} successfully` });
      setTagDialogOpen(false);
      fetchData();
    }
  };

  const deleteTag = async (tagId) => {
    const { error } = await supabase
      .from('blog_tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      toast({ title: 'Error deleting tag', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Tag deleted successfully' });
      fetchData();
    }
    setDeleteDialogOpen(false);
  };

  // Category operations
  const openCategoryDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategorySlug(category.slug);
      setCategoryDescription(category.description || '');
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategorySlug('');
      setCategoryDescription('');
    }
    setCategoryDialogOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryName || !categorySlug) {
      toast({ title: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    const categoryData = {
      name: categoryName,
      slug: categorySlug,
      description: categoryDescription || null
    };

    let error;
    if (editingCategory) {
      const { error: updateError } = await supabase
        .from('blog_categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('blog_categories')
        .insert(categoryData);
      error = insertError;
    }

    if (error) {
      toast({ title: 'Error saving category', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Category ${editingCategory ? 'updated' : 'created'} successfully` });
      setCategoryDialogOpen(false);
      fetchData();
    }
  };

  const deleteCategory = async (categoryId) => {
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted successfully' });
      fetchData();
    }
    setDeleteDialogOpen(false);
  };

  const openDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tags & Categories</h2>
      </div>

      <Tabs defaultValue="tags" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Blog Tags ({tags.length})
                </CardTitle>
                <Button onClick={() => openTagDialog()}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Tag
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No tags yet. Create your first tag!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tags.map(tag => (
                    <Card key={tag.id} className="glass-effect">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{tag.name}</h3>
                            <p className="text-sm text-text-secondary">/{tag.slug}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openTagDialog(tag)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(tag, 'tag')}
                              className="text-red-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Blog Categories ({categories.length})
                </CardTitle>
                <Button onClick={() => openCategoryDialog()}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No categories yet. Create your first category!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(category => (
                    <Card key={category.id} className="glass-effect">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-text-secondary">/{category.slug}</p>
                            {category.description && (
                              <p className="text-sm text-text-secondary mt-2">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCategoryDialog(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(category, 'category')}
                              className="text-red-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tag Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="glass-effect">
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
            <DialogDescription>
              Add a tag to organize your blog posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name *</Label>
              <Input
                id="tag-name"
                placeholder="e.g., React, JavaScript"
                value={tagName}
                onChange={(e) => {
                  setTagName(e.target.value);
                  if (!editingTag) {
                    setTagSlug(generateSlug(e.target.value));
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-slug">Slug *</Label>
              <Input
                id="tag-slug"
                placeholder="e.g., react, javascript"
                value={tagSlug}
                onChange={(e) => setTagSlug(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTag}>
              {editingTag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="glass-effect">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
            <DialogDescription>
              Add a category to organize your blog posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name *</Label>
              <Input
                id="category-name"
                placeholder="e.g., Technology, Tutorials"
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  if (!editingCategory) {
                    setCategorySlug(generateSlug(e.target.value));
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug *</Label>
              <Input
                id="category-slug"
                placeholder="e.g., technology, tutorials"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                placeholder="Brief description of this category"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-effect">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the {deleteType} "{itemToDelete?.name}". This action cannot be undone.
              {deleteType === 'category' && ' Posts in this category will become uncategorized.'}
              {deleteType === 'tag' && ' This tag will be removed from all posts.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteType === 'tag' ? deleteTag(itemToDelete.id) : deleteCategory(itemToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default BlogTagsManager;

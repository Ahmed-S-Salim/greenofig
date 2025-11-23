import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ArrowLeftRight,
  Calendar,
  TrendingDown,
  Award,
  Eye,
  EyeOff,
  X,
  Grid3x3,
  LayoutGrid,
  Clock,
  ChevronLeft,
  ChevronRight,
  Share2,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';

const ProgressPhotos = ({ compact = false }) => {
  const [photos, setPhotos] = useState([]);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, comparison, grid
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [comparisonPhotos, setComparisonPhotos] = useState({ before: null, after: null });
  const [filterAngle, setFilterAngle] = useState('all'); // all, front, side, back
  const [sortBy, setSortBy] = useState('recent'); // recent, oldest
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    angle: 'front',
    notes: '',
    weight: '',
    visibility: 'private'
  });

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load progress photos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          angle: uploadForm.angle,
          notes: uploadForm.notes,
          weight: uploadForm.weight ? parseFloat(uploadForm.weight) : null,
          visibility: uploadForm.visibility
        });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Progress photo uploaded successfully'
      });

      setShowUploadDialog(false);
      setUploadForm({ angle: 'front', notes: '', weight: '', visibility: 'private' });
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload photo',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId, photoUrl) => {
    try {
      // Delete from storage
      const filePath = photoUrl.split('/').slice(-2).join('/');
      await supabase.storage
        .from('progress-photos')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Photo deleted successfully'
      });

      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete photo',
        variant: 'destructive'
      });
    }
  };

  const getFilteredPhotos = () => {
    let filtered = [...photos];

    // Filter by angle
    if (filterAngle !== 'all') {
      filtered = filtered.filter(p => p.angle === filterAngle);
    }

    // Sort
    if (sortBy === 'oldest') {
      filtered.reverse();
    }

    return filtered;
  };

  const getPhotosByAngle = (angle) => {
    return photos.filter(p => p.angle === angle).sort((a, b) =>
      new Date(a.taken_at) - new Date(b.taken_at)
    );
  };

  const getTransformationStats = () => {
    if (photos.length < 2) return null;

    const oldest = [...photos].sort((a, b) => new Date(a.taken_at) - new Date(b.taken_at))[0];
    const newest = photos[0];

    const daysDiff = Math.floor((new Date(newest.taken_at) - new Date(oldest.taken_at)) / (1000 * 60 * 60 * 24));
    const weightDiff = oldest.weight && newest.weight ? oldest.weight - newest.weight : null;

    return {
      totalPhotos: photos.length,
      daysDiff,
      weightDiff,
      startDate: oldest.taken_at,
      latestDate: newest.taken_at
    };
  };

  const stats = getTransformationStats();
  const filteredPhotos = getFilteredPhotos();

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Camera className="w-6 h-6 text-primary" />
                Progress Photos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {photos.length} photos • Track your transformation
              </p>
            </div>

            <Button
              onClick={() => setShowUploadDialog(true)}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </Button>
          </div>
        </CardHeader>

        {/* Stats Summary */}
        {stats && (
          <CardContent className="border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800">
                <ImageIcon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">{stats.totalPhotos}</p>
                <p className="text-xs text-muted-foreground">Total Photos</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800">
                <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-purple-600">{stats.daysDiff}</p>
                <p className="text-xs text-muted-foreground">Days Tracked</p>
              </div>

              {stats.weightDiff !== null && (
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800">
                  <TrendingDown className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">
                    {stats.weightDiff > 0 ? '-' : '+'}{Math.abs(stats.weightDiff).toFixed(1)}kg
                  </p>
                  <p className="text-xs text-muted-foreground">Weight Change</p>
                </div>
              )}

              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-200 dark:border-yellow-800">
                <Award className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-xl font-bold text-yellow-600">
                  {Math.floor(stats.daysDiff / 7)}
                </p>
                <p className="text-xs text-muted-foreground">Weeks Progress</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={filterAngle} onValueChange={setFilterAngle}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Angles</SelectItem>
                <SelectItem value="front">Front</SelectItem>
                <SelectItem value="side">Side</SelectItem>
                <SelectItem value="back">Back</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          {filteredPhotos.length === 0 ? (
            <Card className="glass-effect">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Camera className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                  Start your transformation journey by uploading your first progress photo
                </p>
                <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload First Photo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-effect overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      {/* Photo */}
                      <div className="relative w-full md:w-48 h-64 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
                        <img
                          src={photo.photo_url}
                          alt={`Progress ${new Date(photo.taken_at).toLocaleDateString()}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setSelectedPhoto(photo)}
                        />

                        {/* Angle Badge */}
                        <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
                          {photo.angle}
                        </Badge>

                        {/* Visibility Badge */}
                        {photo.visibility === 'private' && (
                          <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm gap-1">
                            <EyeOff className="w-3 h-3" />
                            Private
                          </Badge>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold">
                              {new Date(photo.taken_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor((new Date() - new Date(photo.taken_at)) / (1000 * 60 * 60 * 24))} days ago
                          </p>
                        </div>

                        {photo.weight && (
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-primary" />
                            <span className="text-sm">Weight: <strong>{photo.weight}kg</strong></span>
                          </div>
                        )}

                        {photo.notes && (
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm">{photo.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPhoto(photo)}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!comparisonPhotos.before) {
                                setComparisonPhotos({ ...comparisonPhotos, before: photo });
                              } else {
                                setComparisonPhotos({ ...comparisonPhotos, after: photo });
                                setShowComparisonDialog(true);
                              }
                            }}
                            className="gap-2"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            Compare
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePhoto(photo.id, photo.photo_url)}
                            className="gap-2 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Comparison View */}
        <TabsContent value="comparison">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Front Comparison */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge>Front</Badge>
                  </h3>
                  <ComparisonSlider
                    photos={getPhotosByAngle('front')}
                    onCompare={(before, after) => {
                      setComparisonPhotos({ before, after });
                      setShowComparisonDialog(true);
                    }}
                  />
                </div>

                {/* Side Comparison */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge>Side</Badge>
                  </h3>
                  <ComparisonSlider
                    photos={getPhotosByAngle('side')}
                    onCompare={(before, after) => {
                      setComparisonPhotos({ before, after });
                      setShowComparisonDialog(true);
                    }}
                  />
                </div>

                {/* Back Comparison */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge>Back</Badge>
                  </h3>
                  <ComparisonSlider
                    photos={getPhotosByAngle('back')}
                    onCompare={(before, after) => {
                      setComparisonPhotos({ before, after });
                      setShowComparisonDialog(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grid View */}
        <TabsContent value="grid">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.photo_url}
                  alt={`Progress ${new Date(photo.taken_at).toLocaleDateString()}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                  <p className="text-white text-sm font-semibold">
                    {new Date(photo.taken_at).toLocaleDateString()}
                  </p>
                  {photo.weight && (
                    <Badge className="bg-white/20 text-white">{photo.weight}kg</Badge>
                  )}
                </div>

                {/* Angle Badge */}
                <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
                  {photo.angle}
                </Badge>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Progress Photo</DialogTitle>
            <DialogDescription>
              Add a new photo to track your transformation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Angle</label>
              <Select value={uploadForm.angle} onValueChange={(value) => setUploadForm({ ...uploadForm, angle: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="side">Side</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Current Weight (kg) - Optional</label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 75.5"
                value={uploadForm.weight}
                onChange={(e) => setUploadForm({ ...uploadForm, weight: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes - Optional</label>
              <Input
                placeholder="How are you feeling today?"
                value={uploadForm.notes}
                onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Visibility</label>
              <Select value={uploadForm.visibility} onValueChange={(value) => setUploadForm({ ...uploadForm, visibility: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (Only You)</SelectItem>
                  <SelectItem value="nutritionist">Nutritionist Only</SelectItem>
                  <SelectItem value="public">Public (Community)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Select Photo
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {new Date(selectedPhoto.taken_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </DialogTitle>
                <DialogDescription>
                  {selectedPhoto.angle} view • {selectedPhoto.weight ? `${selectedPhoto.weight}kg` : 'Weight not recorded'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <img
                  src={selectedPhoto.photo_url}
                  alt="Progress photo"
                  className="w-full rounded-lg"
                />

                {selectedPhoto.notes && (
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedPhoto.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Before & After Comparison</DialogTitle>
            <DialogDescription>
              Track your transformation progress
            </DialogDescription>
          </DialogHeader>

          {comparisonPhotos.before && comparisonPhotos.after && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Before */}
                <div>
                  <Badge className="mb-2">Before</Badge>
                  <img
                    src={comparisonPhotos.before.photo_url}
                    alt="Before"
                    className="w-full rounded-lg"
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">
                      {new Date(comparisonPhotos.before.taken_at).toLocaleDateString()}
                    </p>
                    {comparisonPhotos.before.weight && (
                      <p className="text-sm text-muted-foreground">
                        Weight: {comparisonPhotos.before.weight}kg
                      </p>
                    )}
                  </div>
                </div>

                {/* After */}
                <div>
                  <Badge className="mb-2 bg-green-600">After</Badge>
                  <img
                    src={comparisonPhotos.after.photo_url}
                    alt="After"
                    className="w-full rounded-lg"
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">
                      {new Date(comparisonPhotos.after.taken_at).toLocaleDateString()}
                    </p>
                    {comparisonPhotos.after.weight && (
                      <p className="text-sm text-muted-foreground">
                        Weight: {comparisonPhotos.after.weight}kg
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {comparisonPhotos.before.weight && comparisonPhotos.after.weight && (
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Weight Change</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(comparisonPhotos.before.weight - comparisonPhotos.after.weight).toFixed(1)}kg
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Days</p>
                    <p className="text-2xl font-bold">
                      {Math.floor((new Date(comparisonPhotos.after.taken_at) - new Date(comparisonPhotos.before.taken_at)) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg per Week</p>
                    <p className="text-2xl font-bold text-primary">
                      {((comparisonPhotos.before.weight - comparisonPhotos.after.weight) /
                        Math.floor((new Date(comparisonPhotos.after.taken_at) - new Date(comparisonPhotos.before.taken_at)) / (1000 * 60 * 60 * 24 * 7))).toFixed(2)}kg
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Comparison Slider Component
const ComparisonSlider = ({ photos, onCompare }) => {
  const [selectedIndices, setSelectedIndices] = useState([0, photos.length - 1]);

  if (photos.length < 2) {
    return (
      <div className="text-center p-8 rounded-lg border-2 border-dashed">
        <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Upload at least 2 photos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
          <img
            src={photos[selectedIndices[0]].photo_url}
            alt="Before"
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 left-2 bg-background/80">Before</Badge>
        </div>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
          <img
            src={photos[selectedIndices[1]].photo_url}
            alt="After"
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 left-2 bg-green-600">After</Badge>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full gap-2"
        onClick={() => onCompare(photos[selectedIndices[0]], photos[selectedIndices[1]])}
      >
        <ArrowLeftRight className="w-4 h-4" />
        View Comparison
      </Button>
    </div>
  );
};

export default ProgressPhotos;

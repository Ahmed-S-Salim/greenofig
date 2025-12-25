import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Camera, Upload, Trash2, Calendar, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProgressPhotosGallery = () => {
  const { userProfile } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    photo_url: '',
    photo_type: 'front',
    weight_kg: '',
    body_fat_percentage: '',
    notes: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (userProfile?.id) {
      fetchProgressPhotos();
    }
  }, [userProfile?.id]);

  const fetchProgressPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('taken_at', { ascending: false });

      if (error) {
        console.error('Error fetching progress photos:', error);
        return;
      }

      setPhotos(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchProgressPhotos:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}/${Date.now()}.${fileExt}`;
      const filePath = `progress-photos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setNewPhoto(prev => ({ ...prev, photo_url: publicUrl }));
      setUploading(false);
      toast({
        title: '✅ Image Uploaded',
        description: 'Now fill in additional details',
      });
    } catch (error) {
      console.error('Error in handleFileUpload:', error);
      setUploading(false);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  const savePhoto = async () => {
    if (!newPhoto.photo_url) {
      toast({
        title: 'Error',
        description: 'Please upload a photo first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .insert({
          user_id: userProfile.id,
          photo_url: newPhoto.photo_url,
          photo_type: newPhoto.photo_type,
          weight_kg: newPhoto.weight_kg ? parseFloat(newPhoto.weight_kg) : null,
          body_fat_percentage: newPhoto.body_fat_percentage
            ? parseFloat(newPhoto.body_fat_percentage)
            : null,
          notes: newPhoto.notes || null,
          taken_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving photo:', error);
        toast({
          title: 'Error',
          description: 'Failed to save progress photo',
          variant: 'destructive',
        });
        return;
      }

      setPhotos(prev => [data, ...prev]);
      setNewPhoto({
        photo_url: '',
        photo_type: 'front',
        weight_kg: '',
        body_fat_percentage: '',
        notes: '',
      });
      setShowUploadDialog(false);
      toast({
        title: '📸 Progress Photo Saved!',
        description: 'Your progress has been documented',
      });
    } catch (error) {
      console.error('Error in savePhoto:', error);
    }
  };

  const deletePhoto = async (photoId, photoUrl) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) {
        console.error('Error deleting photo from database:', dbError);
        toast({
          title: 'Error',
          description: 'Failed to delete photo',
          variant: 'destructive',
        });
        return;
      }

      // Extract file path from URL and delete from storage
      try {
        const urlParts = photoUrl.split('/user-uploads/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('user-uploads').remove([filePath]);
        }
      } catch (storageError) {
        console.warn('Could not delete from storage:', storageError);
      }

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast({
        title: 'Photo Deleted',
        description: 'Progress photo has been removed',
      });
    } catch (error) {
      console.error('Error in deletePhoto:', error);
    }
  };

  const groupPhotosByDate = () => {
    const grouped = {};
    photos.forEach(photo => {
      const date = new Date(photo.taken_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(photo);
    });
    return grouped;
  };

  const photosByDate = groupPhotosByDate();

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Progress Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Progress Photos
          </CardTitle>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Progress Photo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {/* File Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {newPhoto.photo_url ? (
                    <div className="relative">
                      <img
                        src={newPhoto.photo_url}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewPhoto(prev => ({ ...prev, photo_url: '' }))}
                        className="mt-2"
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="text-sm font-medium mb-1">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-xs text-muted-foreground">
                          PNG, JPG up to 5MB
                        </div>
                      </Label>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      {uploading && (
                        <div className="mt-2 text-sm text-primary">Uploading...</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Photo Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo-type">Photo Type</Label>
                    <Select
                      value={newPhoto.photo_type}
                      onValueChange={(value) =>
                        setNewPhoto(prev => ({ ...prev, photo_type: value }))
                      }
                    >
                      <SelectTrigger id="photo-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="front">Front</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                        <SelectItem value="side">Side</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 75.5"
                      value={newPhoto.weight_kg}
                      onChange={(e) =>
                        setNewPhoto(prev => ({ ...prev, weight_kg: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body-fat">Body Fat % (Optional)</Label>
                  <Input
                    id="body-fat"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 18.5"
                    value={newPhoto.body_fat_percentage}
                    onChange={(e) =>
                      setNewPhoto(prev => ({
                        ...prev,
                        body_fat_percentage: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="How are you feeling? Any milestones?"
                    value={newPhoto.notes}
                    onChange={(e) =>
                      setNewPhoto(prev => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>

                <Button
                  onClick={savePhoto}
                  disabled={!newPhoto.photo_url || uploading}
                  className="w-full"
                >
                  Save Progress Photo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {photos.length} photo{photos.length !== 1 ? 's' : ''} in your gallery
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">No progress photos yet</p>
            <p className="text-xs">
              Start documenting your journey by uploading your first photo!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {Object.entries(photosByDate).map(([date, datePhotos]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">{date}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {datePhotos.map((photo, index) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage(photo)}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img
                            src={photo.photo_url}
                            alt={`Progress photo - ${photo.photo_type}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center text-white text-xs p-2">
                          <div className="font-semibold capitalize mb-1">
                            {photo.photo_type}
                          </div>
                          {photo.weight_kg && (
                            <div className="mb-1">{photo.weight_kg} kg</div>
                          )}
                          {photo.body_fat_percentage && (
                            <div>{photo.body_fat_percentage}% BF</div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto(photo.id, photo.photo_url);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>

      {/* Image Viewer Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="capitalize">
                {selectedImage.photo_type} - {new Date(selectedImage.taken_at).toLocaleDateString()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedImage.photo_url}
                alt="Progress photo"
                className="w-full rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedImage.weight_kg && (
                  <div>
                    <div className="text-muted-foreground">Weight</div>
                    <div className="font-semibold">{selectedImage.weight_kg} kg</div>
                  </div>
                )}
                {selectedImage.body_fat_percentage && (
                  <div>
                    <div className="text-muted-foreground">Body Fat</div>
                    <div className="font-semibold">{selectedImage.body_fat_percentage}%</div>
                  </div>
                )}
              </div>
              {selectedImage.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <p className="text-sm">{selectedImage.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default ProgressPhotosGallery;

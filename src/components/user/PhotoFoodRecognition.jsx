import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

/**
 * Photo Food Recognition Component
 * Elite Tier Feature - AI-powered food identification and nutritional analysis
 *
 * Uses OpenAI Vision API to:
 * 1. Identify food items from photos
 * 2. Estimate portion sizes
 * 3. Calculate nutritional information
 * 4. Automatically log meals
 */
const PhotoFoodRecognition = () => {
  const { userProfile } = useAuth();
  const { hasAccess } = useFeatureAccess();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Check if user has access to this Elite feature
  const hasPhotoRecognition = hasAccess('photoRecognition');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFoodImage = async () => {
    if (!selectedImage) {
      toast({
        title: 'No Image Selected',
        description: 'Please select or capture a photo first',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      // Convert image to base64
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(selectedImage);
      });

      // Call Edge Function for food recognition
      const { data, error } = await supabase.functions.invoke('analyze-food-photo', {
        body: { image: base64Image },
      });

      if (error) throw error;

      setResult(data);

      toast({
        title: 'Analysis Complete!',
        description: `Detected: ${data.foodItems.map(f => f.name).join(', ')}`,
      });

    } catch (error) {
      console.error('Food recognition error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Unable to analyze the food image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const logMealFromAnalysis = async () => {
    if (!result) return;

    try {
      // Calculate total nutrition
      const totalNutrition = result.foodItems.reduce((acc, item) => ({
        calories: acc.calories + item.nutrition.calories,
        protein: acc.protein + item.nutrition.protein,
        carbs: acc.carbs + item.nutrition.carbs,
        fats: acc.fats + item.nutrition.fats,
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

      // Log meal
      const { error } = await supabase
        .from('daily_metrics')
        .upsert({
          user_id: userProfile.id,
          date: new Date().toISOString().split('T')[0],
          meals: result.foodItems.map(item => ({
            name: item.name,
            portion: item.portion,
            calories: item.nutrition.calories,
            protein: item.nutrition.protein,
            carbs: item.nutrition.carbs,
            fats: item.nutrition.fats,
            photo_url: preview,
            logged_at: new Date().toISOString(),
          })),
          calories_consumed: totalNutrition.calories,
          protein_g: totalNutrition.protein,
          carbs_g: totalNutrition.carbs,
          fats_g: totalNutrition.fats,
        }, {
          onConflict: 'user_id,date',
        });

      if (error) throw error;

      toast({
        title: 'Meal Logged Successfully!',
        description: `Added ${totalNutrition.calories} calories to your daily intake`,
      });

      // Reset form
      setSelectedImage(null);
      setPreview(null);
      setResult(null);

    } catch (error) {
      console.error('Meal logging error:', error);
      toast({
        title: 'Logging Failed',
        description: error.message || 'Unable to log the meal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!hasPhotoRecognition) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photo Food Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Elite Feature</h3>
            <p className="text-text-secondary mb-4">
              Photo food recognition is available for Elite plan subscribers.
              Upgrade to instantly log meals by taking photos!
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade to Elite
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          📸 AI Photo Food Recognition
        </CardTitle>
        <p className="text-sm text-text-secondary">
          Snap a photo of your meal and let AI identify and log it automatically
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Buttons */}
        {!preview && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="h-8 w-8" />
              <span>Take Photo</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8" />
              <span>Upload Photo</span>
            </Button>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Image Preview */}
        {preview && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Food preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPreview(null);
                  setSelectedImage(null);
                  setResult(null);
                }}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>

            {/* Analyze Button */}
            {!result && (
              <Button
                onClick={analyzeFoodImage}
                disabled={analyzing}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Food...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Analyze Food
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Analysis Results */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Food Detected!</span>
            </div>

            <div className="space-y-3">
              {result.foodItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-background/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-text-secondary">
                        Portion: {item.portion}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {item.nutrition.calories} cal
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-text-secondary">Protein: </span>
                      <span className="font-medium">{item.nutrition.protein}g</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Carbs: </span>
                      <span className="font-medium">{item.nutrition.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Fats: </span>
                      <span className="font-medium">{item.nutrition.fats}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Log Meal Button */}
            <div className="flex gap-2">
              <Button
                onClick={logMealFromAnalysis}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Log This Meal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  setSelectedImage(null);
                  setResult(null);
                }}
              >
                Cancel
              </Button>
            </div>

            {result.confidence && (
              <p className="text-xs text-text-secondary text-center">
                Confidence: {Math.round(result.confidence * 100)}%
              </p>
            )}
          </div>
        )}

        {/* Tips */}
        {!preview && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-text-secondary">
              <strong>💡 Tips for best results:</strong>
              <br />• Take photos in good lighting
              <br />• Show the entire meal clearly
              <br />• Include common utensils for size reference
              <br />• Avoid blurry or dark images
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoFoodRecognition;

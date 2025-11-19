import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Camera, Scan, X, Check, Search, Plus } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Barcode Scanner Component
 * Scans food product barcodes and fetches nutritional data from Open Food Facts API
 * Available in ALL tiers (matching MyFitnessPal's free tier offering)
 */
const BarcodeScanner = ({ onFoodAdded }) => {
  const { userProfile } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    // Initialize barcode reader
    codeReaderRef.current = new BrowserMultiFormatReader();

    return () => {
      // Cleanup on unmount
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setScannedProduct(null);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      setCameraPermission('granted');
      setScanning(true);

      // Start scanning
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Use the first available camera (or back camera if available)
      const selectedDeviceId = videoInputDevices[0].deviceId;

      codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, error) => {
          if (result) {
            // Barcode detected!
            const barcode = result.getText();
            console.log('Barcode detected:', barcode);

            // Stop scanning
            stopScanning();

            // Fetch product data
            await fetchProductData(barcode);
          }
        }
      );

    } catch (err) {
      console.error('Camera error:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to start camera: ' + err.message);
      }

      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  const fetchProductData = async (barcode) => {
    setLoading(true);

    try {
      // Fetch from Open Food Facts API (free, 2.3M+ products worldwide)
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 0 || !data.product) {
        setError(`Product not found for barcode: ${barcode}. Try entering manually.`);
        setLoading(false);
        return;
      }

      const product = data.product;

      // Extract nutritional data
      const nutritionalData = {
        barcode: barcode,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        quantity: product.quantity || '',
        servingSize: product.serving_size || '100g',
        imageUrl: product.image_url || product.image_front_url || null,

        // Nutrition per 100g (standardized)
        nutrition: {
          calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0,
          protein: product.nutriments?.proteins_100g || product.nutriments?.proteins || 0,
          carbs: product.nutriments?.carbohydrates_100g || product.nutriments?.carbohydrates || 0,
          fats: product.nutriments?.fat_100g || product.nutriments?.fat || 0,
          fiber: product.nutriments?.fiber_100g || product.nutriments?.fiber || 0,
          sugar: product.nutriments?.sugars_100g || product.nutriments?.sugars || 0,
          sodium: product.nutriments?.sodium_100g || product.nutriments?.sodium || 0,
        },

        // Additional info
        categories: product.categories_tags || [],
        labels: product.labels_tags || [],
        ingredients: product.ingredients_text || '',
        nutriScore: product.nutrition_grades || null, // A, B, C, D, E
        novaGroup: product.nova_group || null, // 1-4 (food processing level)
      };

      setScannedProduct(nutritionalData);

      toast({
        title: 'Product Found!',
        description: `${nutritionalData.name} by ${nutritionalData.brand}`,
      });

    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToMealLog = async () => {
    if (!scannedProduct || !userProfile?.id) return;

    try {
      // Save scanned product to user's meal log
      const { data, error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: userProfile.id,
          food_name: scannedProduct.name,
          brand: scannedProduct.brand,
          barcode: scannedProduct.barcode,
          serving_size: scannedProduct.servingSize,
          calories: scannedProduct.nutrition.calories,
          protein: scannedProduct.nutrition.protein,
          carbs: scannedProduct.nutrition.carbs,
          fats: scannedProduct.nutrition.fats,
          fiber: scannedProduct.nutrition.fiber,
          meal_type: 'snack', // Default, user can change later
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Added to Meal Log!',
        description: `${scannedProduct.name} logged successfully`,
      });

      // Callback to parent component
      if (onFoodAdded) {
        onFoodAdded(data);
      }

      // Reset
      setScannedProduct(null);

    } catch (err) {
      console.error('Error adding to meal log:', err);
      toast({
        title: 'Error',
        description: 'Failed to add to meal log',
        variant: 'destructive',
      });
    }
  };

  const getNutriScoreColor = (score) => {
    const colors = {
      'a': 'bg-green-500',
      'b': 'bg-lime-500',
      'c': 'bg-yellow-500',
      'd': 'bg-orange-500',
      'e': 'bg-red-500',
    };
    return colors[score?.toLowerCase()] || 'bg-gray-500';
  };

  const getNovaGroupLabel = (group) => {
    const labels = {
      1: 'Unprocessed',
      2: 'Processed',
      3: 'Ultra-Processed',
      4: 'Ultra-Processed',
    };
    return labels[group] || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Barcode Scanner
          </CardTitle>
          <CardDescription>
            Scan any food product barcode to instantly get nutritional information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Permission Alert */}
          {cameraPermission === 'denied' && (
            <Alert variant="destructive">
              <AlertDescription>
                Camera access is required to scan barcodes. Please enable camera permissions in your browser settings.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Scanner Controls */}
          <div className="flex gap-2">
            {!scanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive" className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Stop Scanning
              </Button>
            )}
          </div>

          {/* Video Preview */}
          {scanning && (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-48 border-4 border-primary rounded-lg animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  <Scan className="mr-2 h-3 w-3" />
                  Scanning for barcode...
                </Badge>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-text-secondary">Fetching product data...</p>
            </div>
          )}

          {/* Scanned Product Display */}
          {scannedProduct && !loading && (
            <Card className="bg-background/50">
              <CardContent className="pt-6 space-y-4">
                {/* Product Image & Name */}
                <div className="flex gap-4">
                  {scannedProduct.imageUrl && (
                    <img
                      src={scannedProduct.imageUrl}
                      alt={scannedProduct.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{scannedProduct.name}</h3>
                    {scannedProduct.brand && (
                      <p className="text-sm text-text-secondary">{scannedProduct.brand}</p>
                    )}
                    {scannedProduct.quantity && (
                      <p className="text-xs text-text-secondary mt-1">{scannedProduct.quantity}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {scannedProduct.nutriScore && (
                        <Badge className={getNutriScoreColor(scannedProduct.nutriScore)}>
                          Nutri-Score: {scannedProduct.nutriScore.toUpperCase()}
                        </Badge>
                      )}
                      {scannedProduct.novaGroup && (
                        <Badge variant="outline">
                          {getNovaGroupLabel(scannedProduct.novaGroup)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nutritional Information */}
                <div>
                  <h4 className="font-semibold mb-2">Nutrition per {scannedProduct.servingSize}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-text-secondary">Calories</p>
                      <p className="text-lg font-semibold">{Math.round(scannedProduct.nutrition.calories)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-text-secondary">Protein</p>
                      <p className="text-lg font-semibold">{scannedProduct.nutrition.protein.toFixed(1)}g</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-text-secondary">Carbs</p>
                      <p className="text-lg font-semibold">{scannedProduct.nutrition.carbs.toFixed(1)}g</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-text-secondary">Fats</p>
                      <p className="text-lg font-semibold">{scannedProduct.nutrition.fats.toFixed(1)}g</p>
                    </div>
                  </div>
                </div>

                {/* Additional Nutrition */}
                {(scannedProduct.nutrition.fiber > 0 || scannedProduct.nutrition.sugar > 0) && (
                  <div className="grid grid-cols-2 gap-3">
                    {scannedProduct.nutrition.fiber > 0 && (
                      <div className="p-2 rounded bg-background/30">
                        <p className="text-xs text-text-secondary">Fiber</p>
                        <p className="font-semibold">{scannedProduct.nutrition.fiber.toFixed(1)}g</p>
                      </div>
                    )}
                    {scannedProduct.nutrition.sugar > 0 && (
                      <div className="p-2 rounded bg-background/30">
                        <p className="text-xs text-text-secondary">Sugar</p>
                        <p className="font-semibold">{scannedProduct.nutrition.sugar.toFixed(1)}g</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={addToMealLog} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Meal Log
                  </Button>
                  <Button onClick={() => setScannedProduct(null)} variant="outline">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Box */}
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              <strong>Powered by Open Food Facts</strong> - A collaborative, free and open database of food products from around the world (2.3M+ products).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Dna, Upload, Download, AlertCircle, CheckCircle, TrendingUp, Apple, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const DnaAnalysisPanel = () => {
  const { userProfile } = useAuth();
  const [dnaData, setDnaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchDnaAnalysis();
    }
  }, [userProfile?.id]);

  const fetchDnaAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('dna_analysis')
        .select('*')
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching DNA analysis:', error);
        return;
      }

      setDnaData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchDnaAnalysis:', error);
      setLoading(false);
    }
  };

  const handleUploadDnaData = () => {
    toast({
      title: 'Coming Soon!',
      description: 'DNA upload integration with 23andMe, AncestryDNA, and MyHeritage is coming soon.',
    });
  };

  if (loading) {
    return (
      <Card className="glass-effect border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-purple-500" />
            DNA-Based Nutrition Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-purple-500" />
            DNA-Based Nutrition Analysis
          </CardTitle>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
            Elite Feature
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Get personalized nutrition recommendations based on your genetic profile
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!dnaData ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center"
            >
              <Dna className="w-10 h-10 text-purple-500" />
            </motion.div>
            <h3 className="font-semibold mb-2">No DNA Analysis Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your DNA data from 23andMe, AncestryDNA, or MyHeritage to get started
            </p>
            <div className="space-y-2">
              <Button onClick={handleUploadDnaData} className="gap-2">
                <Upload className="w-4 h-4" />
                Upload DNA Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Your data is encrypted and never shared
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analysis Status */}
            <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-green-400">Analysis Complete</div>
                <div className="text-xs text-green-300/80">
                  Uploaded {new Date(dnaData.upload_date).toLocaleDateString()} •
                  Provider: {dnaData.test_provider}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleUploadDnaData}>
                <Upload className="w-4 h-4 mr-2" />
                Re-upload
              </Button>
            </div>

            {/* Metabolism Type */}
            {dnaData.metabolism_type && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Metabolism Type
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-lg font-semibold capitalize mb-1">
                      {dnaData.metabolism_type}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your body processes nutrients at a {dnaData.metabolism_type} rate
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Optimal Macros */}
            {dnaData.optimal_macros && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Optimal Macro Distribution
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(dnaData.optimal_macros).map(([macro, value]) => (
                    <Card key={macro}>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {value}%
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {macro}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Food Sensitivities */}
            {dnaData.food_sensitivities && dnaData.food_sensitivities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Genetic Food Sensitivities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dnaData.food_sensitivities.map((food, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-orange-500/10 text-orange-400 border-orange-500/30"
                    >
                      {food}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Consider limiting or avoiding these foods based on your genetic markers
                </p>
              </div>
            )}

            {/* Vitamin Recommendations */}
            {dnaData.vitamin_recommendations && Object.keys(dnaData.vitamin_recommendations).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Apple className="w-4 h-4 text-green-500" />
                  Personalized Vitamin Needs
                </h3>
                <div className="space-y-2">
                  {Object.entries(dnaData.vitamin_recommendations).map(([vitamin, recommendation]) => (
                    <div
                      key={vitamin}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{vitamin}</div>
                        <div className="text-xs text-muted-foreground">
                          {recommendation.reason || 'Genetically indicated'}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {recommendation.dosage || 'Recommended'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Report */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Download Full Report
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Dna className="w-4 h-4" />
                View Detailed Analysis
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              This analysis is for informational purposes only. Always consult with a healthcare
              professional before making significant dietary changes.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DnaAnalysisPanel;

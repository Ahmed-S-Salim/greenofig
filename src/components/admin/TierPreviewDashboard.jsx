import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCog, Eye, AlertCircle } from 'lucide-react';
import UserDashboardPreview from './UserDashboardPreview';

const TierPreviewDashboard = ({ user }) => {
  const [selectedTier, setSelectedTier] = useState('free');
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'comparison'

  // Tier definitions with colors and descriptions
  const tiers = [
    {
      id: 'free',
      name: 'Free',
      color: 'bg-gray-500',
      description: 'Basic features with ads',
      features: ['Ad-supported', 'Limited meal plans', 'Basic tracking']
    },
    {
      id: 'premium',
      name: 'Premium',
      color: 'bg-blue-500',
      description: 'Ad-free + 9 premium features',
      features: ['No ads', 'Recipe database', 'Macro tracking', 'Exercise library', 'Goal tracking', 'Health streaks', 'Custom notifications']
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      color: 'bg-purple-500',
      description: 'All Premium + 6 ultimate features',
      features: ['All Premium (9)', 'Advanced analytics', 'Progress reports', 'Workout analytics', 'Data export', 'Wearable sync', 'Nutritionist chat']
    },
    {
      id: 'elite',
      name: 'Elite',
      color: 'bg-amber-500',
      description: 'Complete suite - All 18 features',
      features: ['All Premium (9)', 'All Ultimate (6)', 'Photo recognition', 'Doctor consultations', 'Appointment scheduling']
    }
  ];

  const currentTier = tiers.find(t => t.id === selectedTier);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Tier Preview Dashboard</CardTitle>
              <CardDescription>
                Preview user dashboard experience for each subscription tier with demo data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Important Notice */}
      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Privacy-Safe Preview Mode
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This preview uses <strong>mock/demo data only</strong>. No real user data is accessed or displayed.
                You're viewing the exact UI/UX that users of each tier would see, but with sample data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Subscription Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map(tier => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${selectedTier === tier.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={`${tier.color} text-white`}>
                      {tier.name}
                    </Badge>
                    {selectedTier === tier.id && (
                      <Eye className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-medium">{tier.description}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tier.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>

          {/* Currently Viewing */}
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="font-medium">Currently Viewing:</span>
              <Badge className={`${currentTier.color} text-white`}>
                {currentTier.name.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Container */}
      <div className="border-4 border-amber-500 rounded-xl overflow-hidden">
        {/* Preview Header */}
        <div className="bg-amber-500 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">PREVIEW MODE - DEMO DATA</p>
              <p className="text-xs opacity-90">
                Viewing {currentTier.name} tier dashboard with sample data
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white text-amber-700 font-bold">
            {currentTier.name.toUpperCase()}
          </Badge>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-background relative">
          {/* Watermark overlay */}
          <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-9xl font-bold text-amber-500/5 transform rotate-[-45deg]">
              PREVIEW
            </div>
          </div>

          {/* Actual Preview */}
          <UserDashboardPreview tier={selectedTier} />
        </div>
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature Availability by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Feature</th>
                  {tiers.map(tier => (
                    <th key={tier.id} className="text-center p-2">
                      <Badge className={`${tier.color} text-white text-xs`}>
                        {tier.name}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  // Core Features
                  { name: 'Basic Tracking', free: true, premium: true, ultimate: true, elite: true },
                  { name: 'Meal Plans', free: 'Limited', premium: true, ultimate: true, elite: true },
                  { name: 'Workout Plans', free: 'Limited', premium: true, ultimate: true, elite: true },
                  { name: 'Ad-Free Experience', free: false, premium: true, ultimate: true, elite: true },

                  // Premium Features (7 new features)
                  { name: 'Recipe Database', free: false, premium: true, ultimate: true, elite: true },
                  { name: 'Macro Tracking', free: false, premium: true, ultimate: true, elite: true },
                  { name: 'Exercise Library', free: false, premium: true, ultimate: true, elite: true },
                  { name: 'Goal Tracking', free: false, premium: true, ultimate: true, elite: true },
                  { name: 'Health Streaks', free: false, premium: true, ultimate: true, elite: true },
                  { name: 'Custom Notifications', free: false, premium: true, ultimate: true, elite: true },
                  { name: 'Motivational Support', free: false, premium: true, ultimate: true, elite: true },
                  { name: 'Barcode Scanner', free: false, premium: true, ultimate: true, elite: true },
                  { name: 'Food Database Search', free: false, premium: true, ultimate: true, elite: true },

                  // Ultimate Features (4 new features)
                  { name: 'Advanced Analytics', free: false, premium: false, ultimate: true, elite: true },
                  { name: 'Progress Reports', free: false, premium: false, ultimate: true, elite: true },
                  { name: 'Workout Analytics', free: false, premium: false, ultimate: true, elite: true },
                  { name: 'Data Export', free: false, premium: false, ultimate: true, elite: true },
                  { name: 'Wearable Device Sync', free: false, premium: false, ultimate: true, elite: true },
                  { name: 'Nutritionist Messaging', free: false, premium: false, ultimate: true, elite: true },

                  // Elite Features (2 new features)
                  { name: 'Doctor Consultations', free: false, premium: false, ultimate: false, elite: true },
                  { name: 'Appointment Scheduling', free: false, premium: false, ultimate: false, elite: true },
                  { name: 'Photo Food Recognition', free: false, premium: false, ultimate: false, elite: true },
                ].map((feature, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium">{feature.name}</td>
                    {tiers.map(tier => (
                      <td key={tier.id} className="text-center p-2">
                        {typeof feature[tier.id] === 'boolean' ? (
                          feature[tier.id] ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-red-400">✗</span>
                          )
                        ) : (
                          <span className="text-amber-600 text-xs">{feature[tier.id]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TierPreviewDashboard;

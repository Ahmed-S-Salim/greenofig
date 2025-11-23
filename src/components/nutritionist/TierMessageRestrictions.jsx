import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, MessageSquare, Video, Zap, Crown, AlertCircle } from 'lucide-react';

/**
 * TierMessageRestrictions Component
 *
 * Displays tier-based messaging restrictions and enforces limits
 *
 * Tier Rules:
 * - Base: Delayed responses (24-48hr), limited to 5 messages/week
 * - Premium: 24-48hr response time, 20 messages/week
 * - Elite: Real-time messaging, unlimited messages, video calls
 */

const TierMessageRestrictions = ({ tier, messagesThisWeek = 0, children }) => {
  const tierLimits = {
    Base: {
      maxMessages: 5,
      responseTime: '24-48 hours',
      features: ['Basic messaging', 'Email notifications'],
      icon: MessageSquare,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    Premium: {
      maxMessages: 20,
      responseTime: '24-48 hours',
      features: ['Priority messaging', 'Push notifications', 'Message templates'],
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    Elite: {
      maxMessages: Infinity,
      responseTime: 'Real-time',
      features: ['Unlimited messaging', 'Real-time chat', 'Video consultations', 'Priority support'],
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  };

  const currentTier = tierLimits[tier] || tierLimits.Base;
  const Icon = currentTier.icon;
  const remainingMessages = currentTier.maxMessages - messagesThisWeek;
  const isLimitReached = remainingMessages <= 0 && currentTier.maxMessages !== Infinity;

  return (
    <div className="space-y-4">
      {/* Tier Info Card */}
      <Card className={currentTier.bgColor}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon className={`w-6 h-6 ${currentTier.color}`} />
              <div>
                <h3 className="font-semibold">{tier} Tier Messaging</h3>
                <p className="text-sm text-text-secondary">
                  Response time: {currentTier.responseTime}
                </p>
              </div>
            </div>
            <Badge variant={tier === 'Elite' ? 'default' : 'outline'}>{tier}</Badge>
          </div>

          {/* Message Limit Display */}
          {currentTier.maxMessages !== Infinity && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-secondary">Messages this week</span>
                <span className="font-semibold">
                  {messagesThisWeek} / {currentTier.maxMessages}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isLimitReached ? 'bg-red-500' : currentTier.color.replace('text', 'bg')
                  }`}
                  style={{ width: `${Math.min((messagesThisWeek / currentTier.maxMessages) * 100, 100)}%` }}
                ></div>
              </div>
              {remainingMessages <= 2 && remainingMessages > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ Only {remainingMessages} messages remaining this week
                </p>
              )}
            </div>
          )}

          {/* Features List */}
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-2">Available Features:</p>
            <div className="flex flex-wrap gap-2">
              {currentTier.features.map((feature, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limit Reached Alert */}
      {isLimitReached && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            You've reached your message limit for this week.
            <a href="/app/billing" className="underline ml-1">
              Upgrade to {tier === 'Base' ? 'Premium' : 'Elite'}
            </a> for more messages.
          </AlertDescription>
        </Alert>
      )}

      {/* Render children (messaging interface) */}
      <div className={isLimitReached ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};

export default TierMessageRestrictions;

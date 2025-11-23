import React from 'react';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Video,
  FileText,
  Calendar,
  TrendingUp,
  Utensils,
  Dumbbell,
  Mail,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TierBasedActions = ({ client, onAction }) => {
  const tier = client.tier || 'Base';

  const handleAction = (actionType, requiresTier) => {
    if (!canPerformAction(tier, requiresTier)) {
      toast({
        title: 'Upgrade Required',
        description: `This feature requires the client to be on ${requiresTier} tier or higher.`,
        variant: 'destructive',
      });
      return;
    }

    onAction && onAction(actionType, client);
  };

  const canPerformAction = (clientTier, requiredTier) => {
    const tierHierarchy = { Base: 1, Premium: 2, Elite: 3 };
    return tierHierarchy[clientTier] >= tierHierarchy[requiredTier];
  };

  const ActionButton = ({ icon: Icon, label, onClick, disabled, variant = 'outline' }) => (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="w-full justify-start"
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Basic Actions</h4>
        <div className="space-y-2">
          <ActionButton
            icon={Mail}
            label="Send Message"
            onClick={() => handleAction('message', 'Base')}
          />
          <ActionButton
            icon={FileText}
            label="View Meal Logs"
            onClick={() => handleAction('viewMealLogs', 'Base')}
          />
        </div>
      </div>

      {canPerformAction(tier, 'Premium') && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Premium Actions</h4>
          <div className="space-y-2">
            <ActionButton
              icon={Utensils}
              label="Create Meal Plan"
              onClick={() => handleAction('createMealPlan', 'Premium')}
              variant="default"
            />
            <ActionButton
              icon={Calendar}
              label="Schedule Check-in"
              onClick={() => handleAction('scheduleCheckin', 'Premium')}
              variant="default"
            />
            <ActionButton
              icon={TrendingUp}
              label="View Progress Charts"
              onClick={() => handleAction('viewProgress', 'Premium')}
              variant="default"
            />
            <ActionButton
              icon={MessageSquare}
              label="Send Quick Response"
              onClick={() => handleAction('quickMessage', 'Premium')}
              variant="default"
            />
          </div>
        </div>
      )}

      {canPerformAction(tier, 'Elite') && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-1">
            Elite Actions
            <span className="text-xs text-yellow-600 dark:text-yellow-400">(Priority)</span>
          </h4>
          <div className="space-y-2">
            <ActionButton
              icon={Video}
              label="Schedule Video Call"
              onClick={() => handleAction('scheduleVideo', 'Elite')}
              variant="default"
            />
            <ActionButton
              icon={Dumbbell}
              label="Create Workout Plan"
              onClick={() => handleAction('createWorkout', 'Elite')}
              variant="default"
            />
            <ActionButton
              icon={MessageSquare}
              label="Real-time Chat"
              onClick={() => handleAction('realtimeChat', 'Elite')}
              variant="default"
            />
            <ActionButton
              icon={CheckCircle2}
              label="Generate Report"
              onClick={() => handleAction('generateReport', 'Elite')}
              variant="default"
            />
          </div>
        </div>
      )}

      {/* Upgrade suggestions for lower tiers */}
      {tier === 'Base' && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Suggest Premium upgrade to unlock meal planning and progress tracking
          </p>
        </div>
      )}

      {tier === 'Premium' && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Suggest Elite upgrade for 1-on-1 video calls and priority support
          </p>
        </div>
      )}
    </div>
  );
};

export default TierBasedActions;

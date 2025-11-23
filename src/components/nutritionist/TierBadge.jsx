import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Sparkles } from 'lucide-react';

const TierBadge = ({ tier, size = 'default', showIcon = true }) => {
  const tierConfig = {
    Base: {
      color: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border-gray-500/20',
      icon: Sparkles,
      label: 'Base'
    },
    Premium: {
      color: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/20',
      icon: Star,
      label: 'Premium'
    },
    Elite: {
      color: 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-700 dark:from-yellow-500/20 dark:to-orange-500/20 dark:text-yellow-300 border-yellow-500/20',
      icon: Crown,
      label: 'Elite'
    }
  };

  const config = tierConfig[tier] || tierConfig.Base;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <Badge
      className={`${config.color} ${sizeClasses[size]} font-semibold border`}
      variant="outline"
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
};

export default TierBadge;

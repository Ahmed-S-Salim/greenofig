import React from 'react';
import { FileQuestion, Search, Users, CreditCard, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap = {
  default: FileQuestion,
  search: Search,
  users: Users,
  subscription: CreditCard,
  content: FileText,
  email: Mail
};

const EmptyState = ({
  icon = 'default',
  title = 'No Data Found',
  description = 'There is no data to display at the moment.',
  action,
  actionLabel,
  className = ''
}) => {
  const Icon = iconMap[icon] || iconMap.default;

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-secondary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-md">{description}</p>
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;

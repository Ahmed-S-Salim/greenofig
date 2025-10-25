import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />
  );
};

export const LoadingState = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center p-12';

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-text-secondary">{message}</p>
      </div>
    </div>
  );
};

export const LoadingCard = () => {
  return (
    <div className="glass-effect p-4 rounded-lg animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export const LoadingTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="glass-effect rounded-lg overflow-hidden">
      <div className="animate-pulse">
        <div className="border-b border-border/50 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="border-b border-border/50 p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;

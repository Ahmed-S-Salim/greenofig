import { useEffect } from 'react';

/**
 * Performance Monitor Component
 * Tracks and logs performance metrics in development mode
 * Can be extended to send metrics to analytics in production
 */
const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Performance Observer for monitoring specific metrics
    if ('PerformanceObserver' in window) {
      // Monitor Long Tasks (tasks that block the main thread > 50ms)
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Performance] Long Task detected:', {
                duration: Math.round(entry.duration),
                startTime: Math.round(entry.startTime),
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // longtask not supported in all browsers
      }

      // Monitor Layout Shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput && entry.value > 0.1) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('[Performance] Layout Shift detected:', {
                  value: entry.value.toFixed(4),
                  sources: entry.sources?.map(s => s.node),
                });
              }
            }
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // layout-shift not supported in all browsers
      }

      // Monitor Resource Loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log slow resources (> 1s)
          if (entry.duration > 1000) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Performance] Slow resource detected:', {
                name: entry.name,
                duration: Math.round(entry.duration),
                size: entry.transferSize,
                type: entry.initiatorType,
              });
            }
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }

    // Check for memory leaks in development
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        const percentUsed = Math.round((usedMB / totalMB) * 100);

        if (percentUsed > 80) {
          console.warn('[Performance] High memory usage:', {
            used: `${usedMB}MB`,
            total: `${totalMB}MB`,
            percent: `${percentUsed}%`,
          });
        }
      };

      // Check memory every 30 seconds
      const memoryInterval = setInterval(checkMemory, 30000);

      return () => clearInterval(memoryInterval);
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default PerformanceMonitor;

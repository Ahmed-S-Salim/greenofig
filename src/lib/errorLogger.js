import { supabase } from './customSupabaseClient';

/**
 * Error Logger Service
 * Captures and logs all application errors to Supabase
 */

class ErrorLogger {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    // Catch unhandled errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError({
        message: message.toString(),
        stack: error?.stack,
        type: 'runtime_error',
        url: window.location.href,
        source,
        line: lineno,
        column: colno
      });
      return false; // Let default handler run
    };

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        type: 'promise_rejection',
        url: window.location.href
      });
    });

    this.isInitialized = true;
    console.log('✅ Error Logger initialized');
  }

  async logError({
    message,
    stack = '',
    type = 'unknown',
    componentName = 'unknown',
    severity = 'medium',
    url = window.location.href,
    source = '',
    line = null,
    column = null,
    userId = null
  }) {
    try {
      // Get current user if not provided
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      }

      const errorData = {
        error_message: message,
        error_stack: stack,
        error_type: type,
        component_name: componentName,
        user_id: userId,
        user_agent: navigator.userAgent,
        url: url,
        severity: severity,
        status: 'open',
        source_file: source,
        line_number: line,
        column_number: column,
        browser_info: {
          language: navigator.language,
          platform: navigator.platform,
          screen: {
            width: window.screen.width,
            height: window.screen.height
          }
        }
      };

      const { error } = await supabase
        .from('error_logs')
        .insert([errorData]);

      if (error) {
        console.error('Failed to log error to Supabase:', error);
      } else {
        console.log('Error logged to database:', message);
      }
    } catch (e) {
      // Silently fail - don't want error logging to break the app
      console.error('Error in errorLogger:', e);
    }
  }

  // Manual error logging
  log(error, componentName = 'unknown', severity = 'medium') {
    this.logError({
      message: error.message || error.toString(),
      stack: error.stack,
      type: 'manual_log',
      componentName,
      severity
    });
  }
}

export const errorLogger = new ErrorLogger();

// Auto-initialize
if (typeof window !== 'undefined') {
  errorLogger.init();
}

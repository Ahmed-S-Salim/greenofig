import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracking service (e.g., Sentry) here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <AlertCircle className="w-8 h-8 text-red-500" />
                Something Went Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-text-secondary">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>

              {this.state.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="font-mono text-sm text-red-400">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/app/admin'}
                >
                  Go to Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-text-secondary hover:text-foreground">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-4 bg-muted/30 rounded-lg text-xs overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

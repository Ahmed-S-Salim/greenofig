import React from 'react';
import { hasPermission } from '@/lib/rbac';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Component that conditionally renders children based on user permissions
 */
export const PermissionGuard = ({ user, permission, children, fallback = null, showDenied = false }) => {
  const hasAccess = hasPermission(user, permission);

  if (!hasAccess) {
    if (showDenied) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <ShieldAlert className="w-6 h-6 text-orange-500" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary mb-4">
                You don't have permission to access this feature.
              </p>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

/**
 * HOC that wraps a component with permission checking
 */
export const withPermission = (Component, permission) => {
  return (props) => (
    <PermissionGuard user={props.user} permission={permission} showDenied={true}>
      <Component {...props} />
    </PermissionGuard>
  );
};

export default PermissionGuard;

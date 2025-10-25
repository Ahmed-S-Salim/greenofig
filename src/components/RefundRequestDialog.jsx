import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, DollarSign } from 'lucide-react';
import { requestRefund } from '@/lib/stripeEnhanced';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const RefundRequestDialog = ({ open, onOpenChange, transaction, onSuccess }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a reason for the refund',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      await requestRefund({
        userId: user.id,
        paymentTransactionId: transaction.id,
        amount: transaction.amount,
        reason,
        refundType: 'full',
        customerNotes: customerNotes.trim() || null,
      });

      toast({
        title: 'Refund Requested',
        description: 'Your refund request has been submitted and is pending review',
      });

      onOpenChange(false);
      setReason('');
      setCustomerNotes('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit refund request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reasons = [
    'Product not as described',
    'Technical issues',
    'Changed my mind',
    'Found a better alternative',
    'Too expensive',
    'Not using the service',
    'Billing error',
    'Other',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Request Refund
          </DialogTitle>
          <DialogDescription>
            Submit a refund request for this transaction. Our team will review it within 1-2 business days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Details */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-text-secondary">Transaction Amount</p>
                <p className="text-2xl font-bold">${transaction.amount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Date</p>
                <p className="text-sm font-medium">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {transaction.subscription_plans?.name && (
              <p className="text-sm text-text-secondary">
                Plan: {transaction.subscription_plans.name}
              </p>
            )}
          </div>

          {/* Refund Reason */}
          <div className="space-y-2">
            <Label>Reason for Refund *</Label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a reason...</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Provide any additional details about your refund request..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">Please Note:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Refunds are reviewed within 1-2 business days</li>
                <li>Refunds typically take 5-10 business days to appear in your account</li>
                <li>Your subscription will be cancelled if the refund is approved</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RefundRequestDialog;

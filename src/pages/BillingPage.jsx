import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getUserInvoices, downloadInvoicePDF } from '@/lib/invoiceGenerator';
import { getUserPaymentMethods, setDefaultPaymentMethod, removePaymentMethod } from '@/lib/stripeEnhanced';
import { getUserRefunds, requestRefund } from '@/lib/stripeEnhanced';
import { supabase } from '@/lib/customSupabaseClient';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import RefundRequestDialog from '@/components/RefundRequestDialog';

const BillingPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      // Fetch invoices
      const invoiceData = await getUserInvoices(user.id);
      setInvoices(invoiceData);

      // Fetch payment methods
      const methodsData = await getUserPaymentMethods(user.id);
      setPaymentMethods(methodsData);

      // Fetch refunds
      const refundsData = await getUserRefunds(user.id);
      setRefunds(refundsData);

      // Fetch payment transactions
      const { data: transData } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          subscription_plans (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setTransactions(transData || []);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      await downloadInvoicePDF(invoiceId);
      toast({
        title: 'Success',
        description: 'Invoice downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download invoice',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId) => {
    try {
      await setDefaultPaymentMethod(user.id, methodId);
      await fetchBillingData();
      toast({
        title: 'Success',
        description: 'Default payment method updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment method',
        variant: 'destructive',
      });
    }
  };

  const handleRemovePaymentMethod = async (methodId) => {
    try {
      await removePaymentMethod(user.id, methodId);
      await fetchBillingData();
      toast({
        title: 'Success',
        description: 'Payment method removed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove payment method',
        variant: 'destructive',
      });
    }
  };

  const handleRequestRefund = (transaction) => {
    setSelectedTransaction(transaction);
    setRefundDialogOpen(true);
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      canceled: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Invoices</h1>
        <p className="text-text-secondary mt-1">Manage your payments, invoices, and subscription</p>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {invoices.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary">No invoices yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{invoice.invoice_number}</h3>
                        <p className="text-sm text-text-secondary">
                          {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">${invoice.amount}</p>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <Button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {transactions.length === 0 ? (
            <Card className="p-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary">No transactions yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        transaction.status === 'succeeded' ? 'bg-green-100' :
                        transaction.status === 'failed' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        {transaction.status === 'succeeded' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : transaction.status === 'failed' ? (
                          <XCircle className="w-6 h-6 text-red-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{transaction.subscription_plans?.name || 'Payment'}</h3>
                        <p className="text-sm text-text-secondary">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                        </p>
                        {transaction.payment_intent_id && (
                          <p className="text-xs text-text-secondary mt-1">
                            ID: {transaction.payment_intent_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">${transaction.amount}</p>
                        <StatusBadge status={transaction.status} />
                      </div>
                      {transaction.status === 'succeeded' && !transaction.is_refunded && (
                        <Button
                          onClick={() => handleRequestRefund(transaction)}
                          variant="outline"
                          size="sm"
                        >
                          Request Refund
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-4">
          {paymentMethods.length === 0 ? (
            <Card className="p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary mb-4">No payment methods added</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {method.card_brand?.toUpperCase()} •••• {method.card_last4}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Expires {method.card_exp_month}/{method.card_exp_year}
                        </p>
                        {method.is_default && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!method.is_default && (
                        <Button
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          variant="outline"
                          size="sm"
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add New Payment Method
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds" className="space-y-4">
          {refunds.length === 0 ? (
            <Card className="p-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary">No refund requests</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {refunds.map((refund) => (
                <Card key={refund.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Refund Request</h3>
                        <p className="text-sm text-text-secondary">
                          {format(new Date(refund.requested_at), 'MMM dd, yyyy')}
                        </p>
                        {refund.reason && (
                          <p className="text-sm text-text-secondary mt-1">
                            Reason: {refund.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${refund.amount}</p>
                      <StatusBadge status={refund.status} />
                      {refund.status === 'completed' && refund.completed_at && (
                        <p className="text-xs text-text-secondary mt-1">
                          Completed {format(new Date(refund.completed_at), 'MMM dd')}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Refund Request Dialog */}
      <RefundRequestDialog
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        transaction={selectedTransaction}
        onSuccess={fetchBillingData}
      />
    </div>
  );
};

export default BillingPage;

/**
 * Invoice Generation Utility
 * Generates PDF invoices for payments
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from './customSupabaseClient';
import { format } from 'date-fns';

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = async () => {
  try {
    // Call the database function
    const { data, error } = await supabase.rpc('generate_invoice_number');

    if (error) {
      // Fallback if function doesn't exist
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `INV-${format(new Date(), 'yyyyMM')}-${timestamp}-${random}`;
    }

    return data;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    const timestamp = Date.now();
    return `INV-${format(new Date(), 'yyyyMM')}-${timestamp}`;
  }
};

/**
 * Create invoice record in database
 */
export const createInvoice = async ({
  userId,
  subscriptionPlanId,
  paymentTransactionId,
  amount,
  subtotal,
  taxAmount = 0,
  taxRate = 0,
  discountAmount = 0,
  billingName,
  billingEmail,
  billingAddress = {},
  lineItems = [],
  notes = null,
}) => {
  try {
    const invoiceNumber = await generateInvoiceNumber();

    const { data, error } = await supabase
      .from('invoices')
      .insert([
        {
          invoice_number: invoiceNumber,
          user_id: userId,
          subscription_plan_id: subscriptionPlanId,
          payment_transaction_id: paymentTransactionId,
          amount,
          subtotal,
          tax_amount: taxAmount,
          tax_rate: taxRate,
          discount_amount: discountAmount,
          currency: 'USD',
          status: 'draft',
          billing_name: billingName,
          billing_email: billingEmail,
          billing_address: billingAddress,
          issue_date: new Date().toISOString(),
          due_date: new Date().toISOString(),
          line_items: lineItems,
          notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

/**
 * Generate PDF invoice
 */
export const generateInvoicePDF = async (invoiceId) => {
  try {
    // Fetch invoice data with related information
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        subscription_plans (name, description),
        payment_transactions (payment_method, payment_intent_id)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    if (!invoice) throw new Error('Invoice not found');

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryColor = [34, 197, 94]; // Green
    const darkColor = [17, 24, 39];
    const lightColor = [156, 163, 175];

    // Header - Company Logo/Name
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('GreenoFig', 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(...lightColor);
    doc.setFont(undefined, 'normal');
    doc.text('AI-Powered Health & Wellness', 20, 32);
    doc.text('support@greenofig.com', 20, 37);

    // Invoice Title
    doc.setFontSize(20);
    doc.setTextColor(...darkColor);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });

    // Invoice Details (Right side)
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkColor);

    let yPos = 35;
    doc.text(`Invoice #: ${invoice.invoice_number}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 5;
    doc.text(`Issue Date: ${format(new Date(invoice.issue_date), 'MMM dd, yyyy')}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 5;
    doc.text(`Due Date: ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 5;

    // Status badge
    const statusColors = {
      draft: [156, 163, 175],
      sent: [59, 130, 246],
      paid: [34, 197, 94],
      void: [239, 68, 68],
      refunded: [251, 146, 60],
    };
    const statusColor = statusColors[invoice.status] || statusColors.draft;
    doc.setFillColor(...statusColor);
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(pageWidth - 50, yPos - 3, 30, 6, 2, 2, 'F');
    doc.text(invoice.status.toUpperCase(), pageWidth - 35, yPos + 1, { align: 'center' });

    // Horizontal line
    yPos += 15;
    doc.setDrawColor(...lightColor);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Bill To Section
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 20, yPos);

    yPos += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(invoice.billing_name || 'Customer', 20, yPos);

    if (invoice.billing_email) {
      yPos += 5;
      doc.text(invoice.billing_email, 20, yPos);
    }

    if (invoice.billing_address && Object.keys(invoice.billing_address).length > 0) {
      const addr = invoice.billing_address;
      if (addr.line1) {
        yPos += 5;
        doc.text(addr.line1, 20, yPos);
      }
      if (addr.city || addr.state || addr.postal_code) {
        yPos += 5;
        const cityLine = [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ');
        doc.text(cityLine, 20, yPos);
      }
      if (addr.country) {
        yPos += 5;
        doc.text(addr.country, 20, yPos);
      }
    }

    // Line Items Table
    yPos += 15;
    const tableData = [];

    if (invoice.line_items && invoice.line_items.length > 0) {
      invoice.line_items.forEach(item => {
        tableData.push([
          item.description || 'Service',
          item.quantity || 1,
          `$${(item.unit_price || 0).toFixed(2)}`,
          `$${(item.amount || 0).toFixed(2)}`,
        ]);
      });
    } else {
      // Default line item from subscription plan
      const planName = invoice.subscription_plans?.name || 'Subscription';
      const planDesc = invoice.subscription_plans?.description || '';
      tableData.push([
        `${planName}\n${planDesc}`,
        1,
        `$${invoice.subtotal.toFixed(2)}`,
        `$${invoice.subtotal.toFixed(2)}`,
      ]);
    }

    doc.autoTable({
      startY: yPos,
      head: [['Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkColor,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: 20, right: 20 },
    });

    // Summary section
    yPos = doc.lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 80;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkColor);

    // Subtotal
    doc.text('Subtotal:', summaryX, yPos);
    doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });

    // Discount (if any)
    if (invoice.discount_amount > 0) {
      yPos += 6;
      doc.setTextColor(...statusColors.paid);
      doc.text('Discount:', summaryX, yPos);
      doc.text(`-$${invoice.discount_amount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
      doc.setTextColor(...darkColor);
    }

    // Tax (if any)
    if (invoice.tax_amount > 0) {
      yPos += 6;
      doc.text(`Tax (${invoice.tax_rate}%):`, summaryX, yPos);
      doc.text(`$${invoice.tax_amount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    }

    // Total line
    yPos += 2;
    doc.setDrawColor(...lightColor);
    doc.line(summaryX, yPos, pageWidth - 20, yPos);

    // Total
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', summaryX, yPos);
    doc.text(`$${invoice.amount.toFixed(2)} ${invoice.currency}`, pageWidth - 20, yPos, { align: 'right' });

    // Payment info
    if (invoice.payment_transactions) {
      yPos += 10;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...lightColor);
      doc.text(`Payment Method: ${invoice.payment_transactions.payment_method || 'N/A'}`, summaryX, yPos);

      if (invoice.payment_transactions.payment_intent_id) {
        yPos += 4;
        doc.text(`Transaction ID: ${invoice.payment_transactions.payment_intent_id}`, summaryX, yPos);
      }
    }

    // Notes
    if (invoice.notes) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 20, yPos);

      yPos += 5;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40);
      doc.text(splitNotes, 20, yPos);
    }

    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(...lightColor);
    doc.setFont(undefined, 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    doc.text('This is a computer-generated invoice.', pageWidth / 2, footerY + 4, { align: 'center' });

    return doc;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};

/**
 * Download invoice as PDF
 */
export const downloadInvoicePDF = async (invoiceId) => {
  try {
    const doc = await generateInvoicePDF(invoiceId);

    // Get invoice number for filename
    const { data: invoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('id', invoiceId)
      .single();

    const filename = `${invoice?.invoice_number || 'invoice'}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

/**
 * Get invoice as blob for upload
 */
export const getInvoicePDFBlob = async (invoiceId) => {
  try {
    const doc = await generateInvoicePDF(invoiceId);
    return doc.output('blob');
  } catch (error) {
    console.error('Error getting invoice blob:', error);
    throw error;
  }
};

/**
 * Mark invoice as paid
 */
export const markInvoiceAsPaid = async (invoiceId) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    throw error;
  }
};

/**
 * Get user invoices
 */
export const getUserInvoices = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        subscription_plans (name),
        payment_transactions (status, payment_method)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    return [];
  }
};

/**
 * Create invoice from payment transaction
 */
export const createInvoiceFromTransaction = async (transactionId) => {
  try {
    // Fetch transaction with related data
    const { data: transaction, error: transError } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        user_profiles!payment_transactions_user_id_fkey (full_name, email),
        subscription_plans (name, description)
      `)
      .eq('id', transactionId)
      .single();

    if (transError) throw transError;
    if (!transaction) throw new Error('Transaction not found');

    // Calculate amounts
    const subtotal = transaction.amount;
    const taxRate = 0; // You can calculate based on user location
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Create line items
    const lineItems = [
      {
        description: `${transaction.subscription_plans?.name || 'Subscription'} - ${transaction.billing_cycle}`,
        quantity: 1,
        unit_price: subtotal,
        amount: subtotal,
      },
    ];

    // Create invoice
    const invoice = await createInvoice({
      userId: transaction.user_id,
      subscriptionPlanId: transaction.subscription_plan_id,
      paymentTransactionId: transactionId,
      amount: total,
      subtotal,
      taxAmount,
      taxRate,
      discountAmount: 0,
      billingName: transaction.user_profiles?.full_name || 'Customer',
      billingEmail: transaction.user_profiles?.email || '',
      billingAddress: {},
      lineItems,
      notes: null,
    });

    // If transaction is successful, mark invoice as paid
    if (transaction.status === 'succeeded') {
      await markInvoiceAsPaid(invoice.id);
    }

    return invoice;
  } catch (error) {
    console.error('Error creating invoice from transaction:', error);
    throw error;
  }
};

export default {
  generateInvoiceNumber,
  createInvoice,
  generateInvoicePDF,
  downloadInvoicePDF,
  getInvoicePDFBlob,
  markInvoiceAsPaid,
  getUserInvoices,
  createInvoiceFromTransaction,
};

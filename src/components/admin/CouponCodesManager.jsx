import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Ticket, Plus, Trash2, Edit, Copy, CheckCircle, XCircle,
  Calendar, Users, DollarSign, Percent, Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

const CouponCodesManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    isRecurring: false,
    maxUses: '',
    maxUsesPerUser: '1',
    minPurchaseAmount: '',
    applicablePlans: [],
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    description: '',
    internalNotes: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*, coupon_redemptions(count)')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching coupons', description: error.message, variant: 'destructive' });
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    const filtered = coupons.filter(coupon =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoupons(filtered);
  }, [searchTerm, coupons]);

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      isRecurring: false,
      maxUses: '',
      maxUsesPerUser: '1',
      minPurchaseAmount: '',
      applicablePlans: [],
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      description: '',
      internalNotes: '',
    });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value.toString(),
      isRecurring: coupon.is_recurring,
      maxUses: coupon.max_uses?.toString() || '',
      maxUsesPerUser: coupon.max_uses_per_user.toString(),
      minPurchaseAmount: coupon.min_purchase_amount?.toString() || '',
      applicablePlans: coupon.applicable_plans || [],
      validFrom: coupon.valid_from ? new Date(coupon.valid_from).toISOString().split('T')[0] : '',
      validUntil: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : '',
      description: coupon.description || '',
      internalNotes: coupon.internal_notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discountType,
      discount_value: parseFloat(formData.discountValue),
      is_recurring: formData.isRecurring,
      max_uses: formData.maxUses ? parseInt(formData.maxUses) : null,
      max_uses_per_user: parseInt(formData.maxUsesPerUser),
      min_purchase_amount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null,
      applicable_plans: formData.applicablePlans.length > 0 ? formData.applicablePlans : null,
      valid_from: formData.validFrom,
      valid_until: formData.validUntil || null,
      description: formData.description,
      internal_notes: formData.internalNotes,
      is_active: true,
    };

    let error;
    if (editingCoupon) {
      const result = await supabase
        .from('coupon_codes')
        .update(couponData)
        .eq('id', editingCoupon.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('coupon_codes')
        .insert(couponData);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Error saving coupon', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingCoupon ? 'Coupon updated!' : 'Coupon created!' });
      setIsDialogOpen(false);
      resetForm();
      fetchCoupons();
    }
  };

  const handleDelete = async (couponId) => {
    const { error } = await supabase
      .from('coupon_codes')
      .delete()
      .eq('id', couponId);

    if (error) {
      toast({ title: 'Error deleting coupon', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Coupon deleted successfully' });
      fetchCoupons();
    }
  };

  const toggleActive = async (coupon) => {
    const { error } = await supabase
      .from('coupon_codes')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      toast({ title: 'Error updating coupon', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: coupon.is_active ? 'Coupon deactivated' : 'Coupon activated' });
      fetchCoupons();
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Code copied to clipboard!' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Coupon Codes</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">Create and manage discount codes</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button size="sm" className="h-9 px-3 text-sm" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Coupon
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search coupons..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 glass-effect"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading coupons...</div>
      ) : (
        <div className="grid gap-4">
          {filteredCoupons.map(coupon => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-primary" />
                          <code className="text-xl font-bold">{coupon.code}</code>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyCode(coupon.code)}
                          className="h-9 w-9 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {coupon.is_recurring && (
                          <Badge variant="outline">Recurring</Badge>
                        )}
                      </div>

                      {coupon.description && (
                        <p className="text-sm text-text-secondary mb-3">{coupon.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          {coupon.discount_type === 'percentage' ? (
                            <Percent className="w-4 h-4 text-green-400" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-green-400" />
                          )}
                          <span>
                            {coupon.discount_type === 'percentage'
                              ? `${coupon.discount_value}% off`
                              : `$${coupon.discount_value} off`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span>
                            {coupon.current_uses}/{coupon.max_uses || '∞'} uses
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>
                            {coupon.valid_until
                              ? `Until ${new Date(coupon.valid_until).toLocaleDateString()}`
                              : 'No expiry'}
                          </span>
                        </div>

                        {coupon.min_purchase_amount && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            <span>Min: ${coupon.min_purchase_amount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(coupon)}
                        title={coupon.is_active ? 'Deactivate' : 'Activate'}
                        className="h-9 w-9 p-0"
                      >
                        {coupon.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(coupon)}
                        className="h-9 w-9 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                        className="h-9 w-9 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredCoupons.length === 0 && (
            <p className="text-text-secondary text-center py-8">No coupons found</p>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="glass-effect custom-scrollbar max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
          </DialogHeader>
          {/* Cache Buster v3: 2025-11-02-14:30 FIXED */}
          <form onSubmit={handleSubmit} className="space-y-4 min-w-0 max-w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
                <Label className="text-sm">Coupon Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="SUMMER2024"
                  className="glass-effect font-mono w-full min-w-0 max-w-full text-base"
                  style={{ fontSize: '16px' }}
                  required
                />
              </div>
              <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
                <Label className="text-sm">Discount Type *</Label>
                <Select value={formData.discountType} onValueChange={(val) => setFormData({...formData, discountType: val})}>
                  <SelectTrigger className="glass-effect w-full min-w-0 max-w-full text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-w-[90vw]">
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
                <Label className="text-sm">Discount Value *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                  placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                  className="glass-effect w-full min-w-0 max-w-full text-base"
                  style={{ fontSize: '16px' }}
                  required
                />
              </div>
              <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
                <Label className="text-sm">Min Purchase Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({...formData, minPurchaseAmount: e.target.value})}
                  placeholder="50.00"
                  className="glass-effect w-full min-w-0 max-w-full text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
                <Label className="text-sm">Max Total Uses</Label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                  placeholder="Unlimited"
                  className="glass-effect w-full min-w-0 max-w-full text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
                <Label className="text-sm">Max Uses Per User *</Label>
                <Input
                  type="number"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => setFormData({...formData, maxUsesPerUser: e.target.value})}
                  className="glass-effect w-full min-w-0 max-w-full text-base"
                  style={{ fontSize: '16px' }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
                <Label className="text-sm">Valid From</Label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                  className="flex h-12 lg:h-14 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background/50 backdrop-blur-sm px-4 lg:px-5 py-3 lg:py-3.5 text-base lg:text-lg text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50 glass-effect"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
                <Label className="text-sm">Valid Until</Label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  className="flex h-12 lg:h-14 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background/50 backdrop-blur-sm px-4 lg:px-5 py-3 lg:py-3.5 text-base lg:text-lg text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50 glass-effect"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({...formData, isRecurring: checked})}
              />
              <Label className="cursor-pointer text-sm">Recurring Discount (applies to all future payments)</Label>
            </div>

            <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
              <Label className="text-sm">Description (visible to customers)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Get 20% off your first month!"
                className="glass-effect w-full min-w-0 max-w-full resize-none text-base"
                style={{ fontSize: '16px' }}
                rows={2}
              />
            </div>

            <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
              <Label className="text-sm">Internal Notes</Label>
              <Textarea
                value={formData.internalNotes}
                onChange={(e) => setFormData({...formData, internalNotes: e.target.value})}
                placeholder="Marketing campaign: Summer 2024"
                className="glass-effect w-full min-w-0 max-w-full resize-none text-base"
                style={{ fontSize: '16px' }}
                rows={2}
              />
            </div>

            <DialogFooter className="flex flex-wrap gap-2 sm:gap-3">
              <Button size="sm" className="h-9 px-3" type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-9 px-3" type="submit">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponCodesManager;

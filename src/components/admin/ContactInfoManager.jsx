import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Mail, Phone, MapPin, Globe } from 'lucide-react';

const ContactInfoManager = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch contact info
  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setContactInfo(data);
      } else {
        // No contact info exists, create a blank one
        setContactInfo({
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          postal_code: '',
          facebook_url: '',
          twitter_url: '',
          instagram_url: '',
          linkedin_url: '',
          youtube_url: '',
          tiktok_url: '',
          is_active: true,
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      alert('Error loading contact info: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  // Save contact info
  const handleSave = async () => {
    try {
      setSaving(true);

      if (contactInfo.id) {
        // Update existing
        const { error } = await supabase
          .from('contact_info')
          .update({
            email: contactInfo.email,
            phone: contactInfo.phone,
            address: contactInfo.address,
            city: contactInfo.city,
            state: contactInfo.state,
            country: contactInfo.country,
            postal_code: contactInfo.postal_code,
            facebook_url: contactInfo.facebook_url,
            twitter_url: contactInfo.twitter_url,
            instagram_url: contactInfo.instagram_url,
            linkedin_url: contactInfo.linkedin_url,
            youtube_url: contactInfo.youtube_url,
            tiktok_url: contactInfo.tiktok_url,
          })
          .eq('id', contactInfo.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('contact_info')
          .insert([contactInfo]);

        if (error) throw error;
      }

      alert('Contact information saved successfully!');
      fetchContactInfo();
    } catch (error) {
      console.error('Error saving contact info:', error);
      alert('Error saving contact info: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setContactInfo({ ...contactInfo, [field]: value });
  };

  if (loading) {
    return <div className="p-6">Loading contact information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Contact Information Manager</h2>
          <p className="text-text-secondary mt-1">Update contact details and social media links</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {contactInfo && (
        <div className="grid gap-6">
          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={contactInfo.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={contactInfo.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Physical Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Street Address</Label>
                <Input
                  value={contactInfo.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={contactInfo.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="San Francisco"
                  />
                </div>
                <div>
                  <Label>State/Province</Label>
                  <Input
                    value={contactInfo.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="CA"
                  />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input
                    value={contactInfo.postal_code || ''}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    placeholder="94102"
                  />
                </div>
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={contactInfo.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="USA"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facebook URL</Label>
                  <Input
                    type="url"
                    value={contactInfo.facebook_url || ''}
                    onChange={(e) => handleChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <Label>Twitter/X URL</Label>
                  <Input
                    type="url"
                    value={contactInfo.twitter_url || ''}
                    onChange={(e) => handleChange('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    type="url"
                    value={contactInfo.instagram_url || ''}
                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    type="url"
                    value={contactInfo.linkedin_url || ''}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div>
                  <Label>YouTube URL</Label>
                  <Input
                    type="url"
                    value={contactInfo.youtube_url || ''}
                    onChange={(e) => handleChange('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
                <div>
                  <Label>TikTok URL</Label>
                  <Input
                    type="url"
                    value={contactInfo.tiktok_url || ''}
                    onChange={(e) => handleChange('tiktok_url', e.target.value)}
                    placeholder="https://tiktok.com/@yourhandle"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContactInfoManager;

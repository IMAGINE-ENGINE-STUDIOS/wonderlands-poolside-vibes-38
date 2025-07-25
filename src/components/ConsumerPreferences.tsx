import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Building2 } from 'lucide-react';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ConsumerPrefs {
  id?: string;
  delivery_address?: Address;
  business_address?: Address;
  preferred_payment_methods?: string[];
}

const ConsumerPreferences = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<ConsumerPrefs>({});

  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  const [businessAddress, setBusinessAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  useEffect(() => {
    if (profile?.id) {
      fetchPreferences();
    }
  }, [profile?.id]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('consumer_preferences')
        .select('*')
        .eq('consumer_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data as any);
        if (data.delivery_address) {
          setDeliveryAddress(data.delivery_address as unknown as Address);
        }
        if (data.business_address) {
          setBusinessAddress(data.business_address as unknown as Address);
        }
      }
    } catch (error) {
      console.error('Error in fetchPreferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const prefsData = {
        consumer_id: profile.id,
        delivery_address: deliveryAddress as any,
        business_address: businessAddress as any,
        preferred_payment_methods: preferences.preferred_payment_methods || []
      };

      const { error } = await supabase
        .from('consumer_preferences')
        .upsert(prefsData, { onConflict: 'consumer_id' });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateDeliveryAddress = (field: keyof Address, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const updateBusinessAddress = (field: keyof Address, value: string) => {
    setBusinessAddress(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Delivery Address</span>
          </CardTitle>
          <CardDescription>Your primary delivery address for orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery-street">Street Address</Label>
            <Input
              id="delivery-street"
              value={deliveryAddress.street}
              onChange={(e) => updateDeliveryAddress('street', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-city">City</Label>
              <Input
                id="delivery-city"
                value={deliveryAddress.city}
                onChange={(e) => updateDeliveryAddress('city', e.target.value)}
                placeholder="Your City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-state">State</Label>
              <Input
                id="delivery-state"
                value={deliveryAddress.state}
                onChange={(e) => updateDeliveryAddress('state', e.target.value)}
                placeholder="State"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-zip">ZIP Code</Label>
              <Input
                id="delivery-zip"
                value={deliveryAddress.zipCode}
                onChange={(e) => updateDeliveryAddress('zipCode', e.target.value)}
                placeholder="12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-country">Country</Label>
              <Input
                id="delivery-country"
                value={deliveryAddress.country}
                onChange={(e) => updateDeliveryAddress('country', e.target.value)}
                placeholder="USA"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Business Address</span>
          </CardTitle>
          <CardDescription>Your business address for billing purposes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-street">Street Address</Label>
            <Input
              id="business-street"
              value={businessAddress.street}
              onChange={(e) => updateBusinessAddress('street', e.target.value)}
              placeholder="123 Business Avenue"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-city">City</Label>
              <Input
                id="business-city"
                value={businessAddress.city}
                onChange={(e) => updateBusinessAddress('city', e.target.value)}
                placeholder="Business City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-state">State</Label>
              <Input
                id="business-state"
                value={businessAddress.state}
                onChange={(e) => updateBusinessAddress('state', e.target.value)}
                placeholder="State"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-zip">ZIP Code</Label>
              <Input
                id="business-zip"
                value={businessAddress.zipCode}
                onChange={(e) => updateBusinessAddress('zipCode', e.target.value)}
                placeholder="12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-country">Country</Label>
              <Input
                id="business-country"
                value={businessAddress.country}
                onChange={(e) => updateBusinessAddress('country', e.target.value)}
                placeholder="USA"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default ConsumerPreferences;
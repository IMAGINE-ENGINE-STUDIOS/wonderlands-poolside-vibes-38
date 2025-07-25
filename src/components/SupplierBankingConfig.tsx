import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface BankingConfig {
  id?: string;
  stripe_account_id?: string;
  bank_account_details?: any;
  commission_rate: number;
  is_verified: boolean;
}

const SupplierBankingConfig = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BankingConfig>({
    commission_rate: 10.00,
    is_verified: false
  });

  const [bankDetails, setBankDetails] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking'
  });

  useEffect(() => {
    if (profile?.id) {
      fetchBankingConfig();
    }
  }, [profile?.id]);

  const fetchBankingConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_banking_config')
        .select('*')
        .eq('supplier_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching banking config:', error);
        return;
      }

      if (data) {
        setConfig(data);
        if (data.bank_account_details) {
          setBankDetails(data.bank_account_details as any);
        }
      }
    } catch (error) {
      console.error('Error in fetchBankingConfig:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBankingConfig = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const configData = {
        supplier_id: profile.id,
        bank_account_details: bankDetails,
        commission_rate: config.commission_rate,
        is_verified: false // Reset verification when details change
      };

      const { error } = await supabase
        .from('supplier_banking_config')
        .upsert(configData, { onConflict: 'supplier_id' });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Banking configuration saved successfully. Verification is pending.",
      });

      // Refresh the data
      await fetchBankingConfig();
    } catch (error) {
      console.error('Error saving banking config:', error);
      toast({
        title: "Error",
        description: "Failed to save banking configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
            <CreditCard className="h-5 w-5" />
            <span>Payment Configuration</span>
          </CardTitle>
          <CardDescription>
            Set up your banking details to receive payments from sales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Commission Rate</p>
              <p className="text-sm text-muted-foreground">
                Wonderland platform fee deducted from each sale
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {config.commission_rate}%
            </Badge>
          </div>

          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            {config.is_verified ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium">
                Account Status: {config.is_verified ? 'Verified' : 'Pending Verification'}
              </p>
              <p className="text-sm text-muted-foreground">
                {config.is_verified 
                  ? 'Your account is verified and ready to receive payments'
                  : 'Your account details are under review'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account Details</CardTitle>
          <CardDescription>
            Your banking information for receiving payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-holder">Account Holder Name</Label>
            <Input
              id="account-holder"
              value={bankDetails.account_holder_name}
              onChange={(e) => setBankDetails({ 
                ...bankDetails, 
                account_holder_name: e.target.value 
              })}
              placeholder="Full name on account"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input
              id="bank-name"
              value={bankDetails.bank_name}
              onChange={(e) => setBankDetails({ 
                ...bankDetails, 
                bank_name: e.target.value 
              })}
              placeholder="Your bank name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                type="password"
                value={bankDetails.account_number}
                onChange={(e) => setBankDetails({ 
                  ...bankDetails, 
                  account_number: e.target.value 
                })}
                placeholder="••••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routing-number">Routing Number</Label>
              <Input
                id="routing-number"
                value={bankDetails.routing_number}
                onChange={(e) => setBankDetails({ 
                  ...bankDetails, 
                  routing_number: e.target.value 
                })}
                placeholder="9-digit routing number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-type">Account Type</Label>
            <select
              id="account-type"
              value={bankDetails.account_type}
              onChange={(e) => setBankDetails({ 
                ...bankDetails, 
                account_type: e.target.value 
              })}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How Payments Work</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You receive {100 - config.commission_rate}% of each sale</li>
              <li>• Wonderland deducts {config.commission_rate}% as platform commission</li>
              <li>• Payments are processed within 2-3 business days</li>
              <li>• All transactions are secured and encrypted</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveBankingConfig} disabled={saving}>
              {saving ? 'Saving...' : 'Save Banking Details'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierBankingConfig;
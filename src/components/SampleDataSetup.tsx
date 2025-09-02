import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SampleDataSetup = () => {
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const { toast } = useToast();

  const setupSampleData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-sample-users', {});

      if (error) throw error;

      setCredentials(data.credentials);
      setSetupComplete(true);
      toast({
        title: "Success",
        description: "Sample users and data created successfully",
      });
    } catch (error) {
      console.error('Error setting up sample data:', error);
      toast({
        title: "Error",
        description: "Failed to setup sample data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Sample Data Setup
        </CardTitle>
        <CardDescription>
          Create sample contractor and supplier users with demo data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!setupComplete ? (
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Initialize Sample Users</h3>
              <p className="text-muted-foreground mb-4">
                This will create sample contractor and supplier accounts with demo products and services.
              </p>
              <Button 
                onClick={setupSampleData} 
                disabled={loading}
                className="w-full max-w-md"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Setup Sample Data
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-700">Setup Complete!</h3>
              <p className="text-green-600 mb-4">
                Sample users have been created successfully.
              </p>
            </div>
            
            {credentials && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left dark:bg-blue-950 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Demo Credentials:</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                    <p className="font-medium text-blue-700 dark:text-blue-300">Supplier Account:</p>
                    <p><strong>Email:</strong> {credentials.supplier.email}</p>
                    <p><strong>Password:</strong> {credentials.supplier.password}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                    <p className="font-medium text-green-700 dark:text-green-300">Contractor Account:</p>
                    <p><strong>Email:</strong> {credentials.contractor.email}</p>
                    <p><strong>Password:</strong> {credentials.contractor.password}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>You can now test the role-based dashboard with these accounts</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SampleDataSetup;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SetupDemoUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleSetupUsers = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('setup-demo-users');
      
      if (error) {
        throw error;
      }

      setResults(data);
      toast({
        title: "Success",
        description: "Demo users have been set up successfully!",
      });
    } catch (error: any) {
      console.error('Setup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to setup demo users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Demo Users Setup</CardTitle>
        <CardDescription>
          Set up demo user accounts with working credentials for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleSetupUsers} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Setting up users...' : 'Setup Demo Users'}
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Setup Complete!</h3>
              <div className="space-y-1">
                <p><strong>Main Admin:</strong> {results.credentials["Main Admin"]}</p>
                <p><strong>Supplier:</strong> {results.credentials["Supplier"]}</p>
                <p><strong>Installer:</strong> {results.credentials["Installer"]}</p>
                <p><strong>Consumer:</strong> {results.credentials["Consumer"]}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Results:</h4>
              {results.results.map((result: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className={result.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    {result.email}: {result.status === 'success' ? result.action : result.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SetupDemoUsers;
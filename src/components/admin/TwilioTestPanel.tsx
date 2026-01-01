import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Phone, MessageSquare, Send } from "lucide-react";

interface CredentialStatus {
  TWILIO_ACCOUNT_SID: boolean;
  TWILIO_AUTH_TOKEN: boolean;
  TWILIO_PHONE_NUMBER: boolean;
  TWILIO_WHATSAPP_NUMBER: boolean;
}

interface TestResult {
  success: boolean;
  message: string;
  credentials?: CredentialStatus;
  account?: {
    friendlyName: string;
    status: string;
    type: string;
  };
  messageSid?: string;
}

export const TwilioTestPanel = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async (testType: "credentials" | "sms" | "whatsapp") => {
    setLoading(testType);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("test-twilio", {
        body: { 
          testType, 
          to: testType !== "credentials" ? testPhone : undefined 
        },
      });

      if (error) throw error;

      setResult(data);
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Test failed";
      toast.error(message);
      setResult({ success: false, message });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Twilio Integration Test
        </CardTitle>
        <CardDescription>
          Verify your Twilio credentials and send test messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credentials Test */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium">Verify Credentials</h4>
            <p className="text-sm text-muted-foreground">Check if all Twilio secrets are configured correctly</p>
          </div>
          <Button 
            onClick={() => runTest("credentials")} 
            disabled={loading !== null}
            variant="outline"
          >
            {loading === "credentials" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify"
            )}
          </Button>
        </div>

        {/* Credential Status */}
        {result?.credentials && (
          <div className="grid grid-cols-2 gap-2 p-4 bg-muted/30 rounded-lg">
            {Object.entries(result.credentials).map(([key, configured]) => (
              <div key={key} className="flex items-center gap-2">
                {configured ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm font-mono">{key}</span>
              </div>
            ))}
          </div>
        )}

        {/* Account Info */}
        {result?.account && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Account: {result.account.friendlyName}
            </p>
            <p className="text-xs text-muted-foreground">
              Status: {result.account.status} | Type: {result.account.type}
            </p>
          </div>
        )}

        {/* Message Tests */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">Send Test Message</h4>
          <Input
            placeholder="Phone number (e.g., +1234567890)"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => runTest("sms")}
              disabled={loading !== null || !testPhone}
              variant="default"
              className="flex-1"
            >
              {loading === "sms" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Test SMS
            </Button>
            <Button
              onClick={() => runTest("whatsapp")}
              disabled={loading !== null || !testPhone}
              variant="secondary"
              className="flex-1"
            >
              {loading === "whatsapp" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Test WhatsApp
            </Button>
          </div>
        </div>

        {/* Test Result */}
        {result && !result.credentials && (
          <div className={`p-4 rounded-lg ${result.success ? "bg-green-500/10 border border-green-500/20" : "bg-destructive/10 border border-destructive/20"}`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className={result.success ? "text-green-700 dark:text-green-400" : "text-destructive"}>
                {result.message}
              </span>
            </div>
            {result.messageSid && (
              <p className="text-xs text-muted-foreground mt-1">
                Message SID: {result.messageSid}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

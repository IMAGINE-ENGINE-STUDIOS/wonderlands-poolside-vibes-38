import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Phone, MessageSquare, Send, Mail, PhoneCall, Zap } from "lucide-react";

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

interface AllChannelsResult {
  success: boolean;
  message: string;
  results: {
    email: { success: boolean; messageSid?: string; error?: string };
    sms: { success: boolean; messageSid?: string; error?: string };
    whatsapp: { success: boolean; messageSid?: string; error?: string };
    voice: { success: boolean; messageSid?: string; error?: string };
  };
}

export const TwilioTestPanel = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const [allChannelsResult, setAllChannelsResult] = useState<AllChannelsResult | null>(null);

  const runTest = async (testType: "credentials" | "sms" | "whatsapp") => {
    setLoading(testType);
    setResult(null);
    setAllChannelsResult(null);

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

  const runAllChannelsTest = async () => {
    if (!testEmail || !testPhone) {
      toast.error("Please enter both email and phone number");
      return;
    }

    setLoading("all");
    setResult(null);
    setAllChannelsResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("test-all-channels", {
        body: { 
          email: testEmail,
          phone: testPhone,
          testMessage: "Your Wonderlands World automation system is working correctly!"
        },
      });

      if (error) throw error;

      setAllChannelsResult(data);
      
      if (data.success) {
        toast.success("All 4 channels tested successfully!");
      } else {
        toast.warning(data.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Test failed";
      toast.error(message);
      setAllChannelsResult({ 
        success: false, 
        message,
        results: {
          email: { success: false, error: message },
          sms: { success: false, error: message },
          whatsapp: { success: false, error: message },
          voice: { success: false, error: message },
        }
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Communication Integration Test
        </CardTitle>
        <CardDescription>
          Test all communication channels: Email, SMS, WhatsApp, and Voice calls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credentials Test */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium">Verify Twilio Credentials</h4>
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

        {/* Test All Channels Section */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Test All Channels
          </h4>
          <p className="text-sm text-muted-foreground">
            Send test messages via Email, SMS, WhatsApp, and Voice call simultaneously
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Email (e.g., sales@wonderlandsworld.com)"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              type="email"
            />
            <Input
              placeholder="Phone (e.g., +14077604873)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
          </div>
          <Button
            onClick={runAllChannelsTest}
            disabled={loading !== null || !testEmail || !testPhone}
            className="w-full bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600"
            size="lg"
          >
            {loading === "all" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Test All 4 Channels
          </Button>
        </div>

        {/* All Channels Results */}
        {allChannelsResult && (
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <h5 className="font-medium mb-3">Test Results:</h5>
            <div className="grid grid-cols-2 gap-3">
              {/* Email */}
              <div className={`p-3 rounded-lg flex items-center gap-2 ${allChannelsResult.results.email.success ? "bg-green-500/10 border border-green-500/20" : "bg-destructive/10 border border-destructive/20"}`}>
                <Mail className={`h-4 w-4 ${allChannelsResult.results.email.success ? "text-green-500" : "text-destructive"}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium">Email</span>
                  {allChannelsResult.results.email.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                  ) : (
                    <p className="text-xs text-destructive">{allChannelsResult.results.email.error}</p>
                  )}
                </div>
              </div>

              {/* SMS */}
              <div className={`p-3 rounded-lg flex items-center gap-2 ${allChannelsResult.results.sms.success ? "bg-green-500/10 border border-green-500/20" : "bg-destructive/10 border border-destructive/20"}`}>
                <MessageSquare className={`h-4 w-4 ${allChannelsResult.results.sms.success ? "text-green-500" : "text-destructive"}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium">SMS</span>
                  {allChannelsResult.results.sms.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                  ) : (
                    <p className="text-xs text-destructive">{allChannelsResult.results.sms.error}</p>
                  )}
                </div>
              </div>

              {/* WhatsApp */}
              <div className={`p-3 rounded-lg flex items-center gap-2 ${allChannelsResult.results.whatsapp.success ? "bg-green-500/10 border border-green-500/20" : "bg-destructive/10 border border-destructive/20"}`}>
                <Send className={`h-4 w-4 ${allChannelsResult.results.whatsapp.success ? "text-green-500" : "text-destructive"}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium">WhatsApp</span>
                  {allChannelsResult.results.whatsapp.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                  ) : (
                    <p className="text-xs text-destructive">{allChannelsResult.results.whatsapp.error}</p>
                  )}
                </div>
              </div>

              {/* Voice */}
              <div className={`p-3 rounded-lg flex items-center gap-2 ${allChannelsResult.results.voice.success ? "bg-green-500/10 border border-green-500/20" : "bg-destructive/10 border border-destructive/20"}`}>
                <PhoneCall className={`h-4 w-4 ${allChannelsResult.results.voice.success ? "text-green-500" : "text-destructive"}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium">Voice Call</span>
                  {allChannelsResult.results.voice.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                  ) : (
                    <p className="text-xs text-destructive">{allChannelsResult.results.voice.error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Individual Message Tests */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">Individual Channel Tests</h4>
          <div className="flex gap-2">
            <Button
              onClick={() => runTest("sms")}
              disabled={loading !== null || !testPhone}
              variant="outline"
              className="flex-1"
            >
              {loading === "sms" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Test SMS Only
            </Button>
            <Button
              onClick={() => runTest("whatsapp")}
              disabled={loading !== null || !testPhone}
              variant="outline"
              className="flex-1"
            >
              {loading === "whatsapp" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Test WhatsApp Only
            </Button>
          </div>
        </div>

        {/* Individual Test Result */}
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

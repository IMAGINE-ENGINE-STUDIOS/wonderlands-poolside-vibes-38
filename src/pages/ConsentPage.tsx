import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield, MessageSquare, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ConsentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    consentVoluntary: false,
    consentStorage: false,
    consentDataRates: false,
    consentNotCondition: false,
    consentOptOut: false,
    consentAuthorized: false,
  });

  const allConsentsChecked = 
    formData.consentVoluntary &&
    formData.consentStorage &&
    formData.consentDataRates &&
    formData.consentNotCondition &&
    formData.consentOptOut &&
    formData.consentAuthorized;

  const isFormValid = 
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phoneNumber.trim() !== "" &&
    allConsentsChecked;

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean);
      if (parts.length === 0) return '';
      if (parts.length === 1) return parts[0];
      if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
      return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phoneNumber: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Please complete all fields",
        description: "All fields and consent checkboxes are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically save to database
      // For now, we'll just show success
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Consent Received",
        description: "Thank you! Your consent has been recorded successfully.",
      });

      // Navigate to home or thank you page
      navigate("/?consent=success");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your consent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const consentItems = [
    {
      id: "consentVoluntary",
      label: "My phone number is being voluntarily provided.",
      checked: formData.consentVoluntary,
    },
    {
      id: "consentStorage",
      label: "Wonderlands World Experience LLC may store and process my phone number and related contact information.",
      checked: formData.consentStorage,
    },
    {
      id: "consentDataRates",
      label: "Message and data rates may apply.",
      checked: formData.consentDataRates,
    },
    {
      id: "consentNotCondition",
      label: "Consent is not a condition of purchase.",
      checked: formData.consentNotCondition,
    },
    {
      id: "consentOptOut",
      label: "I may opt out at any time by replying STOP to any message or by contacting Wonderlands World directly.",
      checked: formData.consentOptOut,
    },
    {
      id: "consentAuthorized",
      label: "I confirm that I am the authorized user of the phone number provided and that I am at least 18 years of age.",
      checked: formData.consentAuthorized,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Consent to Contact & Data Collection
            </h1>
            <p className="text-muted-foreground text-lg">
              Please review and provide your consent below
            </p>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-xl">SMS & Phone Consent</CardTitle>
                  <CardDescription className="mt-1">
                    Wonderlands World Experience LLC
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Consent Introduction */}
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p>
                    By providing my phone number and submitting this form, I expressly consent to be 
                    contacted by <strong className="text-foreground">Wonderlands World Experience LLC</strong> via 
                    phone calls and/or text messages (SMS) at the number provided, including for purposes 
                    related to estimates, project updates, scheduling, promotions, and customer service.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="(239) 555-0123"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      required
                      maxLength={14}
                    />
                  </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    I Acknowledge and Agree That:
                  </h3>
                  
                  <div className="space-y-4 bg-muted/30 rounded-lg p-4">
                    {consentItems.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, [item.id]: checked === true })
                          }
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={item.id}
                          className="text-sm leading-relaxed cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-6 text-lg"
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Submit Consent
                      </span>
                    )}
                  </Button>
                  
                  {!allConsentsChecked && (
                    <p className="text-sm text-muted-foreground text-center mt-3">
                      Please check all consent boxes to continue
                    </p>
                  )}
                </div>

                {/* Privacy Note */}
                <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                  <p>
                    Your information is protected and will only be used in accordance with our{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    . For questions, contact us at{" "}
                    <a href="tel:+12392570637" className="text-primary hover:underline">
                      (239) 257-0637
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConsentPage;

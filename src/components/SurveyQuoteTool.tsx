import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";
import { useToast } from "@/hooks/use-toast";
import { Upload, MapPin, Home, Waves, DollarSign, FileImage, Loader2, Settings, Camera, FileText, LogIn, Phone, Mail, Download, Printer } from "lucide-react";
import PoolCustomizationOptions from "./PoolCustomizationOptions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  dimensions?: string;
  depth?: string;
  image?: string;
}

interface PoolOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'waterline' | 'jets' | 'heating' | 'covers' | 'decorative';
}

interface SurveyQuoteToolProps {
  pool: Pool | null;
  isOpen: boolean;
  onClose: () => void;
  customProduct?: {
    name: string;
    price: number;
    type: string;
    image?: string;
  };
}

interface SurveyData {
  name: string;
  email: string;
  phone: string;
  address: string;
  yardSize: string;
  soilType: string;
  accessWidth: string;
  utilityLines: string;
  specialRequests: string;
  timeline: string;
  budget: string;
}

const SurveyQuoteTool = ({ pool, isOpen, onClose, customProduct }: SurveyQuoteToolProps) => {
  const { user } = useAuth();
  const [surveyData, setSurveyData] = useState<SurveyData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    yardSize: "",
    soilType: "",
    accessWidth: "",
    utilityLines: "",
    specialRequests: "",
    timeline: "",
    budget: ""
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<PoolOption[]>([]);
  const [currentStep, setCurrentStep] = useState<'survey' | 'options' | 'quote'>('survey');
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { toast } = useToast();
  // Removed GALA-GOODS integration

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    setIsProcessing(true);

    try {
      const imageElement = await loadImage(file);
      const processedBlob = await removeBackground(imageElement);
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
      toast({
        title: "Success!",
        description: "Background removed successfully from your yard photo.",
      });
    } catch (error) {
      console.error("Background removal failed:", error);
      toast({
        title: "Processing Note",
        description: "Background removal had issues, but we'll use your original image for the survey.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintQuote = () => {
    const quotationElement = document.getElementById('quotation-content');
    if (!quotationElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pool Quotation - Wonderlands</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 0.5in; }
            }
            .bg-gradient-to-r { background: linear-gradient(to right, #fb923c, #ec4899, #14b8a6); }
            .bg-gradient-to-br { background: linear-gradient(to bottom right, #fed7aa, #ccfbf1); }
            .text-white { color: white; }
            .text-orange-600 { color: #ea580c; }
            .text-teal-600 { color: #0d9488; }
            .text-orange-100 { color: #ffedd5; }
            .border-2 { border-width: 2px; }
            .border-orange-400 { border-color: #fb923c; }
            .rounded-lg { border-radius: 0.5rem; }
            .p-6 { padding: 1.5rem; }
            .p-4 { padding: 1rem; }
            .p-3 { padding: 0.75rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-6 { margin-top: 1.5rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .flex { display: flex; }
            .grid { display: grid; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-4xl { font-size: 2.25rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .w-full { width: 100%; }
            .h-16 { height: 4rem; }
            .h-48 { height: 12rem; }
            .object-cover { object-fit: cover; }
            .border { border-width: 1px; }
            .border-orange-200 { border-color: #fed7aa; }
            .border-teal-200 { border-color: #99f6e4; }
            .border-t { border-top-width: 1px; }
            .pt-2 { padding-top: 0.5rem; }
            .overflow-hidden { overflow: hidden; }
            .flex-shrink-0 { flex-shrink: 0; }
            .w-2 { width: 0.5rem; }
            .h-2 { height: 0.5rem; }
            .h-4 { width: 1rem; height: 1rem; }
            .mr-2 { margin-right: 0.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-1_5 { margin-top: 0.375rem; }
            .rounded-full { border-radius: 9999px; }
            .items-start { align-items: flex-start; }
            .flex-wrap { flex-wrap: wrap; }
          </style>
        </head>
        <body>
          ${quotationElement.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const calculateQuote = () => {
    if (!pool && !customProduct) return 0;
    
    let basePrice = pool?.price || customProduct?.price || 0;
    
    // Add selected options
    const optionsPrice = selectedOptions.reduce((total, option) => total + option.price, 0);
    basePrice += optionsPrice;
    
    // Florida-specific adjustments
    if (surveyData.soilType === "sand") basePrice *= 0.95; // Easier excavation
    if (surveyData.soilType === "clay") basePrice *= 1.1; // Harder excavation
    if (surveyData.accessWidth === "narrow") basePrice *= 1.05; // Access difficulty
    if (surveyData.yardSize === "large") basePrice *= 1.02; // More landscaping
    
    return Math.round(basePrice);
  };

  const getRecommendations = () => {
    if (!pool && !customProduct) return [];
    
    const recommendations = [];
    
    if (surveyData.soilType === "sand") {
      recommendations.push("Excellent drainage - perfect for Florida pools");
    }
    if (surveyData.yardSize === "large") {
      recommendations.push("Consider adding a spa or water features");
    }
    if (surveyData.accessWidth === "wide") {
      recommendations.push("Easy crane access - smoother installation");
    }
    
    recommendations.push("LED lighting package recommended for Florida evenings");
    recommendations.push("Salt water system popular in coastal Florida");
    
    return recommendations;
  };

  const saveQuotationToDatabase = async () => {
    if (!surveyData.name || !surveyData.email || !surveyData.address) {
      return null;
    }

    // Check if user is authenticated
    if (!user) {
      setShowAuthPrompt(true);
      return null;
    }

    setIsSaving(true);
    try {
      const quoteAmount = calculateQuote();
      const recommendations = getRecommendations();
      
      const quotationData = {
        user_id: user.id,
        name: surveyData.name,
        email: surveyData.email,
        phone: surveyData.phone || null,
        address: surveyData.address,
        yard_size: surveyData.yardSize || null,
        soil_type: surveyData.soilType || null,
        access_width: surveyData.accessWidth || null,
        utility_lines: surveyData.utilityLines || null,
        special_requests: surveyData.specialRequests || null,
        timeline: surveyData.timeline || null,
        budget: surveyData.budget || null,
        pool_model: pool?.model || customProduct?.name || null,
        pool_price: pool?.price || customProduct?.price || null,
        pool_category: pool?.category || customProduct?.type || null,
        selected_options: JSON.parse(JSON.stringify(selectedOptions)),
        total_quote_amount: quoteAmount,
        recommendations: recommendations,
        uploaded_image_url: uploadedImage ? URL.createObjectURL(uploadedImage) : null,
        processed_image_url: processedImage || null,
        gala_user_id: null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('user_quotations')
        .insert(quotationData)
        .select()
        .single();

      if (error) {
        console.error('Error saving quotation:', error);
        toast({
          title: "Save Failed",
          description: "We couldn't save your quotation, but you can still continue with the process.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Quotation Saved!",
        description: "Your information has been securely saved to our database.",
      });

      return data;
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast({
        title: "Save Failed",
        description: "We couldn't save your quotation, but you can still continue with the process.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitSurvey = () => {
    if (!surveyData.name || !surveyData.email || !surveyData.address || !surveyData.yardSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in your contact details, address and yard size.",
        variant: "destructive",
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(surveyData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep('options');
  };

  const handleContinueToQuote = async () => {
    // Save the quotation to database before showing the quote
    await saveQuotationToDatabase();
    setCurrentStep('quote');
  };

  const handleGetQuote = async () => {
    if (!surveyData.name || !surveyData.email || !surveyData.address || !surveyData.yardSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in your contact details, address and yard size.",
        variant: "destructive",
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(surveyData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Save the quotation to database and proceed to quote
    await saveQuotationToDatabase();
    setCurrentStep('quote');
  };

  if (!pool && !customProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Get Your Personalized Pool Quote
          </DialogTitle>
          <DialogDescription className="text-lg">
            Join 500+ Florida families who've created their dream oasis with Wonderlands
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'survey' ? (
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-teal/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Let's start with your details so we can send you a personalized quote
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={surveyData.name}
                    onChange={(e) => setSurveyData({...surveyData, name: e.target.value})}
                    className="focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={surveyData.email}
                    onChange={(e) => setSurveyData({...surveyData, email: e.target.value})}
                    className="focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={surveyData.phone}
                    onChange={(e) => setSurveyData({...surveyData, phone: e.target.value})}
                    className="focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Survey Form */}
            <Card className="border-coral/20 bg-gradient-to-br from-coral/5 to-orange/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5 text-coral" />
                  Property Information
                </CardTitle>
                <CardDescription>
                  Tell us about your property for an accurate Florida installation quote
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin size={16} className="text-coral" />
                      Property Address *
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, Miami, FL 33101"
                      value={surveyData.address}
                      onChange={(e) => setSurveyData({...surveyData, address: e.target.value})}
                      className="focus:border-coral"
                    />
                  </div>

                  <div>
                    <Label htmlFor="yardSize">Backyard Size *</Label>
                    <Select onValueChange={(value) => setSurveyData({...surveyData, yardSize: value})}>
                      <SelectTrigger className="focus:border-coral">
                        <SelectValue placeholder="Select yard size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (&lt; 1000 sq ft)</SelectItem>
                        <SelectItem value="medium">Medium (1000-2500 sq ft)</SelectItem>
                        <SelectItem value="large">Large (&gt; 2500 sq ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Select onValueChange={(value) => setSurveyData({...surveyData, timeline: value})}>
                      <SelectTrigger className="focus:border-coral">
                        <SelectValue placeholder="When do you want to start?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="3months">Within 3 months</SelectItem>
                        <SelectItem value="6months">Within 6 months</SelectItem>
                        <SelectItem value="planning">Just planning/researching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="soilType">Soil Type (Florida specific)</Label>
                    <Select onValueChange={(value) => setSurveyData({...surveyData, soilType: value})}>
                      <SelectTrigger className="focus:border-coral">
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sand">Sandy soil (common in coastal FL)</SelectItem>
                        <SelectItem value="clay">Clay soil</SelectItem>
                        <SelectItem value="mixed">Mixed soil</SelectItem>
                        <SelectItem value="unknown">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select onValueChange={(value) => setSurveyData({...surveyData, budget: value})}>
                      <SelectTrigger className="focus:border-coral">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                        <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
                        <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                        <SelectItem value="150k+">$150,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accessWidth">Equipment Access</Label>
                    <Select onValueChange={(value) => setSurveyData({...surveyData, accessWidth: value})}>
                      <SelectTrigger className="focus:border-coral">
                        <SelectValue placeholder="Access width to backyard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wide">Wide (&gt;10 ft)</SelectItem>
                        <SelectItem value="standard">Standard (8-10 ft)</SelectItem>
                        <SelectItem value="narrow">Narrow (&lt;8 ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="utilityLines">Known Utility Lines</Label>
                    <Input
                      id="utilityLines"
                      placeholder="e.g., Water, electric, septic"
                      value={surveyData.utilityLines}
                      onChange={(e) => setSurveyData({...surveyData, utilityLines: e.target.value})}
                      className="focus:border-coral"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Spa, lighting, decking, landscaping..."
                      value={surveyData.specialRequests}
                      onChange={(e) => setSurveyData({...surveyData, specialRequests: e.target.value})}
                      className="focus:border-coral"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* House Survey Upload */}
            <Card className="border-teal/20 bg-gradient-to-br from-teal/5 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-teal" />
                  House Survey & Site Photos
                </CardTitle>
                <CardDescription>
                  Upload photos of your property, existing surveys, or site plans for accurate planning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileImage size={16} className="text-teal" />
                      Property Survey Documents
                    </Label>
                    <div className="border-2 border-dashed border-teal/30 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                        id="survey-upload"
                      />
                      <label htmlFor="survey-upload" className="cursor-pointer">
                        <FileText className="h-6 w-6 mx-auto text-teal mb-2" />
                        <p className="text-sm">Upload survey documents</p>
                        <p className="text-xs text-muted-foreground">PDF, images, or documents</p>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera size={16} className="text-teal" />
                      Backyard Photos
                    </Label>
                    <div className="border-2 border-dashed border-teal/30 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        {isProcessing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-teal" />
                            <span className="text-sm">Processing...</span>
                          </div>
                        ) : uploadedImage ? (
                          <div className="space-y-2">
                            <p className="text-sm text-green-600">✓ Photos uploaded</p>
                            {processedImage && (
                              <img 
                                src={processedImage} 
                                alt="Processed" 
                                className="max-w-20 max-h-20 rounded border mx-auto"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="h-6 w-6 mx-auto text-teal" />
                            <p className="text-sm">Upload backyard photos</p>
                            <p className="text-xs text-muted-foreground">Multiple images supported</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-teal/5 p-3 rounded-lg">
                  <strong>Helpful tip:</strong> Include photos showing your backyard from different angles, 
                  any existing structures, utilities, or landscaping features that might affect installation.
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Free consultation • No obligation • Expert guidance</span>
              </div>
              <Button 
                onClick={handleGetQuote}
                variant="gradient"
                size="lg"
                className="w-full hover:scale-105 transition-all duration-300"
              >
                Get My Personalized Quote
              </Button>
              <p className="text-xs text-muted-foreground">
                * By submitting, you agree to receive follow-up communications about your pool project
              </p>
            </div>
          </div>
        ) : currentStep === 'options' ? (
          /* Pool Customization Options */
          <div className="space-y-6">
            <PoolCustomizationOptions onSelectionChange={setSelectedOptions} />
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setCurrentStep('survey')}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Back to Survey
              </Button>
              <Button 
                onClick={handleContinueToQuote}
                variant="gradient"
                size="lg"
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Quote...
                  </>
                ) : (
                  'Generate Quote'
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Professional Quotation Display */
          <div className="space-y-6">
            <div id="quotation-content" className="bg-white dark:bg-gray-900 border-2 border-orange-400 rounded-lg overflow-hidden">
              
              {/* Header with Logo */}
              <div className="bg-gradient-to-r from-orange-400 via-pink-400 to-teal-400 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="/lovable-uploads/e2ff3f3a-79d1-402e-b0c6-dcea2d4e720a.png" alt="Wonderlands Logo" className="h-16 w-16" />
                    <div>
                      <h1 className="text-2xl font-bold">POOL QUOTATION</h1>
                      <p className="text-orange-100">Your Dream Pool Awaits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Quote Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm">Valid for 30 days</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="p-6 bg-gradient-to-r from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-orange-600">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {surveyData.name}</p>
                      <p><span className="font-medium">Email:</span> {surveyData.email}</p>
                      <p><span className="font-medium">Phone:</span> {surveyData.phone}</p>
                      <p><span className="font-medium">Property Address:</span> {surveyData.address}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-teal-600">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-500" />
                        <span>(407) 760-4873</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-teal-500" />
                        <span>sales@wonderlandsworld.com</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Business Hours: Mon-Fri 8AM-6PM, Sat 9AM-4PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pool Details with Images */}
              <div className="p-6">
                <h3 className="font-bold text-xl mb-4 text-orange-600">Pool Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-orange-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Pool Model: {pool?.model || customProduct?.name}</h4>
                      {pool?.dimensions && <p className="text-sm">Dimensions: {pool.dimensions}</p>}
                      {pool?.depth && <p className="text-sm">Depth: {pool.depth}</p>}
                      <div className="flex justify-between mt-2 pt-2 border-t border-orange-200 dark:border-gray-600">
                        <span>Base Pool Price:</span>
                        <span className="font-semibold">${(pool?.price || customProduct?.price || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* Pavers Calculation */}
                    <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Pavers (3ft Perimeter)</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Standard 3-foot paver perimeter around pool included
                      </p>
                      {pool?.dimensions && (
                        <div className="text-xs">
                          <p>Pool dimensions: {pool.dimensions}</p>
                          <p>Paver area: {(() => {
                            const dims = pool.dimensions.split('x').map(d => parseInt(d.trim().replace(/['"]/g, '')));
                            const area = (dims[0] + 6) * (dims[1] + 6);
                            return `${area} sq ft`;
                          })()}</p>
                        </div>
                      )}
                      <div className="flex justify-between mt-2 pt-2 border-t border-teal-200 dark:border-gray-600">
                        <span>Paver Installation:</span>
                        <span className="font-semibold">Included</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {(pool?.image || customProduct?.image) && (
                      <div className="mb-4">
                        <img src={pool?.image || customProduct?.image} alt={pool?.model || customProduct?.name} className="w-full h-48 object-cover rounded-lg border border-orange-200" />
                        <p className="text-xs text-center mt-1 text-muted-foreground">{pool?.model || customProduct?.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Options with Images */}
                {selectedOptions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-3 text-teal-600">Selected Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedOptions.map((option, index) => (
                        <div key={index} className="border border-orange-200 dark:border-gray-600 rounded-lg p-3 bg-gradient-to-br from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
                          <h5 className="font-semibold text-sm">{option.name}</h5>
                          <p className="text-xs text-muted-foreground mb-2">{option.description}</p>
                          <div className="flex justify-between text-sm">
                            <span>Price:</span>
                            <span className="font-semibold text-teal-600">+${option.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Property Analysis */}
                <div className="mb-6">
                  <h4 className="font-bold text-lg mb-3 text-orange-600">Property Analysis & Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Property Details</h5>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Yard Size:</span> {surveyData.yardSize}</p>
                        <p><span className="font-medium">Soil Type:</span> {surveyData.soilType}</p>
                        <p><span className="font-medium">Access Width:</span> {surveyData.accessWidth}</p>
                        <p><span className="font-medium">Timeline:</span> {surveyData.timeline}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Our Recommendations</h5>
                      <ul className="text-sm space-y-1">
                        {getRecommendations().map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Total Investment */}
                <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-teal-500 p-6 rounded-lg text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">Total Investment</h3>
                  <div className="text-4xl font-bold mb-2">${calculateQuote().toLocaleString()}</div>
                  <p className="text-orange-100">Complete installation including permits, excavation, and 3ft paver perimeter</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white"
                    onClick={handlePrintQuote}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={() => setCurrentStep('options')}
                  >
                    Modify Options
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white"
                  >
                    Schedule Installation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Prompt */}
        {showAuthPrompt && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-primary" />
                  Sign In Required
                </CardTitle>
                <CardDescription>
                  Please sign in to save your quotation securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create an account or sign in to:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Save your quote for later reference</li>
                  <li>• Track your project progress</li>
                  <li>• Receive personalized recommendations</li>
                </ul>
                <div className="flex gap-2">
                  <Button 
                    variant="gradient" 
                    className="flex-1"
                    onClick={() => {
                      setShowAuthPrompt(false);
                      window.location.href = '/auth';
                    }}
                  >
                    Sign In / Register
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAuthPrompt(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SurveyQuoteTool;
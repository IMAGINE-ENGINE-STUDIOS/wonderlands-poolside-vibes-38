import { useState, useEffect } from "react";
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
import { calculatePaverPrice, calculatePaverArea } from "@/data/paverData";
import { OptimizedImage } from "./OptimizedImage";
import ImageCard from "./ImageCard";
import ExclusiveSaunaOffer from "./ExclusiveSaunaOffer";
const poolHeaterImg = "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png";
// Jets intentionally have no image in the quote
interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  dimensions?: string;
  depth?: string;
  image?: string;
  warrantyYears?: number | string;
}
interface PoolOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'waterline' | 'jets' | 'heating' | 'covers' | 'decorative' | 'screen-enclosure';
}
interface SurveyQuoteToolProps {
  pool: Pool | null;
  isOpen: boolean;
  onClose: () => void;
  extras?: any;
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
  deckWidth: string;
}
const SurveyQuoteTool = ({
  pool,
  isOpen,
  onClose,
  customProduct,
  extras
}: SurveyQuoteToolProps) => {
  const {
    user
  } = useAuth();
  
  // Load cached form data on mount
  const loadCachedData = (): Partial<SurveyData> => {
    try {
      const cacheKey = user?.id ? `quote_form_${user.id}` : 'quote_form_guest';
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error loading cached form data:', error);
    }
    return {};
  };

  const [surveyData, setSurveyData] = useState<SurveyData>(() => {
    const cached = loadCachedData();
    return {
      name: cached.name || "",
      email: cached.email || user?.email || "",
      phone: cached.phone || "",
      address: cached.address || "",
      yardSize: cached.yardSize || "",
      soilType: cached.soilType || "",
      accessWidth: cached.accessWidth || "",
      utilityLines: cached.utilityLines || "",
      specialRequests: cached.specialRequests || "",
      timeline: cached.timeline || "",
      budget: cached.budget || "",
      deckWidth: cached.deckWidth || "3"
    };
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<PoolOption[]>([]);
  const [currentStep, setCurrentStep] = useState<'survey' | 'options' | 'quote'>('survey');
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [saunaSelected, setSaunaSelected] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [editableQuoteAmount, setEditableQuoteAmount] = useState<number>(0);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const {
    toast
  } = useToast();
  // Removed GALA-GOODS integration

  // Cache form data whenever it changes
  useEffect(() => {
    if (isOpen && (surveyData.name || surveyData.email || surveyData.address)) {
      try {
        const cacheKey = user?.id ? `quote_form_${user.id}` : 'quote_form_guest';
        localStorage.setItem(cacheKey, JSON.stringify(surveyData));
      } catch (error) {
        console.error('Error caching form data:', error);
      }
    }
  }, [surveyData, user, isOpen]);

  // Toggle a global flag so other components (e.g., RightNavigation) can react when the quote dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.dataset.quoteOpen = 'true';
    } else {
      delete document.body.dataset.quoteOpen;
    }
    return () => {
      delete document.body.dataset.quoteOpen;
    };
  }, [isOpen]);
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
        description: "Background removed successfully from your yard photo."
      });
    } catch (error) {
      console.error("Background removal failed:", error);
      toast({
        title: "Processing Note",
        description: "Background removal had issues, but we'll use your original image for the survey.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handlePrintQuote = () => {
    const quoteElement = document.querySelector('[data-quote-content]');
    if (!quoteElement) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pool Configuration Quote</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                .print-hide { display: none !important; }
                body { 
                  margin: 0; 
                  padding: 20px;
                  font-family: system-ui, -apple-system, sans-serif;
                }
                * {
                  print-color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
              }
              @page {
                margin: 0.5in;
                size: auto;
              }
            </style>
          </head>
          <body>
            ${quoteElement.outerHTML}
            <script>
              window.addEventListener('load', function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 1000);
              });
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadPDF = async () => {
    const quoteElement = document.querySelector('[data-quote-content]') as HTMLElement;
    if (!quoteElement) return;

    try {
      // @ts-ignore - html2pdf is loaded via CDN
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 0.5,
        filename: `pool-quote-${Date.now()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(quoteElement).save();
      
      toast({
        title: "Success!",
        description: "Your quote has been downloaded as PDF."
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try printing instead.",
        variant: "destructive"
      });
    }
  };

  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleEmailQuote = async () => {
    if (!emailAddress) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const quoteData = {
        customerEmail: emailAddress,
        customerName: surveyData.name,
        poolModel: pool?.model || customProduct?.name || "Custom Product",
        totalAmount: calculateQuote(),
        selectedOptions: selectedOptions,
        extras: extras,
      };

      const { data, error } = await supabase.functions.invoke('send-quote-email', {
        body: quoteData
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: `Quote has been sent to ${emailAddress}`
      });
      setEmailAddress("");
    } catch (error) {
      console.error("Email sending failed:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  const handleEnterEditMode = () => {
    if (passcodeInput === "WONDERMAGIC") {
      setIsEditMode(true);
      setEditableQuoteAmount(calculateQuote());
      setPasscodeInput("");
      toast({
        title: "Edit Mode Enabled",
        description: "You can now edit the quote details."
      });
    } else {
      toast({
        title: "Invalid Passcode",
        description: "Please enter the correct passcode.",
        variant: "destructive"
      });
    }
  };

  const handleToggleSection = (sectionId: string) => {
    setHiddenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const calculateQuote = () => {
    if (!pool && !customProduct) return 0;
    
    // Check if this is a lanai product
    const isLanaiProduct = extras?.productType === 'lanai';
    
    // For lanai products, use the pre-calculated total price from LanaiSection
    if (isLanaiProduct && extras?.totalPrice) {
      return Math.round(extras.totalPrice);
    }
    
    let basePrice = pool?.price || customProduct?.price || 0;
    
    // Apply 10% discount to all pools (NOT lanai)
    if (pool) {
      basePrice = Math.round(basePrice * 0.90); // 10% discount for all pools
    }

    // Apply No Pavers discount if applicable (matching product cards) - NOT for lanai
    const hasNoPaversDiscount = extras && (extras as any).paverOption === 'No Pavers';
    if (hasNoPaversDiscount) {
      basePrice -= 2000;
    }

    // Add selected options (including screen enclosures with area-based pricing)
    const optionsPrice = selectedOptions.reduce((total, option) => {
      if (option.category === 'screen-enclosure') {
        // Calculate screen enclosure price based on enclosure footprint area
        const enclosureArea = getEnclosureArea();
        if (option.id.includes('standard-1-story')) {
          return total + enclosureArea * 15;
        } else if (option.id.includes('standard-2-story')) {
          return total + enclosureArea * 22;
        } else if (option.id.includes('premium-1-story')) {
          return total + enclosureArea * 20;
        } else if (option.id.includes('premium-2-story')) {
          return total + enclosureArea * 28;
        }
      }
      return total + option.price;
    }, 0);
    basePrice += optionsPrice;

    // Add extras from product card exactly as configured (matching Wonderlands Studio)
    const extrasTotal = (extras as any)?.extrasTotal ? Number((extras as any).extrasTotal) : 0;
    basePrice += extrasTotal;

    // Add sauna if selected (exclusive offer for eligible pools)
    if (saunaSelected) {
      const eligibleModels = ["Astoria", "Genesis", "Claremont", "Extreme 38"];
      const poolModel = pool?.model || "";
      const poolPrice = pool?.price || 0;
      const isEligible = eligibleModels.includes(poolModel) && poolPrice >= 70000;
      
      // For Extreme 38 and Astoria, sauna is included in base price
      const saunaIncludedModels = ["Extreme 38", "Astoria"];
      const isSaunaIncluded = saunaIncludedModels.includes(poolModel);
      
      if (isEligible && !isSaunaIncluded) {
        basePrice += 15000; // Sauna price for other models
      }
    }

    // Florida-specific adjustments
    if (surveyData.soilType === "sand") basePrice *= 0.95; // Easier excavation
    if (surveyData.soilType === "clay") basePrice *= 1.1; // Harder excavation
    if (surveyData.accessWidth === "narrow") basePrice *= 1.05; // Access difficulty
    if (surveyData.yardSize === "large") basePrice *= 1.02; // More landscaping

    return Math.round(basePrice);
  };
  const getPoolArea = () => {
    if (!pool?.dimensions) return 600; // Default pool area

    const dims = pool.dimensions.split('x').map(d => parseInt(d.trim().replace(/['"]/g, '')));
    const poolLength = dims[0] || 30;
    const poolWidth = dims[1] || 20;
    return poolLength * poolWidth;
  };

  // Calculate enclosure footprint as the pool plus the selected deck width around it
  const getEnclosureArea = () => {
    if (!pool?.dimensions) return 1100; // sensible default
    const dims = pool.dimensions.split('x').map(d => parseInt(d.trim().replace(/['"]/g, '')));
    const poolLength = dims[0] || 30;
    const poolWidth = dims[1] || 20;
    const deckWidth = parseInt(surveyData.deckWidth || '3');
    const totalArea = (poolLength + 2 * deckWidth) * (poolWidth + 2 * deckWidth);
    return totalArea; // enclosure covers entire footprint
  };
  const getIncludedItems = () => {
    return ["LED lights", "Water pump", "Waterfall", "Salt system", "FREE Finish of choice (included in pool price - promotional offer)"];
  };
  const saveQuotationToDatabase = async () => {
    if (!surveyData.name || !surveyData.email || !surveyData.address) {
      return null;
    }

    setIsSaving(true);
    try {
      const quoteAmount = calculateQuote();
      const recommendations = getIncludedItems();
      const quotationData = {
        user_id: user?.id || null, // Allow NULL for guest quotes
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
        deck_width: surveyData.deckWidth || null,
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
      const {
        data,
        error
      } = await supabase.from('user_quotations').insert(quotationData).select().single();
      if (error) {
        console.error('Error saving quotation:', error);
        toast({
          title: "Save Failed",
          description: "We couldn't save your quotation, but you can still continue with the process.",
          variant: "destructive"
        });
        return null;
      }
      toast({
        title: "Quote Saved!",
        description: user 
          ? "Your quote has been saved to your account."
          : "Your quote request has been submitted. We'll contact you at " + surveyData.email
      });
      return data;
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast({
        title: "Save Failed",
        description: "We couldn't save your quotation, but you can still continue with the process.",
        variant: "destructive"
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
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(surveyData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('options');
  };
  const handleContinueToQuote = async () => {
    // Save the quotation to database before showing the quote
    await saveQuotationToDatabase();
    setEditableQuoteAmount(calculateQuote());
    setCurrentStep('quote');
  };
  const handleGetQuote = async () => {
    if (!surveyData.name || !surveyData.email || !surveyData.address || !surveyData.yardSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in your contact details, address and yard size.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(surveyData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Save the quotation to database and proceed to quote
    await saveQuotationToDatabase();
    setEditableQuoteAmount(calculateQuote());
    setCurrentStep('quote');
  };
  const handleScheduleInstallation = async () => {
    // Ensure the quotation is saved and user is authenticated
    const saved = await saveQuotationToDatabase();
    if (!user) {
      // saveQuotationToDatabase will trigger auth prompt
      return;
    }
    
    // Open external quotation tool in new tab
    const quotationToolUrl = "https://app.ultimo.com/pool-configurator";
    window.open(quotationToolUrl, '_blank');
    
    // Also open Calendly scheduling link in new tab
    const calendlyUrl = "https://calendly.com/wonderlandsworlds/30min";
    setTimeout(() => {
      window.open(calendlyUrl, '_blank');
    }, 1000);
  };
  if (!pool && !customProduct) return null;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Get Your Personalized Pool Quote
          </DialogTitle>
          <DialogDescription className="text-lg">
            Join 500+ Florida families who've created their dream oasis with Wonderlands
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'survey' ? <div className="space-y-6">
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
                  <Input id="name" placeholder="John Smith" value={surveyData.name} onChange={e => setSurveyData({
                ...surveyData,
                name: e.target.value
              })} className="focus:border-primary" autoComplete="name" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={surveyData.email} onChange={e => setSurveyData({
                ...surveyData,
                email: e.target.value
              })} className="focus:border-primary" autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="(555) 123-4567" value={surveyData.phone} onChange={e => setSurveyData({
                ...surveyData,
                phone: e.target.value
              })} className="focus:border-primary" autoComplete="tel" />
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
                    <Input id="address" placeholder="123 Main St, Miami, FL 33101" value={surveyData.address} onChange={e => setSurveyData({
                  ...surveyData,
                  address: e.target.value
                })} className="focus:border-coral" autoComplete="street-address" />
                  </div>

                  <div>
                    <Label htmlFor="yardSize">Backyard Size *</Label>
                    <Select onValueChange={value => setSurveyData({
                  ...surveyData,
                  yardSize: value
                })}>
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
                    <Select onValueChange={value => setSurveyData({
                  ...surveyData,
                  timeline: value
                })}>
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
                    <Select onValueChange={value => setSurveyData({
                  ...surveyData,
                  soilType: value
                })}>
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
                    <Select onValueChange={value => setSurveyData({
                  ...surveyData,
                  budget: value
                })}>
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
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea id="specialRequests" placeholder="Spa, lighting, decking, landscaping..." value={surveyData.specialRequests} onChange={e => setSurveyData({
                  ...surveyData,
                  specialRequests: e.target.value
                })} className="focus:border-coral" />
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
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" id="survey-upload" />
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
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="photo-upload" />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        {isProcessing ? <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-teal" />
                            <span className="text-sm">Processing...</span>
                          </div> : uploadedImage ? <div className="space-y-2">
                            <p className="text-sm text-green-600">✓ Photos uploaded</p>
                            {processedImage && <img src={processedImage} alt="Processed" className="max-w-20 max-h-20 rounded border mx-auto" />}
                          </div> : <div className="space-y-1">
                            <Upload className="h-6 w-6 mx-auto text-teal" />
                            <p className="text-sm">Upload backyard photos</p>
                            <p className="text-xs text-muted-foreground">Multiple images supported</p>
                          </div>}
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
              <Button onClick={handleGetQuote} variant="gradient" size="lg" className="w-full hover:scale-105 transition-all duration-300">
                Get My Personalized Quote
              </Button>
              <p className="text-xs text-muted-foreground">
                * By submitting, you agree to receive follow-up communications about your pool project
              </p>
            </div>
          </div> : currentStep === 'options' ? (/* Pool Customization Options */
      <div className="space-y-6">
            <PoolCustomizationOptions onSelectionChange={options => setSelectedOptions(options)} />
            
            {/* Exclusive Sauna Offer for eligible pools */}
            {pool && (
              <ExclusiveSaunaOffer 
                poolModel={pool.model} 
                poolPrice={pool.price} 
                onAddToQuote={() => setSaunaSelected(!saunaSelected)}
                isSelected={saunaSelected}
              />
            )}
            
            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep('survey')} variant="outline" size="lg" className="flex-1">
                Back to Survey
              </Button>
              <Button onClick={handleContinueToQuote} variant="gradient" size="lg" className="flex-1" disabled={isSaving}>
                {isSaving ? <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Quote...
                  </> : 'Generate Quote'}
              </Button>
            </div>
          </div>) : (/* Professional Quotation Display */
      <div className="space-y-6 bg-white p-6" data-quote-content>
            <div className="bg-white border-2 border-orange-400 rounded-lg overflow-hidden">
              
              {/* Header with Logo */}
              <div className="bg-gradient-to-r from-orange-400 via-pink-400 to-teal-400 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ImageCard src="/lovable-uploads/1c6556f8-0571-434d-a877-e5152aee1726.png" alt="Wonderlands Logo" className="h-16 w-16" enableZoom={false} />
                    <div>
                      <h1 className="text-2xl font-bold">
                        {extras?.productType === 'lanai' ? 'LANAI QUOTATION' : 'POOL QUOTATION'}
                      </h1>
                      <p className="text-orange-100">
                        {extras?.productType === 'lanai' ? 'Your Dream Outdoor Living Space Awaits' : 'Your Dream Pool Awaits'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Quote Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm">Valid for 30 days</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              {!hiddenSections.has('customer-info') && (
                <div className="p-6 bg-gradient-to-r from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 relative">
                  {isEditMode && (
                    <button
                      onClick={() => handleToggleSection('customer-info')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove section"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-lg mb-3 text-orange-600">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {isEditMode ? (
                          <input
                            type="text"
                            value={surveyData.name}
                            onChange={(e) => setSurveyData({...surveyData, name: e.target.value})}
                            className="ml-2 px-2 py-1 border rounded"
                          />
                        ) : surveyData.name}</p>
                        <p><span className="font-medium">Email:</span> {isEditMode ? (
                          <input
                            type="email"
                            value={surveyData.email}
                            onChange={(e) => setSurveyData({...surveyData, email: e.target.value})}
                            className="ml-2 px-2 py-1 border rounded"
                          />
                        ) : surveyData.email}</p>
                        <p><span className="font-medium">Phone:</span> {isEditMode ? (
                          <input
                            type="text"
                            value={surveyData.phone}
                            onChange={(e) => setSurveyData({...surveyData, phone: e.target.value})}
                            className="ml-2 px-2 py-1 border rounded"
                          />
                        ) : surveyData.phone}</p>
                        <p><span className="font-medium">Property Address:</span> {isEditMode ? (
                          <input
                            type="text"
                            value={surveyData.address}
                            onChange={(e) => setSurveyData({...surveyData, address: e.target.value})}
                            className="ml-2 px-2 py-1 border rounded w-full"
                          />
                        ) : surveyData.address}</p>
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
              )}

              {/* Product Details with Images */}
              <div className="p-6">
                {(() => {
                  const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                  const isLanaiProduct = extras?.productType === 'lanai';
                  
                  return (
                    <>
                      <h3 className="font-bold text-xl mb-4 text-orange-600">
                        {isLanaiProduct ? 'Lanai Specifications' : isPoolProduct ? 'Pool Specifications' : 'Product Details'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          {/* Lanai-specific details */}
                          {isLanaiProduct ? (
                            <div className="bg-gradient-to-br from-orange-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg space-y-3">
                              <h4 className="font-semibold mb-2">
                                Lanai Type: {customProduct?.name || 'Custom Lanai'}
                              </h4>
                              
                              {extras?.squareFootage && (
                                <div className="flex justify-between py-1 border-b border-orange-200">
                                  <span className="text-sm">Coverage Area:</span>
                                  <span className="text-sm font-semibold">{extras.squareFootage} sq ft</span>
                                </div>
                              )}
                              
                              {extras?.pricePerSqFt && (
                                <div className="flex justify-between py-1 border-b border-orange-200">
                                  <span className="text-sm">Price Per Sq Ft:</span>
                                  <span className="text-sm font-semibold">${extras.pricePerSqFt}</span>
                                </div>
                              )}
                              
                              {extras?.frameColor && (
                                <div className="flex justify-between py-1 border-b border-orange-200">
                                  <span className="text-sm">Frame Color:</span>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded border border-gray-300"
                                      style={{ backgroundColor: extras.frameColor.toLowerCase() }}
                                    />
                                    <span className="text-sm font-semibold capitalize">{extras.frameColor}</span>
                                  </div>
                                </div>
                              )}
                              
                              {extras?.foundationType && (
                                <div className="flex justify-between py-1 border-b border-orange-200">
                                  <span className="text-sm">Foundation Type:</span>
                                  <span className="text-sm font-semibold capitalize">{extras.foundationType}</span>
                                </div>
                              )}
                              
                              {extras?.paverOption && extras.foundationType === 'pavers' && (
                                <div className="py-1">
                                  <p className="text-sm font-medium mb-1">Paver Selection:</p>
                                  <div className="flex items-center gap-2">
                                    {extras.paverImage && (
                                      <div className="w-12 h-12 rounded border overflow-hidden">
                                        <OptimizedImage 
                                          src={extras.paverImage} 
                                          alt={extras.paverOption}
                                          className="w-full h-full object-cover"
                                          sizeConfig="thumbnail"
                                        />
                                      </div>
                                    )}
                                    <span className="text-sm font-semibold">{extras.paverOption}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-between mt-2 pt-2 border-t border-orange-200 dark:border-gray-600">
                                <span className="font-medium">Total Price:</span>
                                <span className="font-semibold text-lg">${(extras?.totalPrice || customProduct?.price || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-orange-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">
                                {isPoolProduct ? 'Pool Model' : 'Product'}: {pool?.model || customProduct?.name}
                              </h4>
                              {pool?.dimensions && <p className="text-sm">Dimensions: {pool.dimensions}</p>}
                              {pool?.depth && <p className="text-sm">Depth: {pool.depth}</p>}
                              {customProduct && !isPoolProduct && customProduct.type && (
                                <p className="text-sm">Type: {customProduct.type}</p>
                              )}
                              <div className="flex justify-between mt-2 pt-2 border-t border-orange-200 dark:border-gray-600">
                                <span>Base Price:</span>
                                <span className="font-semibold">${(pool?.price || customProduct?.price || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Delivery & Installation - Only for non-pool, non-lanai products */}
                          {!isPoolProduct && !isLanaiProduct && (
                            <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 text-teal-600">Delivery & Installation</h4>
                              <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">Arrives:</span>
                                  <span className="text-teal-600">October 24, 2025</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">Installation:</span>
                                  <span className="text-teal-600">Same day</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Includes delivery and professional installation
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Pavers Calculation with Image - Only for pool products, NOT lanai */}
                          {isPoolProduct && !isLanaiProduct && (
                            <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Paver Deck ({surveyData.deckWidth || 3}ft Width)</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {(() => {
                              const hasPavers = extras?.extrasBreakdown?.some((item: any) => item.name.includes('sq ft') && !item.name.includes('Screen Enclosure'));
                              return hasPavers ? "Custom paver selection with chargeable area" : "Standard 3-foot paver deck included in base price";
                            })()}
                              </p>
                              {pool?.dimensions && (() => {
                            const dims = pool.dimensions.split('x').map(d => parseInt(d.trim().replace(/['"]/g, '')));
                            const poolLength = dims[0] || 0;
                            const poolWidth = dims[1] || 0;
                            const deckWidth = parseInt(surveyData.deckWidth || "3");
                            const poolArea = poolLength * poolWidth;
                            const totalArea = (poolLength + 2 * deckWidth) * (poolWidth + 2 * deckWidth);
                            const freeArea = (poolLength + 6) * (poolWidth + 6) - poolArea;
                            const chargeableArea = totalArea - poolArea - freeArea;
                            return <div className="text-xs space-y-1 bg-teal-50 dark:bg-gray-700 p-2 rounded border mb-2">
                                    <p className="font-medium">Area Calculation:</p>
                                    <p>• Pool area: {poolArea} sq ft</p>
                                    <p>• Total deck area: {totalArea - poolArea} sq ft</p>
                                    <p>• Free 3ft perimeter: {freeArea} sq ft</p>
                                    <p>• Chargeable area: {Math.max(0, chargeableArea)} sq ft</p>
                                  </div>;
                          })()}
                              
                              {extras?.extrasBreakdown && (() => {
                            const paverItem = extras.extrasBreakdown.find((item: any) => item.name.includes('sq ft') && !item.name.includes('Screen Enclosure'));
                            if (paverItem) {
                              const selectedPaverName = paverItem.name.split(' (')[0];
                              const paverImages = {
                                'Appian Adobe': '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png',
                                'Appian Amaretto': '/lovable-uploads/5e630c2e-3a3f-49bf-b5d5-425a69959416.png',
                                'Appian Harvest Blend': '/lovable-uploads/a5fa0931-4c93-4c42-81b9-e8ad3f61e659.png',
                                'Appian Knightsbridge': '/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.png',
                                'Appian Napoli': '/lovable-uploads/1a896779-5d8f-4f85-b26b-ab797c2afac4.png',
                                'Appian Rio': '/lovable-uploads/b7d9216e-3489-4a50-827d-974a5b6481be.png',
                                'Appian Slate': '/lovable-uploads/fcc4d668-4682-47d8-89c4-5cba819f80ed.png',
                                'Appian Titanium': '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png',
                                'Appian Charco': '/lovable-uploads/6d98de42-0baa-42af-a04c-3b16e3dcb6a6.png',
                                'Catalina Grana Amaretto': '/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png',
                                'Catalina Grana Napoli': '/lovable-uploads/c16269fd-9db6-4791-8cef-9aaf0f5e972a.png',
                                'Catalina Grana Rio': '/lovable-uploads/d8bded3c-41a9-4591-b0bc-3e20a9977602.png',
                                'Catalina Grana Scandina Gray': '/lovable-uploads/638972ac-6a43-41e7-ae3c-bce58ab9417b.png',
                                'Catalina Grana Slate': '/lovable-uploads/d85c2bf0-0a66-4aa0-9f64-5e76b511b428.png',
                                'Catalina Grana Titanium': '/lovable-uploads/6aefa246-2c01-43a1-8a58-e195ec3355dc.png',
                                'Catalina Napoli': '/lovable-uploads/d07719a5-6046-4bbc-94f7-d0390932f6c7.png',
                                'Catalina Slate': '/lovable-uploads/3f98fbbb-b09a-4dbc-82f5-5d811564b9f4.png',
                                'Catalina Titanium': '/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png',
                                'Premier Pavers': '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
                                'Belgard Pavers': '/lovable-uploads/46d142d3-b106-406d-9867-9bf7b63fd469.png',
                                'Tremron Pavers': '/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png',
                                'Cambridge Pavers': '/lovable-uploads/8033278d-a737-4b1d-84bf-fd0ac9126406.png'
                              };
                              const paverImage = paverImages[selectedPaverName] || paverImages['Premier Pavers'];
                              return <div className="mb-3 p-2 border border-teal-200 rounded-md">
                                      <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-md overflow-hidden border">
                                          <OptimizedImage 
                                            src={paverImage} 
                                            alt={selectedPaverName} 
                                            className="w-full h-full object-cover"
                                            sizeConfig="thumbnail"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{selectedPaverName}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {paverItem.name.match(/\((.*?)\)/)?.[1] || 'Custom area'}
                                          </p>
                                          <p className="text-xs text-teal-600 font-semibold">
                                            ${paverItem.price.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>;
                            }
                            return null;
                          })()}
                            </div>
                          )}
                        </div>
                        
                        {/* Product Image - ALWAYS DISPLAY */}
                        <div>
                          <div className="mb-4">
                            <ImageCard 
                              src={pool?.image || customProduct?.image || ''} 
                              alt={pool?.model || customProduct?.name || 'Product'} 
                              className="w-full h-48 rounded-lg border border-orange-200" 
                              objectFit="cover" 
                              enableZoom={true} 
                            />
                            <p className="text-xs text-center mt-1 text-muted-foreground">
                              {pool?.model || customProduct?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Exclusive Sauna Offer for Eligible Pools */}
                {(() => {
                  const eligibleModels = ["Astoria", "Genesis", "Claremont"];
                  const poolModel = pool?.model || "";
                  const poolPrice = pool?.price || 0;
                  const isEligible = eligibleModels.includes(poolModel) && poolPrice >= 70000;
                  
                  if (!isEligible) return null;
                  
                  const handleAddSaunaToQuote = () => {
                    setSaunaSelected(true);
                    toast({
                      title: "Sauna Added",
                      description: "Barrel Sauna has been added to your quote.",
                    });
                  };
                  
                  return (
                    <div className="mb-6">
                      <ExclusiveSaunaOffer 
                        poolModel={poolModel} 
                        poolPrice={poolPrice} 
                        onAddToQuote={handleAddSaunaToQuote}
                      />
                    </div>
                  );
                })()}

                {/* Selected Options with Images */}
                {selectedOptions.length > 0 && <div className="mb-6">
                    <h4 className="font-bold text-lg mb-3 text-teal-600">Selected Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedOptions.map((option, index) => {
                  let displayPrice = option.price;

                  // Calculate area-based pricing for screen enclosures
                  if (option.category === 'screen-enclosure') {
                    const enclosureArea = getEnclosureArea();
                    if (option.id.includes('standard-1-story')) {
                      displayPrice = enclosureArea * 15;
                    } else if (option.id.includes('standard-2-story')) {
                      displayPrice = enclosureArea * 22;
                    } else if (option.id.includes('premium-1-story')) {
                      displayPrice = enclosureArea * 20;
                    } else if (option.id.includes('premium-2-story')) {
                      displayPrice = enclosureArea * 28;
                    }
                  }
                  return <div key={index} className="border border-orange-200 dark:border-gray-600 rounded-lg p-3 bg-gradient-to-br from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
                            {/* Add image for screen enclosures */}
                            {option.category === 'screen-enclosure' && <div className="mb-3">
                                <OptimizedImage 
                                  src="/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png" 
                                  alt={option.name} 
                                  className="w-full h-20 rounded-md border border-orange-200 object-cover"
                                  sizeConfig="quoteImage"
                                />
                              </div>}
                            <h5 className="font-semibold text-sm">{option.name}</h5>
                            <p className="text-xs text-muted-foreground mb-2">{option.description}</p>
                            {option.category === 'screen-enclosure' && <p className="text-xs text-blue-600 mb-2">
                                Calculated area: {getEnclosureArea()} sq ft
                              </p>}
                            <div className="flex justify-between text-sm">
                              <span>Price:</span>
                              <span className="font-semibold text-teal-600">+${displayPrice.toLocaleString()}</span>
                            </div>
                          </div>;
                })}
                    </div>
                  </div>}

                {/* Product Card Selected Items */}
                {extras?.extrasBreakdown && extras.extrasBreakdown.length > 0 && <div className="mb-6">
                    <h4 className="font-bold text-lg mb-3 text-coral-600">Added Features from Product Card</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {extras.extrasBreakdown.filter((item: any) => !(item.name.includes('sq ft') && !item.name.includes('Screen Enclosure'))).map((item: any, index: number) => <div key={index} className="border border-coral-200 dark:border-gray-600 rounded-lg p-3 bg-gradient-to-br from-coral-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
                          {/* Display item image - use actual image if available or fallback based on type */}
                          {(() => {
                    // First check if item has its own image property
                    if (item.image) {
                      return <div className="mb-3">
                                 <ImageCard src={item.image} alt={item.name} className="w-full h-20 rounded-md border border-coral-200" objectFit="cover" enableZoom={false} />
                               </div>;
                    }

                    // Fallback to type-based image mapping
                    let itemImage = null;
                    if (item.name.includes('Heater') || item.name.includes('Heat Pump') || item.name.includes('Gas Heater') || item.name.includes('Solar Heater')) {
                      itemImage = poolHeaterImg;
                    } else if (item.name.includes('Cover')) {
                      const coverImages = {
                        'Eclipse Automatic Cover': '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png',
                        'CS3000 Safety Cover': '/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.png',
                        'Infinity 4000 Smart Cover': '/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.png',
                        'Atom Loop-Loc Cover': '/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.png'
                      };
                      itemImage = coverImages[item.name] || '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png';
                    } else if (item.name.includes('Spa')) {
                      itemImage = '/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.png';
                    } else if (item.name.includes('Tanning Ledge')) {
                      itemImage = '/lovable-uploads/2af253b1-b9be-487f-a998-476d396772c4.png';
                    } else if (item.name.includes('Barrel Sauna') || item.name.includes('Sauna')) {
                      itemImage = '/lovable-uploads/barrel-sauna.webp';
                    } else if (item.name.includes('Liner')) {
                      itemImage = '/lovable-uploads/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.png';
                    } else if (item.name.includes('Jets')) {
                      itemImage = null;
                    } else if (item.name.includes('Finish')) {
                      itemImage = '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png';
                    } else if (item.name.includes('Tiles') || item.name.includes('Tile')) {
                      itemImage = '/lovable-uploads/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.png';
                    } else if (item.name.includes('Screen Enclosure')) {
                      itemImage = '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png';
                    } else if (item.name.includes('Concrete Construction')) {
                      itemImage = '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png';
                    } else if (item.name.includes('sq ft') && !item.name.includes('Screen Enclosure')) {
                      // Map paver names to their actual images - comprehensive mapping
                      const paverName = item.name.split(' (')[0];
                      const paverImages = {
                        // Appian Collection
                        'Appian Adobe': '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png',
                        'Appian Amaretto': '/lovable-uploads/5e630c2e-3a3f-49bf-b5d5-425a69959416.png',
                        'Appian Harvest Blend': '/lovable-uploads/a5fa0931-4c93-4c42-81b9-e8ad3f61e659.png',
                        'Appian Knightsbridge': '/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.png',
                        'Appian Napoli': '/lovable-uploads/1a896779-5d8f-4f85-b26b-ab797c2afac4.png',
                        'Appian Rio': '/lovable-uploads/b7d9216e-3489-4a50-827d-974a5b6481be.png',
                        'Appian Slate': '/lovable-uploads/fcc4d668-4682-47d8-89c4-5cba819f80ed.png',
                        'Appian Titanium': '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png',
                        'Appian Charco': '/lovable-uploads/6d98de42-0baa-42af-a04c-3b16e3dcb6a6.png',
                        // Catalina Grana Collection
                        'Catalina Grana Amaretto': '/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png',
                        'Catalina Grana Napoli': '/lovable-uploads/c16269fd-9db6-4791-8cef-9aaf0f5e972a.png',
                        'Catalina Grana Rio': '/lovable-uploads/d8bded3c-41a9-4591-b0bc-3e20a9977602.png',
                        'Catalina Grana Scandina Gray': '/lovable-uploads/638972ac-6a43-41e7-ae3c-bce58ab9417b.png',
                        'Catalina Grana Slate': '/lovable-uploads/d85c2bf0-0a66-4aa0-9f64-5e76b511b428.png',
                        'Catalina Grana Titanium': '/lovable-uploads/6aefa246-2c01-43a1-8a58-e195ec3355dc.png',
                        // Catalina Collection
                        'Catalina Napoli': '/lovable-uploads/d07719a5-6046-4bbc-94f7-d0390932f6c7.png',
                        'Catalina Slate': '/lovable-uploads/3f98fbbb-b09a-4dbc-82f5-5d811564b9f4.png',
                        'Catalina Titanium': '/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png',
                        // Fallback brands
                        'Premier Pavers': '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
                        'Belgard Pavers': '/lovable-uploads/46d142d3-b106-406d-9867-9bf7b63fd469.png',
                        'Tremron Pavers': '/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png',
                        'Cambridge Pavers': '/lovable-uploads/8033278d-a737-4b1d-84bf-fd0ac9126406.png'
                      };
                      itemImage = paverImages[paverName] || paverImages['Premier Pavers'];
                    } else {
                      itemImage = '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png';
                    }
                    return itemImage ? <div className="mb-3">
                                 <ImageCard src={itemImage} alt={item.name} className="w-full h-20 rounded-md border border-coral-200" objectFit="cover" enableZoom={false} />
                               </div> : null;
                  })()}
                          <h5 className="font-semibold text-sm">{item.name}</h5>
                          <div className="flex justify-between text-sm mt-2">
                            <span>Price:</span>
                            <span className="font-semibold text-coral-600">+${item.price.toLocaleString()}</span>
                          </div>
                        </div>)}
                    </div>
                    <div className="mt-4 p-3 bg-gradient-to-r from-coral-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Added Features:</span>
                        <span className="font-bold text-coral-600 text-lg">+${extras.extrasTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>}

                {/* Sauna Selection */}
                {saunaSelected && (() => {
                  const eligibleModels = ["Astoria", "Genesis", "Claremont", "Extreme 38"];
                  const poolModel = pool?.model || "";
                  const poolPrice = pool?.price || 0;
                  const isEligible = eligibleModels.includes(poolModel) && poolPrice >= 70000;
                  
                  if (!isEligible) return null;
                  
                  return (
                    <div className="mb-6">
                      <h4 className="font-bold text-lg mb-3 text-amber-600">🔥 Exclusive Sauna Add-On</h4>
                      <div className="border border-amber-200 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-md overflow-hidden border">
                            <ImageCard 
                              src="/lovable-uploads/barrel-sauna.webp" 
                              alt="Barrel Sauna" 
                              className="w-full h-full object-cover"
                              enableZoom={false}
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg">Barrel Sauna</h5>
                            <p className="text-sm text-muted-foreground mb-2">
                              Premium 4-person barrel sauna with 6kW heater, LED lighting, and all accessories included
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <span>• Ball-and-socket lumber</span>
                              <span>• Tempered glass features</span>
                              <span>• Stainless steel hardware</span>
                              <span>• Interior LED lighting</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {poolModel === "Extreme 38" || poolModel === "Astoria" ? (
                              <>
                                <div className="text-lg font-bold text-green-600">INCLUDED</div>
                                <div className="text-xs text-muted-foreground">No Additional Cost</div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-bold text-amber-600">+$15,000</div>
                                <div className="text-xs text-muted-foreground">Exclusive Offer</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Items Included - For pool products OR lanai with included features */}
                {(() => {
                  const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                  const isLanaiProduct = extras?.productType === 'lanai';
                  const lanaiIncludedFeatures = extras?.includedFeatures || [];
                  
                  if (!isPoolProduct && !isLanaiProduct) return null;
                  
                  return (
                     <div className="mb-6">
                      <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg">
                        <h4 className="font-bold text-lg mb-3 text-orange-600">
                          {isLanaiProduct ? 'LANAI INCLUDES' : 'ALL POOLS INCLUDE'}
                        </h4>
                        {isLanaiProduct && lanaiIncludedFeatures.length > 0 ? (
                          <ul className="text-sm space-y-1">
                            {lanaiIncludedFeatures.map((feature: string, idx: number) => (
                              <li key={idx}>• {feature}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm">
                            {getIncludedItems().filter(item => !item.startsWith("FREE")).join(", ")}
                          </p>
                        )}
                        <p className="text-xs mt-2 opacity-80">Architectural Design, Construction and permiting is included in all products, unless project scope is modified.</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Pool Construction Details - Only for pool products, NOT lanai */}
                {(() => {
                  const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                  const isLanaiProduct = extras?.productType === 'lanai';
                  
                  if (!isPoolProduct || isLanaiProduct || !extras?.concreteConstruction) return null;
                  
                  return (
                     <div className="mb-6">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-lg mb-2 text-blue-600">Pool Construction</h4>
                        <p className="text-sm mb-2">
                          Selected concrete construction: reinforced concrete with steel rebar and a high-quality interior finish. It offers full design flexibility for shapes, steps, benches, and features. Like all pools, it performs best with proper maintenance and balanced water chemistry.
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Reinforced concrete shell with rebar</li>
                          <li>• Customizable design, steps, benches, and features</li>
                          <li>• Built to meet local codes and engineering specifications</li>
                          <li>• <span className="font-semibold text-amber-600">15 Years Structural Integrity, 5 Years Finishing Warranty</span> for concrete construction</li>
                        </ul>
                      </div>
                    </div>
                  );
                })()}

                {/* Warranty Information - Only for pool products, NOT lanai */}
                {(() => {
                  const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                  const isLanaiProduct = extras?.productType === 'lanai';
                  
                  if (!isPoolProduct || isLanaiProduct) return null;
                  
                  return (
                     <div className="mb-6">
                      <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-green-200">
                        <div className="text-sm space-y-2">
                          {extras?.concreteConstruction ? <div>
                              <p className="font-semibold">Concrete Pool Construction:</p>
                              <p className="text-sm"><span className="text-amber-600 font-semibold">15 Years Structural Integrity</span></p>
                              <p className="text-sm"><span className="text-amber-600 font-semibold">5 Years Finishing</span></p>
                              <p className="text-xs text-muted-foreground">
                                Comprehensive warranty covering structural integrity and finishing for concrete construction
                              </p>
                            </div> : <div>
                              <p className="font-semibold">Pool Structure: <span className="text-green-600">{pool?.warrantyYears || "Lifetime"}</span></p>
                              <p className="text-xs text-muted-foreground">
                                {pool?.model === "Astoria" ? "Life Warranty - Special Offer" : "Standard structural warranty coverage"}
                              </p>
                            </div>}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Estimated Build/Installation Time */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-2 text-blue-600">
                      {(() => {
                        const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                        return isPoolProduct ? 'Estimated Build Time' : 'Installation Time';
                      })()}
                    </h4>
                    <p className="text-sm">
                      {(() => {
                        const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                        
                        if (!isPoolProduct) {
                          return "Arrives October 24, 2025 • Installation same day";
                        }
                        
                        // Pool product logic
                        if (extras?.concreteConstruction) {
                          return "18+ weeks";
                        }
                        
                        if (pool?.model === "Madre Perla") {
                          return "18+ weeks";
                        }
                        
                        return "16+ weeks";
                      })()}
                    </p>
                    {(() => {
                      const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                      
                      if (!isPoolProduct) return null;
                      
                      if (extras?.concreteConstruction || pool?.model === "Madre Perla") {
                        return (
                          <p className="text-xs mt-1 text-muted-foreground">
                            Extended timeline due to custom concrete construction and engineering requirements
                          </p>
                        );
                      }
                      
                      if (pool?.model === "Extreme 27" || (pool as any)?.brand === "Gilmer Glass") {
                        if (!extras?.concreteConstruction) {
                          return (
                            <p className="text-xs mt-1 text-muted-foreground">
                              Fiber pool construction timeline includes delivery and installation
                            </p>
                          );
                        }
                      }
                      
                      return null;
                    })()}
                  </div>
                </div>

                 <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-teal-500 p-6 rounded-lg text-white text-center">
                   <h3 className="text-2xl font-bold mb-2">Total Investment</h3>
                   {isEditMode ? (
                     <input
                       type="number"
                       value={editableQuoteAmount}
                       onChange={(e) => setEditableQuoteAmount(Number(e.target.value))}
                       className="text-4xl font-bold bg-white text-gray-900 px-4 py-2 rounded w-full text-center"
                     />
                   ) : (
                     <div className="text-4xl font-bold">${(isEditMode ? editableQuoteAmount : calculateQuote()).toLocaleString()}</div>
                   )}
                 </div>

                {/* Action Buttons */}
                <div className="space-y-4 mt-6 print-hide">
                  {/* Edit Mode Controls */}
                  {!isEditMode ? (
                    <div className="flex gap-3 justify-center items-center mb-4">
                      <Input
                        type="password"
                        placeholder="Enter passcode to edit"
                        value={passcodeInput}
                        onChange={(e) => setPasscodeInput(e.target.value)}
                        className="max-w-xs"
                        onKeyDown={(e) => e.key === 'Enter' && handleEnterEditMode()}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleEnterEditMode}
                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        Edit Quote
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-center mb-4">
                      <Button 
                        variant="default"
                        onClick={() => setIsEditMode(false)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Done Editing
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button variant="default" className="bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white" onClick={handlePrintQuote}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Quote
                    </Button>
                    <Button variant="default" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white" onClick={handleDownloadPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50" onClick={() => setCurrentStep('options')}>
                      Modify Options
                    </Button>
                    <Button variant="default" className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white" onClick={handleScheduleInstallation}>
                      Schedule Installation
                    </Button>
                  </div>
                  
                  {/* Email Quote Section */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button 
                      variant="default" 
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                      onClick={handleEmailQuote}
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Email Quote
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>)}

        {/* Authentication Prompt */}
        {showAuthPrompt && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
                  <Button variant="gradient" className="flex-1" onClick={() => {
                setShowAuthPrompt(false);
                window.location.href = '/auth';
              }}>
                    Sign In / Register
                  </Button>
                  <Button variant="outline" onClick={() => setShowAuthPrompt(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>}
      </DialogContent>
    </Dialog>;
};
export default SurveyQuoteTool;
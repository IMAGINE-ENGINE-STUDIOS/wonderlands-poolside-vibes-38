import * as React from "react";
const { useState, useEffect } = React;
import { useNavigate } from "react-router-dom";
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
import { Upload, MapPin, Home, Waves, DollarSign, FileImage, Loader2, Settings, Camera, FileText, LogIn, Phone, Mail, Download, Printer, Receipt, Clock, CreditCard } from "lucide-react";
import PoolCustomizationOptions from "./PoolCustomizationOptions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculatePaverPrice, calculatePaverArea } from "@/data/paverData";
import { cacheCustomerFromQuote } from "@/hooks/useCustomerCache";
import { OptimizedImage } from "./OptimizedImage";
import ImageCard from "./ImageCard";
import ExclusiveSaunaOffer from "./ExclusiveSaunaOffer";
import ImageUploadOverlay, { type ImageCropSettings } from "./ImageUploadOverlay";
const poolHeaterImg = "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png";
import fenceQuoteImage from "@/assets/fence-quote-image.jpg";
import aluminumPanelImage from "@/assets/aluminum-panel-2.jpg";
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
  const navigate = useNavigate();
  
  // Debug: Log all received props when component opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 SurveyQuoteTool OPENED WITH:', {
        pool: pool,
        poolPrice: pool?.price,
        customProduct: customProduct,
        extrasTotal: extras?.extrasTotal,
        extrasBreakdown: extras?.extrasBreakdown,
        extras: extras
      });
    }
  }, [isOpen, pool, customProduct, extras]);
  
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
  const [editableTexts, setEditableTexts] = useState<Record<string, string>>({});
  const [editablePrices, setEditablePrices] = useState<Record<string, number>>({});
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [imageCropSettings, setImageCropSettings] = useState<Record<string, ImageCropSettings>>({});

  // Custom extra items added by admin in Edit Mode
  type CustomQuoteItem = { id: string; name: string; price: number; image?: string };
  const [customItems, setCustomItems] = useState<CustomQuoteItem[]>([]);

  const handleAddCustomItem = () => {
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setCustomItems(prev => [...prev, { id, name: 'Custom Item', price: 0 }]);
  };
  const handleUpdateCustomItem = (id: string, patch: Partial<CustomQuoteItem>) => {
    setCustomItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));
  };
  const handleRemoveCustomItem = (id: string) => {
    setCustomItems(prev => prev.filter(i => i.id !== id));
  };

  const handleImageOverride = (key: string, dataUrl: string) => {
    setImageOverrides(prev => ({ ...prev, [key]: dataUrl }));
    // If this image override is for a custom item, persist it onto the item
    if (key.startsWith('custom-')) {
      const id = key.slice('custom-'.length);
      setCustomItems(prev => prev.map(i => (i.id === id ? { ...i, image: dataUrl } : i)));
    }
  };
  const handleCropChange = (key: string, settings: ImageCropSettings) => {
    setImageCropSettings(prev => ({ ...prev, [key]: settings }));
  };
  
  // Autofill state
  const [autofillPasscode, setAutofillPasscode] = useState("");
  const [isAutofillUnlocked, setIsAutofillUnlocked] = useState(false);
  const [previousCustomers, setPreviousCustomers] = useState<any[]>([]);
  const [showAutofillPanel, setShowAutofillPanel] = useState(false);
  
  const {
    toast
  } = useToast();

  // Autofill: unlock customer database with passcode
  const handleUnlockAutofill = async () => {
    if (autofillPasscode === "MAGICWONDER") {
      const { data, error } = await supabase
        .from('customer_cache' as any)
        .select('*')
        .order('name');
      if (!error && data) {
        setPreviousCustomers(data as any[]);
        setIsAutofillUnlocked(true);
        toast({ title: "Database Unlocked", description: "Select a customer to autofill the form." });
      } else {
        toast({ title: "Error", description: "Could not fetch customer data.", variant: "destructive" });
      }
    } else {
      toast({ title: "Invalid Passcode", description: "Please enter the correct passcode.", variant: "destructive" });
    }
    setAutofillPasscode("");
  };

  const handleAutofillCustomer = (customerId: string) => {
    const customer = previousCustomers.find((c: any) => c.id === customerId);
    if (customer) {
      setSurveyData(prev => ({
        ...prev,
        name: customer.name || prev.name,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone,
        address: customer.address || prev.address,
      }));
      toast({ title: "Form Autofilled", description: `Data for ${customer.name} applied.` });
    }
  };


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
      // Reset editable quote amount when dialog opens to ensure fresh calculation
      setEditableQuoteAmount(0);
      // Reset custom items when dialog opens
      setCustomItems([]);
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
      // Use the same HTML structure as print for consistent look
      const printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pool Configuration Quote</title>
            <script src="https://cdn.tailwindcss.com"><\/script>
            <style>
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
              .no-print, .print\\:hidden { display: none !important; }
            </style>
          </head>
          <body>
            ${quoteElement.outerHTML}
          </body>
        </html>
      `;

      // Create a hidden iframe to render the same HTML as print
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.width = '816px'; // Letter width at 96dpi
      iframe.style.height = '1056px';
      document.body.appendChild(iframe);
      
      iframe.contentDocument?.open();
      iframe.contentDocument?.write(printHtml);
      iframe.contentDocument?.close();

      // Wait for content to render then capture with html2pdf
      await new Promise(resolve => setTimeout(resolve, 1500));

      // @ts-ignore
      const html2pdfModule = await import('html2pdf.js');
      // @ts-ignore
      const html2pdf = html2pdfModule.default;

      const opt = {
        margin: 0.5,
        filename: `quote-${pool?.model || customProduct?.name || 'product'}-${Date.now()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          allowTaint: true
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(iframe.contentDocument?.body).save();
      document.body.removeChild(iframe);
      
      toast({
        title: "Success!",
        description: "Your quote has been downloaded as PDF."
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleStripeCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const totalAmount = isEditMode && editableQuoteAmount > 0 ? editableQuoteAmount : calculateQuote();
      const productName = pool?.model || customProduct?.name || 'Custom Quote';
      
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          productId: `quote-${Date.now()}`,
          productName: `${productName} - Quote`,
          price: totalAmount,
          quantity: 1,
        }
      });
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

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
  const getInstallationTimeText = () => {
    const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
    
    if (!isPoolProduct) {
      const deliveryDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      return `Arrives ${deliveryDate} • Installation same day`;
    }
    
    if (extras?.concreteConstruction || pool?.model === "Madre Perla" || pool?.model === "Winderview" || pool?.model === "Pacific Ridge" || pool?.model === "Maxima" || pool?.model === "Cape Coral") {
      return "18+ weeks";
    }
    
    return "16+ weeks";
  };

  const handleEnterEditMode = () => {
    if (passcodeInput === "WONDERMAGIC") {
      setIsEditMode(true);
      // Initialize editableQuoteAmount with current calculated value
      const currentQuote = calculateQuote();
      setEditableQuoteAmount(currentQuote);
      
      // Initialize all editable texts with current values if not already set
      setEditableTexts(prev => ({
        'customer-info-title': prev['customer-info-title'] || 'Customer Information',
        'contact-info-title': prev['contact-info-title'] || 'Contact Information',
        'contact-phone': prev['contact-phone'] || '(407) 760-4873',
        'contact-email': prev['contact-email'] || 'sales@wonderlandsworld.com',
        'business-hours': prev['business-hours'] || 'Business Hours: Mon-Fri 8AM-6PM, Sat 9AM-4PM',
        'product-title': prev['product-title'] || (extras?.productType === 'lanai' ? 'Lanai Specifications' : pool ? 'Pool Specifications' : 'Product Details'),
        'includes-title': prev['includes-title'] || (extras?.productType === 'lanai' ? 'LANAI INCLUDES' : 'ALL POOLS INCLUDE'),
        'includes-content': prev['includes-content'] || getIncludedItems().filter(item => !item.startsWith("FREE")).join(", "),
        'disclaimer': prev['disclaimer'] || 'Architectural Design, Construction and permiting is included in all products, unless project scope is modified.',
        'total-title': prev['total-title'] || 'Total Investment',
        'paver-deck-title': prev['paver-deck-title'] || 'Paver Deck',
        'paver-deck-description': prev['paver-deck-description'] || "Custom paver selection with full area pricing",
        'installation-time-title': prev['installation-time-title'] || (pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct?.type || '')) ? 'Estimated Build Time' : 'Installation Time'),
        'installation-time-text': prev['installation-time-text'] || getInstallationTimeText(),
        ...prev
      }));
      
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

  const handleSaveEditedQuote = async () => {
    setIsEditMode(false);
    // Wait for state to update so the DOM reflects the changes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Auto-download the updated PDF
    await handleDownloadPDF();
    
    toast({
      title: "Quote Updated & Downloaded",
      description: "Your updated quote has been saved and downloaded as a new PDF file."
    });
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
    
    // Get the base price from pool or customProduct
    let basePrice = pool?.price || customProduct?.price || 0;
    
    console.log('💰 calculateQuote START:', { 
      poolPrice: pool?.price, 
      customProductPrice: customProduct?.price,
      basePrice,
      extrasFromProps: extras?.extrasTotal,
      totalPriceFromExtras: extras?.totalPrice
    });

    // If extras.totalPrice is provided (from SimplifiedGilmerPoolCard), use it directly
    // This avoids double-counting extras
    if (extras?.totalPrice && !isLanaiProduct) {
      console.log('💰 Using pre-calculated totalPrice:', extras.totalPrice);
      return Math.round(extras.totalPrice);
    }

    // Apply Concrete Patio discount if applicable (matching product cards) - NOT for lanai
    const hasConcretePatioPricing = extras && (extras as any).paverOption === 'Concrete Patio';
    if (hasConcretePatioPricing) {
      basePrice -= 2000;
    }

    // Add selected options (including screen enclosures with area-based pricing)
    const optionsPrice = selectedOptions.reduce((total, option) => {
      if (option.category === 'screen-enclosure') {
        const enclosureArea = getEnclosureArea();
        // Determine rate based on option type
        const rate = option.id?.includes('2-story') || option.id?.includes('premium') ? 26 
          : option.id?.includes('deluxe') ? 24 : 22;
        return total + enclosureArea * rate;
      }
      return total + option.price;
    }, 0);
    basePrice += optionsPrice;

    // Add extras from WonderlandsStudio breakdown (now passed synchronously via ref)
    const extrasTotal = extras?.extrasTotal ? Number(extras.extrasTotal) : 0;
    basePrice += extrasTotal;
    
    console.log('💰 calculateQuote FINAL:', { originalBasePrice: pool?.price || customProduct?.price, extrasTotal, optionsPrice, total: basePrice });

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
    return ["LED lights", "Pentair pool equipment", "Salt system", "FREE Finish of choice (included in pool price - promotional offer)"];
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
        user_id: user?.id || null,
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
      // Cache customer for admin search (deduplicates by email)
      cacheCustomerFromQuote({
        name: surveyData.name,
        email: surveyData.email,
        phone: surveyData.phone,
        address: surveyData.address,
        quoteAmount: quoteAmount,
        poolModel: pool?.model || customProduct?.name || undefined,
      });

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
    const quoteAmount = calculateQuote();
    setEditableQuoteAmount(quoteAmount);
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
    const quoteAmount = calculateQuote();
    setEditableQuoteAmount(quoteAmount);
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
  
  const handleGenerateInvoice = async () => {
    // Validate required fields - no login required
    if (!surveyData.name || !surveyData.email || !surveyData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, email, and address before generating an invoice.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingInvoice(true);
    console.log('📄 Generating invoice...', { surveyData });
    
    try {
      // Calculate quote amount and prepare line items
      const totalAmount = editableQuoteAmount || calculateQuote();
      const lineItems: any[] = [];
      
      // Add pool/product as line item
      if (pool) {
        lineItems.push({
          description: `${pool.model} Pool Installation`,
          quantity: 1,
          unit_price: pool.price,
          total: pool.price
        });
      } else if (customProduct) {
        lineItems.push({
          description: customProduct.name,
          quantity: 1,
          unit_price: customProduct.price,
          total: customProduct.price
        });
      }
      
      // Add extras as line items
      if (extras?.extrasBreakdown) {
        extras.extrasBreakdown.forEach((extra: any) => {
          lineItems.push({
            description: extra.name,
            quantity: 1,
            unit_price: extra.price,
            total: extra.price
          });
        });
      }
      
      // Add sauna if selected
      if (saunaSelected) {
        const eligibleModels = ["Astoria", "Genesis", "Claremont", "Extreme 38"];
        const poolModel = pool?.model || "";
        const poolPrice = pool?.price || 0;
        const isEligible = eligibleModels.includes(poolModel) && poolPrice >= 70000;
        
        if (isEligible) {
          const isIncluded = poolModel === "Extreme 38" || poolModel === "Astoria";
          if (!isIncluded) {
            lineItems.push({
              description: "Barrel Sauna (Exclusive Add-On)",
              quantity: 1,
              unit_price: 15000,
              total: 15000
            });
          } else {
            lineItems.push({
              description: "Barrel Sauna (INCLUDED)",
              quantity: 1,
              unit_price: 0,
              total: 0
            });
          }
        }
      }
      
      // Generate invoice data
      const invoiceDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Get next invoice number
      const { data: invoiceNumberData, error: rpcError } = await supabase.rpc('generate_invoice_number');
      if (rpcError) throw rpcError;
      const invoiceNumber = invoiceNumberData || `INV-${Date.now()}`;
      
      // Create invoice in database
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          customer_name: surveyData.name,
          customer_email: surveyData.email,
          customer_phone: surveyData.phone || '',
          customer_address: surveyData.address,
          invoice_date: invoiceDate,
          due_date: dueDate,
          line_items: lineItems,
          subtotal: totalAmount,
          tax_rate: 0,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: totalAmount,
          payment_status: 'unpaid',
          payment_terms: 'Net 30',
          status: 'draft',
          notes: surveyData.specialRequests || 'Thank you for choosing Wonderlands Pools & Spas!',
          terms_conditions: 'Payment is due within 30 days of invoice date. A 50% deposit is required to begin work. Final payment is due upon completion and inspection.',
          created_by: user?.id || null,
          user_id: user?.id || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Invoice Generated!",
        description: `Invoice ${invoice.invoice_number} has been created. Redirecting...`,
      });
      
      // Close the dialog and navigate to the invoice page
      onClose();
      navigate(`/invoice/${invoice.id}`);
      
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };
  
  if (!pool && !customProduct) return null;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto pb-8">
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
            {/* Admin Autofill Access */}
            <div className="space-y-3 p-4 border border-muted rounded-lg bg-muted/30">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="autofill-passcode" className="text-xs font-mono text-muted-foreground">Admin Autofill</Label>
                  <Input
                    id="autofill-passcode"
                    type="password"
                    placeholder="Enter passcode to unlock..."
                    value={autofillPasscode}
                    onChange={e => setAutofillPasscode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUnlockAutofill()}
                    className="h-9"
                  />
                </div>
                <Button onClick={handleUnlockAutofill} variant="outline" size="sm" className="h-9">
                  Unlock
                </Button>
              </div>
              {isAutofillUnlocked && previousCustomers.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-sm text-muted-foreground">Select Previous Customer</Label>
                  <Select onValueChange={handleAutofillCustomer}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Search or select a customer..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[200] max-h-60">
                      {previousCustomers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} — {c.email}{c.phone ? ` — ${c.phone}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

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
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleGetQuote} variant="gradient" size="lg" className="flex-1 hover:scale-105 transition-all duration-300">
                  Get My Personalized Quote
                </Button>
                <Button 
                  onClick={() => {
                    if (!surveyData.name) setSurveyData(prev => ({ ...prev, name: 'Guest' }));
                    setCurrentStep('quote');
                  }}
                  variant="outline" 
                  size="lg" 
                  className="flex-1 border-primary text-primary hover:bg-primary/5"
                >
                  Skip to Quote →
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                * By submitting, you agree to receive follow-up communications about your pool project
              </p>
            </div>
          </div>
        ) : currentStep === 'options' ? (
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
          </div>
        ) : (
          <div>
            <div className="space-y-6 bg-white text-gray-900 p-6 quote-force-light" data-quote-content>
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
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden"
                      title="Remove section"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-lg mb-3 text-orange-600">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editableTexts['customer-info-title'] || 'Customer Information'}
                            onChange={(e) => setEditableTexts({...editableTexts, 'customer-info-title': e.target.value})}
                            className="bg-white border rounded px-2 py-1 w-full"
                          />
                        ) : (editableTexts['customer-info-title'] || 'Customer Information')}
                      </h3>
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
                      <h3 className="font-bold text-lg mb-3 text-teal-600">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editableTexts['contact-info-title'] || 'Contact Information'}
                            onChange={(e) => setEditableTexts({...editableTexts, 'contact-info-title': e.target.value})}
                            className="bg-white border rounded px-2 py-1 w-full"
                          />
                        ) : (editableTexts['contact-info-title'] || 'Contact Information')}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-orange-500" />
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableTexts['contact-phone'] || '(407) 760-4873'}
                              onChange={(e) => setEditableTexts({...editableTexts, 'contact-phone': e.target.value})}
                              className="px-2 py-1 border rounded flex-1"
                            />
                          ) : (
                            <span>{editableTexts['contact-phone'] || '(407) 760-4873'}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-teal-500" />
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableTexts['contact-email'] || 'sales@wonderlandsworld.com'}
                              onChange={(e) => setEditableTexts({...editableTexts, 'contact-email': e.target.value})}
                              className="px-2 py-1 border rounded flex-1"
                            />
                          ) : (
                            <span>{editableTexts['contact-email'] || 'sales@wonderlandsworld.com'}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableTexts['business-hours'] || 'Business Hours: Mon-Fri 8AM-6PM, Sat 9AM-4PM'}
                              onChange={(e) => setEditableTexts({...editableTexts, 'business-hours': e.target.value})}
                              className="px-2 py-1 border rounded w-full text-xs"
                            />
                          ) : (editableTexts['business-hours'] || 'Business Hours: Mon-Fri 8AM-6PM, Sat 9AM-4PM')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Details with Images */}
              {!hiddenSections.has('product-details') && (
              <div className="p-6 relative">
                {isEditMode && (
                  <button
                    onClick={() => handleToggleSection('product-details')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                    title="Remove section"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {(() => {
                  const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                  const isLanaiProduct = extras?.productType === 'lanai';
                  
                  return (
                    <>
                      <h3 className="font-bold text-xl mb-4 text-orange-600">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editableTexts['product-title'] || (isLanaiProduct ? 'Lanai Specifications' : isPoolProduct ? 'Pool Specifications' : 'Product Details')}
                            onChange={(e) => setEditableTexts({...editableTexts, 'product-title': e.target.value})}
                            className="bg-white border rounded px-2 py-1 w-full"
                          />
                        ) : (editableTexts['product-title'] || (isLanaiProduct ? 'Lanai Specifications' : isPoolProduct ? 'Pool Specifications' : 'Product Details'))}
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
                                  {isEditMode ? (
                                    <span className="text-sm font-semibold">$<input type="number" value={editablePrices['lanai-sqft'] ?? extras.pricePerSqFt} onChange={(e) => setEditablePrices(prev => ({...prev, 'lanai-sqft': Number(e.target.value)}))} className="w-20 px-1 py-0.5 border rounded text-right inline-block" /></span>
                                  ) : (
                                    <span className="text-sm font-semibold">${editablePrices['lanai-sqft'] ?? extras.pricePerSqFt}</span>
                                  )}
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
                                        <ImageUploadOverlay imageKey="paver-thumb" isEditMode={isEditMode} imageOverrides={imageOverrides} onImageOverride={handleImageOverride} cropSettings={imageCropSettings} onCropChange={handleCropChange}>
                                          <OptimizedImage 
                                            src={imageOverrides['paver-thumb'] || extras.paverImage} 
                                            alt={extras.paverOption}
                                            className="w-full h-full object-cover"
                                            sizeConfig="thumbnail"
                                          />
                                        </ImageUploadOverlay>
                                      </div>
                                    )}
                                    <span className="text-sm font-semibold">{extras.paverOption}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-between mt-2 pt-2 border-t border-orange-200 dark:border-gray-600">
                                <span className="font-medium">Total Price:</span>
                                {isEditMode ? (
                                  <span className="font-semibold text-lg">$<input type="number" value={editablePrices['lanai-total'] ?? (extras?.totalPrice || customProduct?.price || 0)} onChange={(e) => setEditablePrices(prev => ({...prev, 'lanai-total': Number(e.target.value)}))} className="w-28 px-1 py-0.5 border rounded text-right inline-block" /></span>
                                ) : (
                                  <span className="font-semibold text-lg">${(editablePrices['lanai-total'] ?? extras?.totalPrice ?? customProduct?.price ?? 0).toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          ) : customProduct?.type !== 'paver' ? (
                            <div className="bg-gradient-to-br from-orange-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">
                                {isPoolProduct ? 'Pool Model' : 'Product'}: {isEditMode ? (
                                  <input type="text" value={editableTexts['product-name'] ?? (pool?.model || customProduct?.name)} onChange={(e) => setEditableTexts(prev => ({...prev, 'product-name': e.target.value}))} className="px-1 py-0.5 border rounded inline-block" />
                                ) : (editableTexts['product-name'] ?? pool?.model ?? customProduct?.name)}
                              </h4>
                              {pool?.dimensions && <p className="text-sm">Dimensions: {isEditMode ? (
                                <input type="text" value={editableTexts['product-dims'] ?? pool.dimensions} onChange={(e) => setEditableTexts(prev => ({...prev, 'product-dims': e.target.value}))} className="px-1 py-0.5 border rounded inline-block" />
                              ) : (editableTexts['product-dims'] ?? pool.dimensions)}</p>}
                              {pool?.depth && <p className="text-sm">Depth: {isEditMode ? (
                                <input type="text" value={editableTexts['product-depth'] ?? pool.depth} onChange={(e) => setEditableTexts(prev => ({...prev, 'product-depth': e.target.value}))} className="px-1 py-0.5 border rounded inline-block" />
                              ) : (editableTexts['product-depth'] ?? pool.depth)}</p>}
                              {customProduct && !isPoolProduct && customProduct.type && (
                                <p className="text-sm">Type: {customProduct.type}</p>
                              )}
                              <div className="flex justify-between mt-2 pt-2 border-t border-orange-200 dark:border-gray-600">
                                <span>Base Price:</span>
                                {isEditMode ? (
                                  <input
                                    type="number"
                                    value={editablePrices['base-price'] ?? (pool?.price || customProduct?.price || 0)}
                                    onChange={(e) => setEditablePrices(prev => ({...prev, 'base-price': Number(e.target.value)}))}
                                    className="w-32 px-2 py-1 border rounded text-right font-semibold"
                                  />
                                ) : (
                                  <span className="font-semibold">${(editablePrices['base-price'] ?? pool?.price ?? customProduct?.price ?? 0).toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          ) : null}
                          
                          {/* Delivery & Installation - Only for non-pool, non-lanai, non-paver products */}
                          {!isPoolProduct && !isLanaiProduct && customProduct?.type !== 'paver' && (
                            <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 text-teal-600">Delivery & Installation</h4>
                              <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">Arrives:</span>
                                  <span className="text-teal-600">
                                    {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </span>
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
                          
                          {/* Pavers and Screen Enclosure Details - Show for pool products OR standalone paver products, hide when empty */}
                          {!hiddenSections.has('paver-deck') && (isPoolProduct || customProduct?.type === 'paver') && !isLanaiProduct && extras?.extrasBreakdown && (extras.extrasBreakdown.some((item: any) => item.name.includes('sq ft') && !item.name.includes('Screen Enclosure')) || extras.extrasBreakdown.some((item: any) => item.name.includes('Screen Enclosure'))) && (
                            <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg relative space-y-4">
                              {isEditMode && (
                                <button
                                  onClick={() => handleToggleSection('paver-deck')}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                                  title="Remove section"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              
                              {/* Paver Deck Section */}
                              {extras?.extrasBreakdown && (() => {
                                console.log('🔍 ALL EXTRAS BREAKDOWN:', extras.extrasBreakdown);
                                const paverItem = extras.extrasBreakdown.find((item: any) => item.name.includes('sq ft') && !item.name.includes('Screen Enclosure'));
                                console.log('🟢 PAVER ITEM:', paverItem);
                                if (paverItem) {
                                  const selectedPaverName = (paverItem.name.split(' (')[0] || '').trim() || 'Concrete Deck';
                                  const areaMatch = paverItem.name.match(/(\d+(?:\.\d+)?)\s*sq\s*ft/i);
                                  const paverArea = areaMatch ? Math.round(parseFloat(areaMatch[1])) : 0;
                                  
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
                                    'Catalina Grana Titanium': '/lovable-uploads/6aefa246-2c01-43a1-4a58-e195ec3355dc.png',
                                    'Catalina Napoli': '/lovable-uploads/d07719a5-6046-4bbc-94f7-d0390932f6c7.png',
                                    'Catalina Slate': '/lovable-uploads/3f98fbbb-b09a-4dbc-82f5-5d811564b9f4.png',
                                    'Catalina Titanium': '/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png',
                                    'Premier Pavers': '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
                                    'Belgard Pavers': '/lovable-uploads/46d142d3-b106-406d-9867-9bf7b63fd469.png',
                                    'Tremron Pavers': '/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png',
                                    'Cambridge Pavers': '/lovable-uploads/8033278d-a737-4b1d-84bf-fd0ac9126406.png'
                                  };
                                  const paverImage = paverItem.image || paverImages[selectedPaverName] || paverImages['Premier Pavers'];
                                  
                                  return (
                                    <div className="border-b border-teal-300 dark:border-gray-600 pb-4">
                                      <h4 className="font-semibold mb-3 text-lg">Paver Deck</h4>
                                      <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-teal-200 dark:border-gray-700">
                                        <div className="w-24 h-24 rounded-md overflow-hidden border-2 border-teal-300 flex-shrink-0">
                                          <ImageUploadOverlay imageKey="paver-deck" isEditMode={isEditMode} imageOverrides={imageOverrides} onImageOverride={handleImageOverride} cropSettings={imageCropSettings} onCropChange={handleCropChange}>
                                            <OptimizedImage 
                                              src={imageOverrides['paver-deck'] || paverImage} 
                                              alt={selectedPaverName} 
                                              className="w-full h-full object-cover"
                                              sizeConfig="thumbnail"
                                            />
                                          </ImageUploadOverlay>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                          <p className="font-semibold text-sm text-foreground">{selectedPaverName}</p>
                                          <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Area:</span> {isEditMode ? (
                                              <input type="number" value={editablePrices['paver-area'] ?? paverArea} onChange={(e) => setEditablePrices(prev => ({...prev, 'paver-area': Number(e.target.value)}))} className="w-20 px-1 py-0.5 border rounded text-right inline-block ml-1" />
                                            ) : (editablePrices['paver-area'] ?? paverArea).toLocaleString()} sq ft
                                          </p>
                                          <p className="text-base font-bold text-teal-700 dark:text-teal-400">
                                            Total Cost: {isEditMode ? (
                                              <span>$<input type="number" value={editablePrices['paver-price'] ?? paverItem.price} onChange={(e) => setEditablePrices(prev => ({...prev, 'paver-price': Number(e.target.value)}))} className="w-28 px-1 py-0.5 border rounded text-right inline-block" /></span>
                                            ) : `$${(editablePrices['paver-price'] ?? paverItem.price).toLocaleString()}`}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                              
                              {/* Screen Enclosure Section */}
                              {extras?.extrasBreakdown && (() => {
                                const enclosureItem = extras.extrasBreakdown.find((item: any) => item.name.includes('Screen Enclosure'));
                                console.log('🔵 SCREEN ENCLOSURE ITEM:', enclosureItem);
                                if (enclosureItem) {
                                  const areaMatch = enclosureItem.name.match(/(\d+(?:\.\d+)?)\s*sq\s*ft/i);
                                  const enclosureArea = areaMatch ? Math.round(parseFloat(areaMatch[1])) : 0;
                                  const enclosureType = enclosureItem.name.includes('Wonder Cage') ? 'Wonder Cage (Standard)' 
                                    : enclosureItem.name.includes('Deluxe') ? 'Deluxe' 
                                    : 'Premium';
                                  const enclosureImage = enclosureItem.image || '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png';
                                  
                                  return (
                                    <div>
                                      <h4 className="font-semibold mb-3 text-lg">Screen Enclosure</h4>
                                      <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-orange-200 dark:border-gray-700">
                                        <div className="w-24 h-24 rounded-md overflow-hidden border-2 border-orange-300 flex-shrink-0">
                                          <ImageUploadOverlay imageKey="screen-enclosure" isEditMode={isEditMode} imageOverrides={imageOverrides} onImageOverride={handleImageOverride} cropSettings={imageCropSettings} onCropChange={handleCropChange}>
                                            <OptimizedImage 
                                              src={imageOverrides['screen-enclosure'] || enclosureImage} 
                                              alt={enclosureType} 
                                              className="w-full h-full object-cover"
                                              sizeConfig="thumbnail"
                                            />
                                          </ImageUploadOverlay>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                          <p className="font-semibold text-sm text-foreground">{enclosureType}</p>
                                          <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Area:</span> {isEditMode ? (
                                              <input type="number" value={editablePrices['enclosure-area'] ?? enclosureArea} onChange={(e) => setEditablePrices(prev => ({...prev, 'enclosure-area': Number(e.target.value)}))} className="w-20 px-1 py-0.5 border rounded text-right inline-block ml-1" />
                                            ) : (editablePrices['enclosure-area'] ?? enclosureArea).toLocaleString()} sq ft
                                          </p>
                                          <p className="text-base font-bold text-orange-700 dark:text-orange-400">
                                            Total Cost: {isEditMode ? (
                                              <span>$<input type="number" value={editablePrices['enclosure-price'] ?? enclosureItem.price} onChange={(e) => setEditablePrices(prev => ({...prev, 'enclosure-price': Number(e.target.value)}))} className="w-28 px-1 py-0.5 border rounded text-right inline-block" /></span>
                                            ) : `$${(editablePrices['enclosure-price'] ?? enclosureItem.price).toLocaleString()}`}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                        
                        {/* Product Image - ALWAYS DISPLAY */}
                        <div>
                          <div className="mb-4">
                            <ImageUploadOverlay imageKey="main-product" isEditMode={isEditMode} imageOverrides={imageOverrides} onImageOverride={handleImageOverride} cropSettings={imageCropSettings} onCropChange={handleCropChange}>
                              <ImageCard 
                                src={imageOverrides['main-product'] || pool?.image || customProduct?.image || fenceQuoteImage} 
                                alt={pool?.model || customProduct?.name || 'Product'}
                                className="w-full h-48 rounded-lg border border-orange-200" 
                                objectFit="cover" 
                                enableZoom={!isEditMode} 
                              />
                            </ImageUploadOverlay>
                            <p className="text-xs text-center mt-1 text-muted-foreground">
                              {pool?.model || customProduct?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              )}

                {/* Exclusive Sauna Offer for Eligible Pools */}
                {!hiddenSections.has('sauna-offer') && (() => {
                  const eligibleModels = ["Astoria", "Genesis", "Claremont"];
                  const poolModel = pool?.model || "";
                  const poolPrice = pool?.price || 0;
                  const isEligible = eligibleModels.includes(poolModel) && poolPrice >= 70000;
                  
                  if (!isEligible) return null;
                  
                  return (
                    <div className="mb-6 relative">
                      {isEditMode && (
                        <button
                          onClick={() => handleToggleSection('sauna-offer')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                          title="Remove section"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <ExclusiveSaunaOffer 
                        poolModel={poolModel} 
                        poolPrice={poolPrice} 
                        onAddToQuote={() => setSaunaSelected(!saunaSelected)}
                        isSelected={saunaSelected}
                      />
                    </div>
                  );
                })()}

                {/* Selected Options with Images */}
                {!hiddenSections.has('selected-features') && selectedOptions.length > 0 && (
                <div className="mb-6 relative">
                    {isEditMode && (
                      <button
                        onClick={() => handleToggleSection('selected-features')}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                        title="Remove section"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <h4 className="font-bold text-lg mb-3 text-teal-600">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editableTexts['selected-features-title'] || 'Selected Features'}
                          onChange={(e) => setEditableTexts({...editableTexts, 'selected-features-title': e.target.value})}
                          className="bg-white border rounded px-2 py-1"
                        />
                      ) : (editableTexts['selected-features-title'] || 'Selected Features')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedOptions.map((option, index) => {
                  let displayPrice = option.price;

                  // Calculate area-based pricing for screen enclosures
                  if (option.category === 'screen-enclosure') {
                    const enclosureArea = getEnclosureArea();
                    if (option.id.includes('standard-1-story')) {
                      displayPrice = enclosureArea * 22;
                    } else if (option.id.includes('standard-2-story')) {
                      displayPrice = enclosureArea * 24;
                    } else if (option.id.includes('premium-1-story')) {
                      displayPrice = enclosureArea * 24;
                    } else if (option.id.includes('premium-2-story')) {
                      displayPrice = enclosureArea * 26;
                    }
                  }
                  return <div key={index} className="border border-orange-200 dark:border-gray-600 rounded-lg p-3 bg-gradient-to-br from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
                            {/* Add image for screen enclosures */}
                            {option.category === 'screen-enclosure' && <div className="mb-3">
                                <ImageUploadOverlay imageKey={`option-img-${index}`} isEditMode={isEditMode} imageOverrides={imageOverrides} onImageOverride={handleImageOverride} cropSettings={imageCropSettings} onCropChange={handleCropChange}>
                                  <OptimizedImage 
                                    src={imageOverrides[`option-img-${index}`] || "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png"} 
                                    alt={option.name} 
                                    className="w-full h-20 rounded-md border border-orange-200 object-cover"
                                    sizeConfig="quoteImage"
                                  />
                                </ImageUploadOverlay>
                              </div>}
                            <h5 className="font-semibold text-sm">
                              {option.name}
                              {option.category === 'screen-enclosure' && (
                                <span className="ml-2 text-xs font-normal text-blue-600">
                                  ({option.id.includes('1-story') ? '1-Story' : '2-Story'})
                                </span>
                              )}
                            </h5>
                            <p className="text-xs text-muted-foreground mb-2">{option.description}</p>
                            {option.category === 'screen-enclosure' && <p className="text-xs text-blue-600 mb-2">
                                Calculated area: {getEnclosureArea()} sq ft
                              </p>}
                            <div className="flex justify-between text-sm">
                              <span>Price:</span>
                              {isEditMode ? (
                                <span className="font-semibold text-teal-600">+$<input type="number" value={editablePrices[`option-${index}`] ?? displayPrice} onChange={(e) => setEditablePrices(prev => ({...prev, [`option-${index}`]: Number(e.target.value)}))} className="w-24 px-1 py-0.5 border rounded text-right inline-block" /></span>
                              ) : (
                                <span className="font-semibold text-teal-600">+${(editablePrices[`option-${index}`] ?? displayPrice).toLocaleString()}</span>
                              )}
                            </div>
                          </div>;
                })}
                    </div>
                  </div>
                )}

                {/* Product Card Selected Items */}
                {!hiddenSections.has('added-features') && extras?.extrasBreakdown && extras.extrasBreakdown.length > 0 && (
                <div className="mb-6 relative">
                    {isEditMode && (
                      <button
                        onClick={() => handleToggleSection('added-features')}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                        title="Remove section"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <h4 className="font-bold text-lg mb-3 text-coral-600">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editableTexts['added-features-title'] || 'Added Features from Product Card'}
                          onChange={(e) => setEditableTexts({...editableTexts, 'added-features-title': e.target.value})}
                          className="bg-white border rounded px-2 py-1"
                        />
                      ) : (editableTexts['added-features-title'] || 'Added Features from Product Card')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {extras.extrasBreakdown.map((item: any, index: number) => {
                        // Update item name to specify 2 Story for Premium Screen Enclosure
                        let displayName = item.name;
                        if (displayName.toLowerCase().includes('premium screen enclosure') && !displayName.includes('2 Story')) {
                          displayName = displayName.replace(/premium screen enclosure/i, 'Premium Screen Enclosure - 2 Story');
                        }
                        
                        return <div key={index} className="border border-coral-200 dark:border-gray-600 rounded-lg p-3 bg-gradient-to-br from-coral-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
                          {/* Display item image - use actual image if available or fallback based on type */}
                          {(() => {
                    // First check if item has its own image property
                    if (item.image) {
                      return <div className="mb-3">
                                 <ImageUploadOverlay imageKey={`extra-img-${index}`} isEditMode={isEditMode} imageOverrides={imageOverrides} onImageOverride={handleImageOverride} cropSettings={imageCropSettings} onCropChange={handleCropChange}>
                                   <ImageCard src={imageOverrides[`extra-img-${index}`] || item.image} alt={displayName} className="w-full h-20 rounded-md border border-coral-200" objectFit="cover" enableZoom={false} />
                                 </ImageUploadOverlay>
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
                    } else if (item.name.includes('Aluminum Fence') || item.name.includes('Patio Fencing') || item.name.includes('patio-fencing')) {
                      itemImage = aluminumPanelImage;
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
                        // Priceline Deck Collection
                        'Priceline Light': '/lovable-uploads/deck-light.png',
                        'Priceline Dark': '/lovable-uploads/deck-dark.png',
                        'Priceline Misty': '/lovable-uploads/deck-misty.png',
                        'Priceline Steel': '/lovable-uploads/deck-steel.png',
                        'Priceline Pearly': '/lovable-uploads/deck-pearly.png',
                        'Priceline Silver': '/lovable-uploads/deck-silver.png',
                        'Priceline Rustic': '/lovable-uploads/deck-rustic.png',
                        // Premium Porcelain
                        'Coralina': '/lovable-uploads/coralina-blanco.jpg',
                        // Fallback brands
                        'Premier Pavers': '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
                        'Belgard Pavers': '/lovable-uploads/46d142d3-b106-406d-9867-9bf7b63fd469.png',
                        'Tremron Pavers': '/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png',
                        'Cambridge Pavers': '/lovable-uploads/8033278d-a737-4b1d-84bf-fd0ac9126406.png'
                      };
                      itemImage = paverImages[paverName] || paverImages['Premier Pavers'];
                    } else if (item.name.includes('Artificial Grass')) {
                      // Artificial Grass mapping - supports 5 colors
                      const grassImages: Record<string, string> = {
                        'Light Green': '/src/assets/grass-light-green.avif',
                        'Dark Green': '/src/assets/grass-dark-green.avif',
                        'Natural Green': '/src/assets/grass-natural-green.avif',
                        'Emerald': '/src/assets/grass-emerald.avif',
                        'Olive': '/src/assets/grass-olive.avif'
                      };
                      // Extract color from item name - check for each color
                      let color = 'Light Green'; // default
                      if (item.name.includes('Dark Green')) color = 'Dark Green';
                      else if (item.name.includes('Natural Green')) color = 'Natural Green';
                      else if (item.name.includes('Emerald')) color = 'Emerald';
                      else if (item.name.includes('Olive')) color = 'Olive';
                      else if (item.name.includes('Light Green')) color = 'Light Green';
                      
                      itemImage = grassImages[color] || '/src/assets/grass-light-green.avif';
                    } else {
                      itemImage = '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png';
                    }
                    return itemImage ? <div className="mb-3">
                                 <ImageUploadOverlay imageKey={`extra-img-${index}`} isEditMode={isEditMode} imageOverrides={imageOverrides} onImageOverride={handleImageOverride} cropSettings={imageCropSettings} onCropChange={handleCropChange}>
                                   <ImageCard src={imageOverrides[`extra-img-${index}`] || itemImage} alt={displayName} className="w-full h-20 rounded-md border border-coral-200" objectFit="cover" enableZoom={false} />
                                 </ImageUploadOverlay>
                               </div> : null;
                  })()}
                          <h5 className="font-semibold text-sm">{isEditMode ? (
                            <input type="text" value={editableTexts[`extra-name-${index}`] ?? displayName} onChange={(e) => setEditableTexts(prev => ({...prev, [`extra-name-${index}`]: e.target.value}))} className="w-full px-1 py-0.5 border rounded text-sm font-semibold" />
                          ) : (editableTexts[`extra-name-${index}`] ?? displayName)}</h5>
                          <div className="flex justify-between text-sm mt-2">
                            <span>Price:</span>
                            {isEditMode ? (
                              <span className="font-semibold text-coral-600">+$<input type="number" value={editablePrices[`extra-${index}`] ?? item.price} onChange={(e) => setEditablePrices(prev => ({...prev, [`extra-${index}`]: Number(e.target.value)}))} className="w-24 px-1 py-0.5 border rounded text-right inline-block" /></span>
                            ) : (
                              <span className="font-semibold text-coral-600">+${(editablePrices[`extra-${index}`] ?? item.price).toLocaleString()}</span>
                            )}
                          </div>
                        </div>;
                      })}
                    </div>
                    <div className="mt-4 p-3 bg-gradient-to-r from-coral-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Added Features:</span>
                        {isEditMode ? (
                          <span className="font-bold text-coral-600 text-lg">+$<input type="number" value={editablePrices['extras-total'] ?? extras.extrasTotal} onChange={(e) => setEditablePrices(prev => ({...prev, 'extras-total': Number(e.target.value)}))} className="w-28 px-1 py-0.5 border rounded text-right inline-block" /></span>
                        ) : (
                          <span className="font-bold text-coral-600 text-lg">+${(editablePrices['extras-total'] ?? extras.extrasTotal).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sauna Selection */}
                {!hiddenSections.has('sauna-addon') && saunaSelected && (() => {
                  const eligibleModels = ["Astoria", "Genesis", "Claremont", "Extreme 38"];
                  const poolModel = pool?.model || "";
                  const poolPrice = pool?.price || 0;
                  const isEligible = eligibleModels.includes(poolModel) && poolPrice >= 70000;
                  
                  if (!isEligible) return null;
                  
                  return (
                    <div className="mb-6 relative">
                      {isEditMode && (
                        <button
                          onClick={() => handleToggleSection('sauna-addon')}
                          className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                          title="Remove section"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <h4 className="font-bold text-lg mb-3 text-amber-600">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editableTexts['sauna-title'] || '🔥 Exclusive Sauna Add-On'}
                            onChange={(e) => setEditableTexts({...editableTexts, 'sauna-title': e.target.value})}
                            className="bg-white border rounded px-2 py-1 w-full"
                          />
                        ) : (editableTexts['sauna-title'] || '🔥 Exclusive Sauna Add-On')}
                      </h4>
                      <div className="border border-amber-200 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-md overflow-hidden border">
                            <ImageUploadOverlay imageKey="sauna-addon" isEditMode={isEditMode} imageOverrides={imageOverrides} onImageOverride={handleImageOverride} cropSettings={imageCropSettings} onCropChange={handleCropChange}>
                              <ImageCard 
                                src={imageOverrides['sauna-addon'] || "/lovable-uploads/barrel-sauna.webp"} 
                                alt="Barrel Sauna" 
                                className="w-full h-full object-cover"
                                enableZoom={false}
                              />
                            </ImageUploadOverlay>
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
                {!hiddenSections.has('included-items') && (() => {
                  const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                  const isLanaiProduct = extras?.productType === 'lanai';
                  const lanaiIncludedFeatures = extras?.includedFeatures || [];
                  
                  if (!isPoolProduct && !isLanaiProduct) return null;
                  
                  return (
                     <div className="mb-6 relative">
                      {isEditMode && (
                        <button
                          onClick={() => handleToggleSection('included-items')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                          title="Remove section"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg">
                        <h4 className="font-bold text-lg mb-3 text-orange-600">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableTexts['includes-title'] || (isLanaiProduct ? 'LANAI INCLUDES' : 'ALL POOLS INCLUDE')}
                              onChange={(e) => setEditableTexts({...editableTexts, 'includes-title': e.target.value})}
                              className="bg-white border rounded px-2 py-1 w-full"
                            />
                          ) : (editableTexts['includes-title'] || (isLanaiProduct ? 'LANAI INCLUDES' : 'ALL POOLS INCLUDE'))}
                        </h4>
                        {isLanaiProduct && lanaiIncludedFeatures.length > 0 ? (
                          <ul className="text-sm space-y-1">
                            {lanaiIncludedFeatures.map((feature: string, idx: number) => (
                              <li key={idx}>• {feature}</li>
                            ))}
                          </ul>
                        ) : isEditMode ? (
                          <textarea
                            value={editableTexts['includes-content'] || getIncludedItems().filter(item => !item.startsWith("FREE")).join(", ")}
                            onChange={(e) => setEditableTexts({...editableTexts, 'includes-content': e.target.value})}
                            className="w-full px-2 py-1 border rounded text-sm"
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm">
                            {editableTexts['includes-content'] || getIncludedItems().filter(item => !item.startsWith("FREE")).join(", ")}
                          </p>
                        )}
                        <p className="text-xs mt-2 opacity-80">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableTexts['disclaimer'] || 'Architectural Design, Construction and permiting is included in all products, unless project scope is modified.'}
                              onChange={(e) => setEditableTexts({...editableTexts, 'disclaimer': e.target.value})}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          ) : (editableTexts['disclaimer'] || 'Architectural Design, Construction and permiting is included in all products, unless project scope is modified.')}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Pool Construction Details - Only for pool products, NOT lanai */}
                {!hiddenSections.has('construction-details') && (() => {
                  const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                  const isLanaiProduct = extras?.productType === 'lanai';
                  
                  if (!isPoolProduct || isLanaiProduct || !extras?.concreteConstruction) return null;
                  
                  return (
                     <div className="mb-6 relative">
                      {isEditMode && (
                        <button
                          onClick={() => handleToggleSection('construction-details')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                          title="Remove section"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-lg mb-2 text-blue-600">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableTexts['construction-title'] || 'Pool Construction'}
                              onChange={(e) => setEditableTexts({...editableTexts, 'construction-title': e.target.value})}
                              className="bg-white border rounded px-2 py-1 w-full"
                            />
                          ) : (editableTexts['construction-title'] || 'Pool Construction')}
                        </h4>
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
                {!hiddenSections.has('warranty') && (() => {
                  const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                  const isLanaiProduct = extras?.productType === 'lanai';
                  
                  if (!isPoolProduct || isLanaiProduct) return null;
                  
                  return (
                     <div className="mb-6 relative">
                      {isEditMode && (
                        <button
                          onClick={() => handleToggleSection('warranty')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                          title="Remove section"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
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
                {!hiddenSections.has('build-time') && (
                <div className="mb-6 relative">
                  {isEditMode && (
                    <button
                      onClick={() => handleToggleSection('build-time')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors no-print print:hidden z-10"
                      title="Remove section"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                    {isEditMode ? (
                      <Input
                        value={editableTexts['installation-time-title'] || 'Installation Time'}
                        onChange={(e) => setEditableTexts(prev => ({ ...prev, 'installation-time-title': e.target.value }))}
                        className="font-bold text-lg mb-2 text-blue-600 bg-white/50"
                      />
                    ) : (
                      <h4 className="font-bold text-lg mb-2 text-blue-600">
                        {editableTexts['installation-time-title'] || (() => {
                          const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                          return isPoolProduct ? 'Estimated Build Time' : 'Installation Time';
                        })()}
                      </h4>
                    )}
                    {isEditMode ? (
                      <Input
                        value={editableTexts['installation-time-text'] || getInstallationTimeText()}
                        onChange={(e) => setEditableTexts(prev => ({ ...prev, 'installation-time-text': e.target.value }))}
                        className="text-sm bg-white/50"
                      />
                    ) : (
                      <p className="text-sm">
                        {editableTexts['installation-time-text'] || getInstallationTimeText()}
                      </p>
                    )}
                    {(() => {
                      const isPoolProduct = pool || (customProduct && ['Pool', 'Spa', 'Tanning Ledge'].includes(customProduct.type || ''));
                      
                      if (!isPoolProduct) return null;
                      
                      if (extras?.concreteConstruction || pool?.model === "Madre Perla" || pool?.model === "Winderview" || pool?.model === "Pacific Ridge" || pool?.model === "Maxima" || pool?.model === "Cape Coral") {
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
                )}

                 <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-teal-500 p-6 rounded-lg text-white text-center">
                   <h3 className="text-2xl font-bold mb-2">
                     {isEditMode ? (
                       <input
                         type="text"
                         value={editableTexts['total-title'] || 'Total Investment'}
                         onChange={(e) => setEditableTexts({...editableTexts, 'total-title': e.target.value})}
                         className="bg-white text-gray-900 border rounded px-2 py-1 w-full text-center"
                       />
                     ) : (editableTexts['total-title'] || 'Total Investment')}
                   </h3>
                   {isEditMode ? (
                     <input
                       type="number"
                       value={editableQuoteAmount}
                       onChange={(e) => setEditableQuoteAmount(Number(e.target.value))}
                       className="text-4xl font-bold bg-white text-gray-900 px-4 py-2 rounded w-full text-center"
                     />
                   ) : (
                     <div className="text-4xl font-bold">${(editableQuoteAmount || calculateQuote()).toLocaleString()}</div>
                   )}
                 </div>

              </div>
            </div>
            
            {/* Controller Panel - Bottom of quote content */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 no-print print:hidden">
              <div className="space-y-4">
                
                {/* Edit Mode Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  {!isEditMode ? (
                    <div className="flex items-center gap-2 w-full">
                      <div className="relative flex-1 max-w-[200px]">
                        <Input
                          type="password"
                          placeholder="Passcode"
                          value={passcodeInput}
                          onChange={(e) => setPasscodeInput(e.target.value)}
                          className="h-9 text-sm pr-20 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                          onKeyDown={(e) => e.key === 'Enter' && handleEnterEditMode()}
                        />
                        <Button 
                          size="sm"
                          variant="ghost" 
                          onClick={handleEnterEditMode}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          Edit
                        </Button>
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep('options')}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Options
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={handleSaveEditedQuote}
                      className="bg-green-500 hover:bg-green-600 text-white shadow-md"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  )}
                </div>
                
                {/* Main Actions Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <Button 
                    onClick={() => setCurrentStep('survey')}
                    className="h-11 flex flex-col items-center justify-center gap-0.5 bg-indigo-500 hover:bg-indigo-600 text-white border-0 shadow-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Fill Info</span>
                  </Button>
                  
                  <Button 
                    onClick={handlePrintQuote}
                    className="h-11 flex flex-col items-center justify-center gap-0.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-0 shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Print</span>
                  </Button>
                  
                  <Button 
                    onClick={handleDownloadPDF}
                    className="h-11 flex flex-col items-center justify-center gap-0.5 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-[10px] font-medium">PDF</span>
                  </Button>
                  
                  <Button 
                    onClick={handleGenerateInvoice}
                    disabled={isGeneratingInvoice}
                    className="h-11 flex flex-col items-center justify-center gap-0.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingInvoice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Receipt className="h-4 w-4" />
                    )}
                    <span className="text-[10px] font-medium">Invoice</span>
                  </Button>
                  
                  <Button 
                    onClick={handleStripeCheckout}
                    disabled={isCheckingOut}
                    className="h-11 flex flex-col items-center justify-center gap-0.5 bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-sm disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    <span className="text-[10px] font-medium">Pay</span>
                  </Button>
                  
                  <Button 
                    onClick={handleScheduleInstallation}
                    className="h-11 flex flex-col items-center justify-center gap-0.5 bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-sm"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Schedule</span>
                  </Button>
                </div>
                
                {/* Email Section */}
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                  <Mail className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                  <Input
                    type="email"
                    placeholder="Send quote to email..."
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="flex-1 h-8 border-0 bg-transparent focus:ring-0 text-sm placeholder:text-gray-400"
                  />
                  <Button 
                    size="sm"
                    onClick={handleEmailQuote}
                    disabled={isSendingEmail || !emailAddress}
                    className="bg-blue-500 hover:bg-blue-600 text-white h-7 px-3 text-xs disabled:opacity-50"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
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
import { Upload, MapPin, Home, Waves, DollarSign, FileImage, Loader2, Settings } from "lucide-react";
import PoolCustomizationOptions from "./PoolCustomizationOptions";

interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  dimensions?: string;
  depth?: string;
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
}

interface SurveyData {
  address: string;
  yardSize: string;
  soilType: string;
  accessWidth: string;
  utilityLines: string;
  specialRequests: string;
}

const SurveyQuoteTool = ({ pool, isOpen, onClose }: SurveyQuoteToolProps) => {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    address: "",
    yardSize: "",
    soilType: "",
    accessWidth: "",
    utilityLines: "",
    specialRequests: ""
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<PoolOption[]>([]);
  const [currentStep, setCurrentStep] = useState<'survey' | 'options' | 'quote'>('survey');
  const { toast } = useToast();

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

  const calculateQuote = () => {
    if (!pool) return 0;
    
    let basePrice = pool.price;
    
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
    if (!pool) return [];
    
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

  const handleSubmitSurvey = () => {
    if (!surveyData.address || !surveyData.yardSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least your address and yard size.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep('options');
  };

  const handleContinueToQuote = () => {
    setCurrentStep('quote');
  };

  if (!pool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Custom Quote for {pool.model}
          </DialogTitle>
          <DialogDescription>
            Provide your property details for an accurate Florida installation quote
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'survey' ? (
          <div className="space-y-6">
            {/* Property Survey Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin size={16} className="text-coral" />
                    Property Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, Miami, FL 33101"
                    value={surveyData.address}
                    onChange={(e) => setSurveyData({...surveyData, address: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="yardSize">Backyard Size</Label>
                  <Select onValueChange={(value) => setSurveyData({...surveyData, yardSize: value})}>
                    <SelectTrigger>
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
                  <Label htmlFor="soilType">Soil Type (Florida specific)</Label>
                  <Select onValueChange={(value) => setSurveyData({...surveyData, soilType: value})}>
                    <SelectTrigger>
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
                  <Label htmlFor="accessWidth">Equipment Access</Label>
                  <Select onValueChange={(value) => setSurveyData({...surveyData, accessWidth: value})}>
                    <SelectTrigger>
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
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Spa, lighting, decking, landscaping..."
                    value={surveyData.specialRequests}
                    onChange={(e) => setSurveyData({...surveyData, specialRequests: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Image Upload with Background Removal */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <FileImage size={16} className="text-primary" />
                Upload Yard Photo (Optional - we'll remove the background)
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span>Processing image...</span>
                    </div>
                  ) : uploadedImage ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
                      {processedImage && (
                        <div className="flex justify-center">
                          <img 
                            src={processedImage} 
                            alt="Processed" 
                            className="max-w-32 max-h-32 rounded border"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p>Click to upload a photo of your backyard</p>
                      <p className="text-sm text-muted-foreground">AI will remove the background for better visualization</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button 
              onClick={handleSubmitSurvey}
              variant="gradient"
              size="lg"
              className="w-full"
            >
              Continue to Options
            </Button>
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
              >
                Generate Quote
              </Button>
            </div>
          </div>
        ) : (
          /* Quote Results */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-teal" />
                  Custom Quote for {pool.model}
                </CardTitle>
                <CardDescription>
                  Based on your Florida property survey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-foreground">
                  ${calculateQuote().toLocaleString()}
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Complete installation including permits, excavation, and basic landscaping
                  </p>
                  {selectedOptions.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium">Selected Options:</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {selectedOptions.map((option, index) => (
                          <li key={index}>{option.name} (+${option.price.toLocaleString()})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Recommendations for your property:</h4>
                  {getRecommendations().map((rec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-primary to-teal rounded-full"></div>
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="gradient" className="flex-1">
                    Schedule Installation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setCurrentStep('options')}
                  >
                    Modify Options
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
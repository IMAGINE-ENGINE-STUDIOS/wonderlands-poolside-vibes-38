import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, CheckCircle, ArrowLeft, Pen } from 'lucide-react';

interface ContractorAgreementProps {
  contractorId: string;
  contractorName: string;
  companyName: string;
  onSigned: () => void;
  onCancel: () => void;
}

const ContractorAgreement: React.FC<ContractorAgreementProps> = ({
  contractorId,
  contractorName,
  companyName,
  onSigned,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [signedTitle, setSignedTitle] = useState('');
  const [agreed, setAgreed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!signedName || !agreed || !hasSignature) {
      toast({
        title: "Incomplete",
        description: "Please fill in your name, draw your signature, and agree to the terms.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const signatureData = canvas?.toDataURL('image/png') || '';

      const { error: agreementError } = await supabase
        .from('contractor_agreements')
        .insert({
          contractor_id: contractorId,
          signed_name: signedName,
          signed_title: signedTitle,
          signature_data: signatureData,
          agreement_version: '1.0'
        });

      if (agreementError) throw agreementError;

      const { error: updateError } = await supabase
        .from('contractors')
        .update({
          agreement_signed: true,
          agreement_signed_at: new Date().toISOString()
        })
        .eq('id', contractorId);

      if (updateError) throw updateError;

      onSigned();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={onCancel} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
        </Button>

        <Card className="border-primary/20">
          <CardHeader className="text-center border-b">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">SUBCONTRACTOR AGREEMENT</CardTitle>
            <p className="text-muted-foreground">
              Between Wonderlands World Experience LLC and Subcontractor
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[50vh] p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground mb-4">
                  This Subcontractor Agreement ("Agreement") is made and entered into on this {currentDate}, by and between:
                </p>
                
                <p className="font-semibold">Wonderlands World Experience LLC ("Contractor")</p>
                <p>and</p>
                <p className="font-semibold">{companyName} ("Subcontractor")</p>

                <h3 className="text-lg font-semibold mt-6 mb-3">1. Scope of Work</h3>
                <p>
                  Subcontractor agrees to provide labor and services to Contractor on residential and/or commercial pool projects 
                  under the service categories selected in their profile. Subcontractor may select and commit to one or more service 
                  categories by checking and completing the labor pricing fields in their contractor profile.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">2. Licensing & Permits</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Wonderlands World Experience LLC will register and maintain all permits for each project under its licensed General Contractor.</li>
                  <li>Subcontractor shall operate under Contractor's license and permits for all contracted work, unless state law requires a specialty trade license (e.g., electrical, HVAC).</li>
                  <li>Subcontractor must provide proof of any such specialty license upon request.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">3. Payment Terms</h3>
                <p>Contractor shall pay Subcontractor in the following manner, based on the agreed labor pricing and verified completion of work:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>10%</strong> – Initial deposit to begin project scheduling.</li>
                  <li><strong>30%</strong> – At the beginning of the project once permits are approved.</li>
                  <li><strong>30%</strong> – Upon successful completion of the final inspection.</li>
                  <li><strong>30%</strong> – Upon final project completion and acceptance.</li>
                </ul>
                <p className="mt-4">
                  Subcontractor shall provide invoices at each milestone, and Contractor shall issue payment within 15 business days of approval.
                </p>
                <p className="mt-4 font-semibold">Direct Client Billing Prohibition:</p>
                <p>
                  All contracts, billing, and payments for services offered by Wonderlands World Experience LLC must go through the Contractor. 
                  Subcontractor is strictly prohibited from directly invoicing or contracting with Contractor's clients for any service offered 
                  by Wonderlands World, whether listed in this Agreement or otherwise provided by Contractor.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">4. Timeline & Delays</h3>
                <p>Subcontractor acknowledges the standard timelines:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fiberglass Pools: 6 weeks standard</li>
                  <li>Concrete Pools: 12 weeks standard</li>
                </ul>
                <p>Each project may have its own timeline. Subcontractor must finish the whole job within the timelines or interest will be applied.</p>

                <h3 className="text-lg font-semibold mt-6 mb-3">5. Compliance, Standards & Brand Guidelines</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subcontractor shall comply with all local, state, and federal regulations, including safety codes and building requirements.</li>
                  <li>Workmanship shall meet or exceed industry standards and Contractor's brand specifications.</li>
                  <li>Subcontractor shall follow Wonderlands World Experience's design, finishing standards, and brand guidelines on all projects, including:
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>Luxury design elements and finishes</li>
                      <li>Tile, mosaic, and decorative patterns</li>
                      <li>Landscaping layouts and poolside finishing</li>
                      <li>Color palettes, textures, and materials that align with Wonderlands World Experience's established brand image</li>
                    </ul>
                  </li>
                  <li>Contractor reserves the right to inspect and approve all finishing work to ensure consistency with brand standards before final acceptance of the project.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">6. Independent Contractor</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subcontractor is an independent contractor and not an employee of Contractor.</li>
                  <li>Subcontractor is responsible for its own taxes, insurance, payroll, and employment obligations.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">7. Insurance & Liability</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subcontractor shall maintain appropriate liability insurance and worker's compensation coverage and provide proof to Contractor upon request.</li>
                  <li>Subcontractor shall indemnify and hold Contractor harmless from any claims arising from Subcontractor's work, negligence, or failure to comply with laws.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">8. Termination</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contractor may terminate this Agreement with 7 days written notice if Subcontractor fails to perform satisfactorily.</li>
                  <li>Subcontractor may terminate with 14 days written notice, provided ongoing work is completed to a safe and reasonable stage.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">9. Confidentiality & Non-Compete</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subcontractor shall not disclose project details, client information, or pricing structures to third parties.</li>
                  <li>Subcontractor shall not solicit, contract with, or invoice Contractor's clients directly for a period of 12 months after the last completed project.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">10. Entire Agreement</h3>
                <p>
                  This Agreement constitutes the entire understanding between the parties and supersedes all prior oral or written agreements. 
                  Amendments must be in writing and signed by both parties.
                </p>
              </div>
            </ScrollArea>

            {/* Signature Section */}
            <div className="border-t p-6 space-y-6">
              <h3 className="font-semibold text-lg">Signatures</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contractor Side (Pre-filled) */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3">Wonderlands World Experience LLC</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> Authorized Representative</p>
                    <p><span className="text-muted-foreground">Title:</span> Operations Manager</p>
                    <p><span className="text-muted-foreground">Date:</span> {currentDate}</p>
                  </div>
                </div>

                {/* Subcontractor Side */}
                <div className="p-4 rounded-lg border border-primary/30">
                  <h4 className="font-medium mb-3">Subcontractor</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="signedName">Your Full Name *</Label>
                      <Input
                        id="signedName"
                        value={signedName}
                        onChange={(e) => setSignedName(e.target.value)}
                        placeholder="Enter your full legal name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signedTitle">Title</Label>
                      <Input
                        id="signedTitle"
                        value={signedTitle}
                        onChange={(e) => setSignedTitle(e.target.value)}
                        placeholder="e.g., Owner, Manager"
                      />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <p className="text-sm font-medium">{companyName}</p>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <p className="text-sm">{currentDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Pad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Pen className="w-4 h-4" /> Draw Your Signature *
                  </Label>
                  <Button variant="ghost" size="sm" onClick={clearSignature}>Clear</Button>
                </div>
                <div className="border rounded-lg bg-white">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    className="w-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Sign using your mouse or finger on touch devices</p>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <Checkbox 
                  id="agree" 
                  checked={agreed} 
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                  I have read, understood, and agree to all terms and conditions of this Subcontractor Agreement. 
                  I acknowledge that this is a legally binding contract and that I am authorized to sign on behalf of {companyName}.
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !signedName || !agreed || !hasSignature}
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sign Agreement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorAgreement;
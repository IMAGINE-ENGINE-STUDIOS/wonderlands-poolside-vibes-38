import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Send, Upload, FileText } from 'lucide-react';

interface Service {
  id: string;
  service_name: string;
  labor_price: number | null;
  with_materials_price: number | null;
  service_category: string;
}

interface ProcurementProposalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: { id: string; title: string };
  contractorId: string;
  onSubmitted: () => void;
}

const ProcurementProposalForm: React.FC<ProcurementProposalFormProps> = ({
  open, onOpenChange, listing, contractorId, onSubmitted
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [proposalType, setProposalType] = useState<'existing_service' | 'custom'>('custom');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    proposed_price: '',
    proposal_text: '',
    estimated_timeline: '',
  });

  useEffect(() => {
    if (open) {
      supabase.from('contractor_services').select('*').eq('contractor_id', contractorId).eq('is_active', true)
        .then(({ data }) => setServices((data || []) as Service[]));
    }
  }, [open, contractorId]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const uploadQuotation = async (): Promise<{ url: string; name: string } | null> => {
    if (!quotationFile) return null;
    const ext = quotationFile.name.split('.').pop();
    const path = `quotations/${contractorId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('proposal-attachments').upload(path, quotationFile);
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data: urlData } = supabase.storage.from('proposal-attachments').getPublicUrl(path);
    return { url: urlData.publicUrl, name: quotationFile.name };
  };

  const handleSubmit = async () => {
    const price = proposalType === 'existing_service' && selectedService
      ? (selectedService.with_materials_price || selectedService.labor_price)
      : form.proposed_price ? parseFloat(form.proposed_price) : null;

    if (!price) {
      toast({ title: 'Price required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      let quotation: { url: string; name: string } | null = null;
      if (quotationFile) {
        quotation = await uploadQuotation();
      }

      const { error } = await supabase.from('procurement_proposals').insert({
        listing_id: listing.id,
        contractor_id: contractorId,
        proposal_type: proposalType,
        service_id: proposalType === 'existing_service' ? selectedServiceId || null : null,
        proposed_price: price,
        proposal_text: form.proposal_text.trim() || null,
        estimated_timeline: form.estimated_timeline.trim() || null,
        quotation_url: quotation?.url || null,
        quotation_file_name: quotation?.name || null,
        status: 'pending',
      } as any);
      if (error) throw error;
      toast({ title: 'Proposal Submitted', description: 'Your bid has been sent.' });
      onSubmitted();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Send className="h-4 w-4" /> Apply — {listing.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Proposal Type</Label>
            <RadioGroup value={proposalType} onValueChange={(v) => setProposalType(v as any)} className="flex gap-4 mt-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing_service" id="existing" />
                <Label htmlFor="existing" className="text-sm cursor-pointer">Use Existing Service Price</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-sm cursor-pointer">Custom Proposal</Label>
              </div>
            </RadioGroup>
          </div>

          {proposalType === 'existing_service' && (
            <div>
              <Label className="text-xs text-muted-foreground">Select Service</Label>
              {services.length === 0 ? (
                <p className="text-xs text-muted-foreground mt-1">No services configured. Add services in the Service Pricing tab.</p>
              ) : (
                <div className="space-y-2 mt-1 max-h-40 overflow-y-auto">
                  {services.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`p-2 rounded border cursor-pointer text-sm ${
                        selectedServiceId === s.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="font-medium">{s.service_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Labor: ${s.labor_price?.toLocaleString() || 'N/A'} | With Materials: ${s.with_materials_price?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {proposalType === 'custom' && (
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Proposed Price
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.proposed_price}
                onChange={e => setForm({ ...form, proposed_price: e.target.value })}
              />
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">Estimated Timeline</Label>
            <Input
              placeholder="e.g., 2 weeks"
              value={form.estimated_timeline}
              onChange={e => setForm({ ...form, estimated_timeline: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Proposal Details</Label>
            <textarea
              rows={3}
              className="w-full rounded-md text-sm border border-input bg-background p-2"
              placeholder="Describe your approach, materials, experience..."
              value={form.proposal_text}
              onChange={e => setForm({ ...form, proposal_text: e.target.value })}
            />
          </div>

          {/* Quotation File Upload */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Attach Quotation (PDF, DOC, etc.)
            </Label>
            <div className="mt-1">
              {quotationFile ? (
                <div className="flex items-center gap-2 p-2 rounded border border-primary/30 bg-primary/5 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate">{quotationFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuotationFile(null)} className="text-destructive h-6 text-xs">
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-3 rounded border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload quotation file</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) setQuotationFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? 'Submitting...' : 'Submit Proposal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcurementProposalForm;

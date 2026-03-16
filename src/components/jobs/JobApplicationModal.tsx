import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, MessageCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JobApplicationModalProps {
  open: boolean;
  onClose: () => void;
  postingId: string;
  postingTitle: string;
}

const JobApplicationModal = ({ open, onClose, postingId, postingTitle }: JobApplicationModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    whatsappOptIn: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Resume must be under 5MB', variant: 'destructive' });
        return;
      }
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Please upload a PDF or Word document', variant: 'destructive' });
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast({ title: 'Please enter a valid email', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      let resumeUrl: string | null = null;

      if (resumeFile) {
        const ext = resumeFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('career-resumes')
          .upload(fileName, resumeFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('career-resumes')
          .getPublicUrl(fileName);
        resumeUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('career_applications').insert({
        posting_id: postingId,
        applicant_name: form.name.trim(),
        applicant_email: form.email.trim(),
        applicant_phone: form.phone.trim() || null,
        cover_letter: form.coverLetter.trim() || null,
        resume_url: resumeUrl,
        whatsapp_opt_in: form.whatsappOptIn,
      });

      if (error) throw error;

      toast({ title: 'Application submitted!', description: 'We will review your application and get back to you soon.' });
      onClose();
      setForm({ name: '', email: '', phone: '', coverLetter: '' });
      setResumeFile(null);
    } catch (err: any) {
      toast({ title: 'Failed to submit', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Apply for: {postingTitle}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                maxLength={255}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
            <Input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="(555) 123-4567"
              maxLength={20}
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Resume (PDF or Word)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            {resumeFile ? (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground flex-1 truncate">{resumeFile.name}</span>
                <Button type="button" size="icon" variant="ghost" onClick={() => setResumeFile(null)} className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-dashed border-2 h-20 flex flex-col gap-1"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload resume</span>
              </Button>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Cover Letter (optional)</label>
            <textarea
              value={form.coverLetter}
              onChange={e => setForm({ ...form, coverLetter: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tell us why you'd be a great fit..."
              maxLength={2000}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="default" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationModal;

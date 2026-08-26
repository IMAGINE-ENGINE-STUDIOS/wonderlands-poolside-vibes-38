import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { solarProducts } from "@/data/solarData";
import { toast } from "sonner";

/**
 * SolarLeadForm — lead capture for the Wonderlands Solar section.
 *
 * Collects name, email and preferred package, validates with zod, then shows
 * a confirmation state with the official Calendly scheduling link. Leads are
 * persisted to localStorage (solar-leads) so the confirmation survives reloads
 * and the admin/Genius layer can pick them up later.
 *
 * Consent: per project rule, a WhatsApp opt-in checkbox is mandatory before
 * the form can be submitted.
 */

const SCHEDULING_URL = "https://calendly.com/wonderlandsworlds/30min";
const STORAGE_KEY = "wonderlands-solar-leads";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be under 255 characters"),
  packageId: z.string().min(1, "Please choose a package"),
  whatsappOptIn: z.literal(true, {
    errorMap: () => ({ message: "WhatsApp consent is required so we can reach you about your solar quote" }),
  }),
});

type LeadFormValues = z.infer<typeof leadSchema>;
type FieldErrors = Partial<Record<keyof LeadFormValues, string>>;

const SolarLeadForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedPackage, setSubmittedPackage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse({ name, email, packageId, whatsappOptIn });
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LeadFormValues;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    const pkg = solarProducts.find((p) => p.id === result.data.packageId);
    const record = {
      ...result.data,
      packageName: pkg?.name ?? result.data.packageId,
      createdAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.push(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // localStorage may be unavailable (private mode) — confirmation still shows.
    }

    setSubmittedPackage(record.packageName);
    setSubmitted(true);
    toast.success("Solar consultation request received");
  };

  if (submitted) {
    return (
      <div className="border border-foreground/20 bg-foreground p-8 text-background sm:p-10">
        <p className="text-[9px] uppercase tracking-[0.45em] opacity-70">Request received</p>
        <h3 className="mt-3 font-serif text-3xl font-light leading-tight sm:text-4xl">
          Thank you, {name.split(" ")[0]}.
        </h3>
        <p className="mt-4 max-w-xl text-[13px] leading-relaxed opacity-80">
          Your request for the <span className="font-medium">{submittedPackage}</span> is with our
          energy team. A Wonderlands specialist will reach out shortly with your shade study and
          installed pricing. Want to talk sooner?
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            asChild
            className="rounded-none bg-background px-8 text-[10px] uppercase tracking-[0.3em] text-foreground hover:bg-background/90"
          >
            <a href={SCHEDULING_URL} target="_blank" rel="noopener noreferrer">
              Schedule a Call
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setName("");
              setEmail("");
              setPackageId("");
              setWhatsappOptIn(false);
            }}
            className="rounded-none border-background/40 bg-transparent px-8 text-[10px] uppercase tracking-[0.3em] text-background hover:bg-background/10 hover:text-background"
          >
            Send Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-foreground/20 bg-foreground p-8 text-background sm:p-10"
    >
      <p className="text-[9px] uppercase tracking-[0.45em] opacity-70">Energy Consultation</p>
      <h3 className="mt-3 font-serif text-3xl font-light leading-tight sm:text-4xl">
        Start with a free shade study.
      </h3>
      <p className="mt-3 max-w-xl text-[13px] leading-relaxed opacity-75">
        Tell us which package fits your home and our team will prepare installed pricing, incentive
        eligibility and a roof layout — no obligation.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="solar-lead-name" className="mb-2 block text-[9px] uppercase tracking-[0.35em] opacity-70">
            Full Name
          </label>
          <Input
            id="solar-lead-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Delgado"
            autoComplete="name"
            className="rounded-none border-background/30 bg-transparent text-background placeholder:text-background/40 focus-visible:ring-background/40"
          />
          {errors.name && <p className="mt-1.5 text-[11px] text-background/70">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="solar-lead-email" className="mb-2 block text-[9px] uppercase tracking-[0.35em] opacity-70">
            Email
          </label>
          <Input
            id="solar-lead-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
            className="rounded-none border-background/30 bg-transparent text-background placeholder:text-background/40 focus-visible:ring-background/40"
          />
          {errors.email && <p className="mt-1.5 text-[11px] text-background/70">{errors.email}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="solar-lead-package" className="mb-2 block text-[9px] uppercase tracking-[0.35em] opacity-70">
            Preferred Package
          </label>
          <Select value={packageId} onValueChange={setPackageId}>
            <SelectTrigger
              id="solar-lead-package"
              className="rounded-none border-background/30 bg-transparent text-background focus:ring-background/40 [&>span]:text-background/60 data-[state=open]:text-background"
            >
              <SelectValue placeholder="Choose a solar package" />
            </SelectTrigger>
            <SelectContent>
              {solarProducts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {p.group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.packageId && <p className="mt-1.5 text-[11px] text-background/70">{errors.packageId}</p>}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3">
        <Checkbox
          id="solar-lead-whatsapp"
          checked={whatsappOptIn}
          onCheckedChange={(v) => setWhatsappOptIn(v === true)}
          className="mt-0.5 border-background/40 data-[state=checked]:border-background data-[state=checked]:bg-background data-[state=checked]:text-foreground"
        />
        <label htmlFor="solar-lead-whatsapp" className="cursor-pointer text-[11px] leading-relaxed opacity-80">
          I agree to receive my solar quote and scheduling updates from Wonderlands World via WhatsApp,
          email or SMS. Reply STOP to opt out at any time.
        </label>
      </div>
      {errors.whatsappOptIn && <p className="mt-1.5 text-[11px] text-background/70">{errors.whatsappOptIn}</p>}

      <Button
        type="submit"
        className="mt-8 w-full rounded-none bg-background px-8 py-6 text-[10px] uppercase tracking-[0.35em] text-foreground hover:bg-background/90 sm:w-auto"
      >
        Request My Shade Study
      </Button>
    </form>
  );
};

export default SolarLeadForm;

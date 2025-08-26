
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type QuoteCustomer = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export default function QuoteDetailsForm({
  initial,
  onSave,
}: {
  initial?: QuoteCustomer;
  onSave: (customer: QuoteCustomer) => void;
}) {
  const [form, setForm] = useState<QuoteCustomer>({
    name: initial?.name || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    address: initial?.address || "",
  });

  const handleChange =
    (key: keyof QuoteCustomer) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit = form.name.trim() && form.email.trim();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6 space-y-4">
      <h3 className="text-xl font-semibold">Customer information</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="q-name">Name</Label>
          <Input id="q-name" value={form.name} onChange={handleChange("name")} placeholder="Full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-email">Email</Label>
          <Input id="q-email" type="email" value={form.email} onChange={handleChange("email")} placeholder="name@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-phone">Phone</Label>
          <Input id="q-phone" value={form.phone} onChange={handleChange("phone")} placeholder="(XXX) XXX-XXXX" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="q-address">Property Address</Label>
          <Input id="q-address" value={form.address} onChange={handleChange("address")} placeholder="Street, City, State" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave(form)} disabled={!canSubmit} variant="default">
          Continue to preview
        </Button>
      </div>
    </div>
  );
}

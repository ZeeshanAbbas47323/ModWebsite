"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentField } from "@/components/net30/document-field";
import { net30Service } from "@/services/net30.service";

const EMPTY = {
  company_name: "",
  first_name: "",
  last_name: "",
  email: "",
  company_tax_id: "",
  phone_country_code: "+1",
  phone: "",
  years_in_business: "",
  requested_credit_amount: "",
  resale_certificate_url: "",
  business_license_url: "",
};

export function Net30Form() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const field = (name: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [name]: e.target.value }));

  /** The API types these as numbers, so blank or junk must not be sent. */
  const validate = (): string | null => {
    const years = Number(form.years_in_business);
    const credit = Number(form.requested_credit_amount);
    if (!Number.isInteger(years) || years < 0) {
      return "Years in business must be a whole number.";
    }
    if (!Number.isFinite(credit) || credit <= 0) {
      return "Enter the credit amount you would like to request.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      await net30Service.submit({
        company_name: form.company_name.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        company_tax_id: form.company_tax_id.trim(),
        phone: form.phone.trim(),
        phone_country_code: form.phone_country_code.trim() || undefined,
        years_in_business: Number(form.years_in_business),
        requested_credit_amount: Number(form.requested_credit_amount),
        resale_certificate_url: form.resale_certificate_url.trim() || undefined,
        business_license_url: form.business_license_url.trim() || undefined,
      });
      setStatus("sent");
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your application.");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-[#F4F4F5] rounded-[24px] p-10 md:p-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-3">
          Application received
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Our credit team reviews applications within 2–3 business days. We will email you
          as soon as a decision is made.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/products"><Button size="xl">Keep shopping</Button></Link>
          <Button size="xl" variant="outline" onClick={() => setStatus("idle")}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E5E5E5] rounded-[24px] md:rounded-[32px] p-6 md:p-8 lg:p-10 shadow-sm flex flex-col gap-6"
    >
      {/* Business */}
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-black">Your business</h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="company_name">Company name *</Label>
          <Input id="company_name" value={form.company_name} onChange={field("company_name")} required placeholder="Acme Prints LLC" className="h-12 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company_tax_id">Tax ID / EIN *</Label>
            <Input id="company_tax_id" value={form.company_tax_id} onChange={field("company_tax_id")} required placeholder="12-3456789" className="h-12 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="years_in_business">Years in business *</Label>
            <Input id="years_in_business" type="number" min={0} step={1} value={form.years_in_business} onChange={field("years_in_business")} required placeholder="4" className="h-12 rounded-xl" />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:max-w-xs">
          <Label htmlFor="requested_credit_amount">Credit requested (USD) *</Label>
          <Input id="requested_credit_amount" type="number" min={1} step={1} value={form.requested_credit_amount} onChange={field("requested_credit_amount")} required placeholder="5000" className="h-12 rounded-xl" />
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Contact */}
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-black">Who should we contact?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="first_name">First name *</Label>
            <Input id="first_name" value={form.first_name} onChange={field("first_name")} required autoComplete="given-name" placeholder="Jane" className="h-12 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name">Last name *</Label>
            <Input id="last_name" value={form.last_name} onChange={field("last_name")} required autoComplete="family-name" placeholder="Cooper" className="h-12 rounded-xl" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Work email *</Label>
          <Input id="email" type="email" value={form.email} onChange={field("email")} required autoComplete="email" placeholder="jane@acmeprints.com" className="h-12 rounded-xl" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone *</Label>
          <div className="flex gap-3">
            <Input
              aria-label="Country code"
              value={form.phone_country_code}
              onChange={field("phone_country_code")}
              placeholder="+1"
              className="h-12 rounded-xl w-20 shrink-0 text-center"
            />
            <Input id="phone" type="tel" value={form.phone} onChange={field("phone")} required autoComplete="tel" placeholder="3025550123" className="h-12 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Documents */}
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-black">Documents</h2>
          <p className="text-sm text-gray-500 mt-1">
            Optional, but they speed the review up considerably.
          </p>
        </div>

        <DocumentField
          id="resale_certificate_url"
          label="Resale certificate"
          hint="Upload a photo or scan, or paste a link to a PDF."
          value={form.resale_certificate_url}
          onChange={(url) => setForm((c) => ({ ...c, resale_certificate_url: url }))}
        />
        <DocumentField
          id="business_license_url"
          label="Business license"
          hint="Upload a photo or scan, or paste a link to a PDF."
          value={form.business_license_url}
          onChange={(url) => setForm((c) => ({ ...c, business_license_url: url }))}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="xl" disabled={status === "sending"}>
          {status === "sending" ? "Submitting…" : "Submit application"}
        </Button>
        <span className="text-sm text-gray-500">Reviewed within 2–3 business days.</span>
      </div>
    </form>
  );
}

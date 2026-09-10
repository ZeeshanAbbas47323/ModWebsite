"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentField } from "@/components/net30/document-field";
import { apparelQuoteService } from "@/services/apparel-quote.service";

const ORDER_TYPES = [
  "Business or Staff Apparel",
  "Team or School Apparel",
  "Event Apparel",
  "Merchandise or Brand Apparel",
  "Other Bulk Order",
];

const GARMENT_TYPES = [
  "T-Shirts",
  "Long-Sleeve Shirts",
  "Hoodies",
  "Crewneck Sweatshirts",
  "Sweatsuits",
  "Jackets",
  "Hats",
  "Youth Apparel",
  "Customer-provided Garment",
  "Other",
];

const PRINT_LOCATIONS = [
  "Left Chest",
  "Full Front",
  "Full Back",
  "Left Sleeve",
  "Right Sleeve",
  "Pants Leg",
  "Hat Front",
  "Hat Side",
  "Hat Back",
  "Other",
];

const PERSONALIZATION = [
  "No Personalization",
  "Individual Names",
  "Individual Numbers",
  "Names & Numbers",
  "Other Personalization",
];

const ARTWORK_STATUS = [
  "My artwork is print-ready",
  "My artwork needs background removal",
  "My artwork needs resizing or cleanup",
  "I need ModFirst to create the design",
  "I'm uploading a reference only",
];

const DELIVERY_METHODS = ["Pickup", "Local Delivery", "Shipping"];

const EMPTY = {
  full_name: "",
  business_name: "",
  email: "",
  phone_country_code: "+1",
  phone: "",
  garment_colors: "",
  quantity: "",
  size_breakdown: "",
  personalization: "",
  artwork_url: "",
  date_mm: "",
  date_dd: "",
  date_yyyy: "",
  delivery_method: "",
  project_details: "",
};

type Group = "order_types" | "garment_types" | "print_locations" | "artwork_status";

const INPUT = "h-12 rounded-xl";
const TEXTAREA =
  "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-base transition-colors focus:border-primary focus:outline-none";

/**
 * Checkbox lists are the bulk of this form, so they sit in a bordered box and
 * flow into columns - a single stacked column of thirty boxes was unreadable.
 */
function OptionGroup({
  legend,
  hint,
  options,
  selected,
  onToggle,
  columns = 2,
}: {
  legend: string;
  hint?: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <div>
        <legend className="text-sm font-medium text-black">{legend}</legend>
        {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
      <div
        className={`grid gap-x-6 gap-y-2.5 rounded-xl border border-[#E5E5E5] p-4 ${
          columns === 2 ? "sm:grid-cols-2" : ""
        }`}
      >
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 text-[#464545] transition-colors hover:text-black"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="size-4 shrink-0 accent-primary"
            />
            <span className="text-sm leading-snug">{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ApparelQuoteForm() {
  const [form, setForm] = useState(EMPTY);
  const [groups, setGroups] = useState<Record<Group, string[]>>({
    order_types: [],
    garment_types: [],
    print_locations: [],
    artwork_status: [],
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const field =
    (name: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [name]: e.target.value }));

  const toggle = (group: Group) => (value: string) =>
    setGroups((current) => ({
      ...current,
      [group]: current[group].includes(value)
        ? current[group].filter((v) => v !== value)
        : [...current[group], value],
    }));

  /** The three date boxes only count as a date once all three are filled. */
  const buildDate = (): { value?: string; error?: string } => {
    const { date_mm: mm, date_dd: dd, date_yyyy: yyyy } = form;
    if (!mm && !dd && !yyyy) return {};
    if (!mm || !dd || !yyyy) return { error: "Enter a complete date, or leave it empty." };

    const month = Number(mm);
    const day = Number(dd);
    const year = Number(yyyy);
    if (month < 1 || month > 12) return { error: "Month must be between 1 and 12." };
    if (day < 1 || day > 31) return { error: "Day must be between 1 and 31." };
    if (year < 2000 || year > 2999) return { error: "Enter a four-digit year." };

    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const parsed = new Date(`${iso}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.getUTCDate() !== day) {
      return { error: "That date does not exist." };
    }
    return { value: iso };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const date = buildDate();
    if (date.error) {
      setError(date.error);
      return;
    }

    setError(null);
    setStatus("sending");

    try {
      await apparelQuoteService.submit({
        full_name: form.full_name.trim(),
        business_name: form.business_name.trim(),
        email: form.email.trim(),
        phone_country_code: form.phone_country_code.trim() || undefined,
        phone: form.phone.trim(),

        order_types: groups.order_types,
        garment_types: groups.garment_types,
        print_locations: groups.print_locations,
        artwork_status: groups.artwork_status,

        garment_colors: form.garment_colors.trim(),
        quantity: form.quantity.trim(),
        size_breakdown: form.size_breakdown.trim(),
        personalization: form.personalization,
        artwork_url: form.artwork_url,

        date_needed: date.value ?? "",
        delivery_method: form.delivery_method,
        project_details: form.project_details.trim(),
      });

      setStatus("sent");
      setForm(EMPTY);
      setGroups({
        order_types: [],
        garment_types: [],
        print_locations: [],
        artwork_status: [],
      });
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof Error ? err.message : "Could not send your request."
      );
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-[#F4F4F5] rounded-[24px] p-10 md:p-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-3">
          Request received
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Thank you! We&apos;ll review your apparel request and contact you with
          pricing and next steps. Approval and payment are required.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/products">
            <Button size="xl">Keep shopping</Button>
          </Link>
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
      noValidate
    >
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-black">Who should we contact?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">Full name *</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={field("full_name")}
              required
              autoComplete="name"
              placeholder="Jane Cooper"
              className={INPUT}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="business_name">Business name</Label>
            <Input
              id="business_name"
              value={form.business_name}
              onChange={field("business_name")}
              autoComplete="organization"
              placeholder="Acme Prints LLC"
              className={INPUT}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={field("email")}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={INPUT}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone *</Label>
          <div className="flex gap-3">
            <Input
              aria-label="Country code"
              value={form.phone_country_code}
              onChange={field("phone_country_code")}
              placeholder="+1"
              className={`${INPUT} w-20 shrink-0 text-center`}
            />
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={field("phone")}
              required
              autoComplete="tel"
              placeholder="3025550123"
              className={INPUT}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-black">What are we making?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tick everything that applies — it all helps us price accurately.
          </p>
        </div>

        <OptionGroup
          legend="Order type"
          options={ORDER_TYPES}
          selected={groups.order_types}
          onToggle={toggle("order_types")}
        />

        <OptionGroup
          legend="Garment type(s)"
          options={GARMENT_TYPES}
          selected={groups.garment_types}
          onToggle={toggle("garment_types")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="garment_colors">Garment colour(s)</Label>
            <textarea
              id="garment_colors"
              rows={3}
              value={form.garment_colors}
              onChange={field("garment_colors")}
              placeholder="Black, heather grey, white"
              className={TEXTAREA}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="size_breakdown">Size breakdown</Label>
            <textarea
              id="size_breakdown"
              rows={3}
              value={form.size_breakdown}
              onChange={field("size_breakdown")}
              placeholder="10× S, 25× M, 25× L, 15× XL"
              className={TEXTAREA}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:max-w-xs">
          <Label htmlFor="quantity">Total quantity</Label>
          <Input
            id="quantity"
            value={form.quantity}
            onChange={field("quantity")}
            placeholder="75"
            className={INPUT}
          />
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-black">Decoration</h2>

        <OptionGroup
          legend="Print locations"
          options={PRINT_LOCATIONS}
          selected={groups.print_locations}
          onToggle={toggle("print_locations")}
        />

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-black">
            Personalization needed?
          </legend>
          <div className="grid gap-x-6 gap-y-2.5 rounded-xl border border-[#E5E5E5] p-4 sm:grid-cols-2">
            {PERSONALIZATION.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 text-[#464545] transition-colors hover:text-black"
              >
                <input
                  type="radio"
                  name="personalization"
                  value={option}
                  checked={form.personalization === option}
                  onChange={field("personalization")}
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="text-sm leading-snug">{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="border-t border-gray-200" />

      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-black">Artwork</h2>
          <p className="text-sm text-gray-500 mt-1">
            Optional, but sending it now saves a round trip.
          </p>
        </div>

        <OptionGroup
          legend="Artwork status"
          options={ARTWORK_STATUS}
          selected={groups.artwork_status}
          onToggle={toggle("artwork_status")}
          columns={1}
        />

        <DocumentField
          id="apparel-artwork"
          label="Upload artwork or reference"
          hint="Upload a file, or paste a link to a PDF or Drive folder."
          value={form.artwork_url}
          onChange={(url) => setForm((c) => ({ ...c, artwork_url: url }))}
        />
      </div>

      <div className="border-t border-gray-200" />

      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-black">Timing and delivery</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date_mm">Date needed</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                id="date_mm"
                value={form.date_mm}
                onChange={field("date_mm")}
                placeholder="MM"
                inputMode="numeric"
                maxLength={2}
                aria-label="Month needed"
                className={`${INPUT} text-center`}
              />
              <Input
                value={form.date_dd}
                onChange={field("date_dd")}
                placeholder="DD"
                inputMode="numeric"
                maxLength={2}
                aria-label="Day needed"
                className={`${INPUT} text-center`}
              />
              <Input
                value={form.date_yyyy}
                onChange={field("date_yyyy")}
                placeholder="YYYY"
                inputMode="numeric"
                maxLength={4}
                aria-label="Year needed"
                className={`${INPUT} text-center`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="delivery_method">Delivery method</Label>
            <select
              id="delivery_method"
              value={form.delivery_method}
              onChange={field("delivery_method")}
              className={`${INPUT} w-full border border-[#E5E5E5] bg-white px-4 transition-colors focus:border-primary focus:outline-none`}
            >
              <option value="">Select a delivery method</option>
              {DELIVERY_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="project_details">Project details</Label>
          <textarea
            id="project_details"
            rows={4}
            value={form.project_details}
            onChange={field("project_details")}
            placeholder="Anything else we should know — deadlines, brand colours, reference links."
            className={TEXTAREA}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="xl" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request my quote"}
        </Button>
        <span className="text-sm text-gray-500">
          We reply with pricing and next steps.
        </span>
      </div>
    </form>
  );
}

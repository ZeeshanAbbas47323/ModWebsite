"use client";

import { useState } from "react";
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

const FIELD =
  "w-full rounded-lg bg-[#F7F8FA] border border-transparent px-4 py-3 text-black placeholder:text-[#8A8A8A] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function CheckGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-bold text-white mb-2">{legend}</legend>
      {options.map((option) => (
        <label
          key={option}
          className="flex cursor-pointer items-center gap-3 text-white/90"
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
            className="size-4 shrink-0 accent-primary"
          />
          <span className="text-sm">{option}</span>
        </label>
      ))}
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
        phone_country_code: form.phone_country_code,
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
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-[24px] bg-[#111318] p-8 md:p-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Request received</h2>
        <p className="text-white/80 leading-relaxed">
          Thank you! We&apos;ll review your apparel request and contact you with
          pricing and next steps. Approval and payment are required.
        </p>
        <Button className="mt-6" onClick={() => setStatus("idle")}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] bg-[#111318] p-6 md:p-10"
      noValidate
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Request a Custom Apparel Quote
        </h2>
        <p className="mt-2 text-white/75 max-w-lg mx-auto">
          Request pricing for custom shirts, hoodies, sweatsuits, hats, uniforms,
          team apparel and other bulk orders.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        <Input
          required
          value={form.full_name}
          onChange={field("full_name")}
          placeholder="Full Name"
          aria-label="Full name"
          className={FIELD}
        />
        <Input
          value={form.business_name}
          onChange={field("business_name")}
          placeholder="Business name"
          aria-label="Business name"
          className={FIELD}
        />
        <Input
          required
          type="email"
          value={form.email}
          onChange={field("email")}
          placeholder="Email"
          aria-label="Email"
          className={FIELD}
        />

        <div className="flex gap-3">
          <select
            value={form.phone_country_code}
            onChange={field("phone_country_code")}
            aria-label="Country calling code"
            className={`${FIELD} w-28 shrink-0`}
          >
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+92">🇵🇰 +92</option>
            <option value="+91">🇮🇳 +91</option>
            <option value="+61">🇦🇺 +61</option>
          </select>
          <Input
            required
            value={form.phone}
            onChange={field("phone")}
            placeholder="Phone Number"
            aria-label="Phone number"
            className={FIELD}
          />
        </div>

        <CheckGroup
          legend="Order Type"
          options={ORDER_TYPES}
          selected={groups.order_types}
          onToggle={toggle("order_types")}
        />

        <CheckGroup
          legend="Garment Type(s)"
          options={GARMENT_TYPES}
          selected={groups.garment_types}
          onToggle={toggle("garment_types")}
        />

        <textarea
          value={form.garment_colors}
          onChange={field("garment_colors")}
          placeholder="Garment Color(s)"
          aria-label="Garment colours"
          rows={3}
          className={FIELD}
        />

        <Input
          value={form.quantity}
          onChange={field("quantity")}
          placeholder="Quantity"
          aria-label="Quantity"
          className={FIELD}
        />

        <textarea
          value={form.size_breakdown}
          onChange={field("size_breakdown")}
          placeholder="Size Breakdown"
          aria-label="Size breakdown"
          rows={3}
          className={FIELD}
        />

        <CheckGroup
          legend="Print Locations"
          options={PRINT_LOCATIONS}
          selected={groups.print_locations}
          onToggle={toggle("print_locations")}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-bold text-white mb-2">
            Personalization Needed?
          </legend>
          {PERSONALIZATION.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 text-white/90"
            >
              <input
                type="radio"
                name="personalization"
                value={option}
                checked={form.personalization === option}
                onChange={field("personalization")}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </fieldset>

        <CheckGroup
          legend="Artwork Status"
          options={ARTWORK_STATUS}
          selected={groups.artwork_status}
          onToggle={toggle("artwork_status")}
        />

        <div className="[&_label]:text-white [&_p]:text-white/60">
          <DocumentField
            id="apparel-artwork"
            label="Upload Artwork or Reference"
            value={form.artwork_url}
            onChange={(url) =>
              setForm((current) => ({ ...current, artwork_url: url }))
            }
          />
        </div>

        <div>
          <Label className="text-sm font-bold text-white">Date Needed</Label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <Input
              value={form.date_mm}
              onChange={field("date_mm")}
              placeholder="MM"
              inputMode="numeric"
              maxLength={2}
              aria-label="Month needed"
              className={FIELD}
            />
            <Input
              value={form.date_dd}
              onChange={field("date_dd")}
              placeholder="DD"
              inputMode="numeric"
              maxLength={2}
              aria-label="Day needed"
              className={FIELD}
            />
            <Input
              value={form.date_yyyy}
              onChange={field("date_yyyy")}
              placeholder="YYYY"
              inputMode="numeric"
              maxLength={4}
              aria-label="Year needed"
              className={FIELD}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-bold text-white">Delivery Method</Label>
          <select
            value={form.delivery_method}
            onChange={field("delivery_method")}
            aria-label="Delivery method"
            className={`${FIELD} mt-2`}
          >
            <option value="">Select a delivery method</option>
            {DELIVERY_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={form.project_details}
          onChange={field("project_details")}
          placeholder="Project Details"
          aria-label="Project details"
          rows={4}
          className={FIELD}
        />

        {error && (
          <p className="text-sm font-medium text-red-400" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="xxl"
          disabled={status === "sending"}
          className="w-full"
        >
          {status === "sending" ? "Sending…" : "Request My Quote"}
        </Button>

        <p className="text-center text-xs font-bold text-white/80">
          Thank you! We&apos;ll review your apparel request and contact you with
          pricing and next steps. Approval and payment are required.
        </p>
      </div>
    </form>
  );
}

import { cn } from "@/lib/utils";

/** Colour families for the order lifecycle, so a glance reads the state. */
const TONES: Record<string, string> = {
  booked: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  in_production: "bg-amber-50 text-amber-700 border-amber-200",
  ready: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-red-50 text-red-700 border-red-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export function OrderStatusBadge({
  status,
  label,
  className,
}: {
  status?: string | null;
  label?: string;
  className?: string;
}) {
  if (!status) return null;
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold capitalize",
        TONES[key] ?? "bg-gray-100 text-gray-700 border-gray-200",
        className
      )}
    >
      {label && <span className="font-normal opacity-70">{label}</span>}
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

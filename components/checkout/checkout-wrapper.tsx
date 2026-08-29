"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useAddresses } from "@/hooks/use-addresses";
import { usePickupLocations } from "@/hooks/use-pickup-locations";
import { orderService, orderReference, type CreateOrderInput, type DeliveryType } from "@/services/order.service";
import { addressService } from "@/services/address.service";
import {
  checkoutRedirectUrl,
  isOfflineMethod,
  isSplitMethod,
  paymentService,
  type PaymentMethod,
} from "@/services/payment.service";
import type { CreateAddressInput } from "@/services/address.service";
import { omitEmpty } from "@/lib/utils";

const NEW_ADDRESS = "new";

const emptyAddress: CreateAddressInput = {
  full_name: "",
  phone: "",
  email: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "United States",
  type: "shipping",
};

export function CheckoutWrapper() {
  const router = useRouter();
  const { lines, subtotal, discount, total, coupon, clearCart, isLoading } = useCart();
  const { user, isAuthenticated, isReady } = useAuth();

  // Contact fields fall back to the signed-in profile until the customer
  // types something, so no effect is needed to prefill them.
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string | null>(null);
  const [fullNameInput, setFullNameInput] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home_delivery");
  const [addressIdInput, setAddressIdInput] = useState<string | null>(null);
  const [address, setAddress] = useState<CreateAddressInput>(emptyAddress);
  const [pickupLocationIdInput, setPickupLocationIdInput] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  // Split payments settle part online now and the rest on collection.
  const [splitPayment, setSplitPayment] = useState(false);
  const [onlineAmountInput, setOnlineAmountInput] = useState("");
  const [notes, setNotes] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billing, setBilling] = useState<CreateAddressInput>({ ...emptyAddress, type: "billing" });
  const [saveAddress, setSaveAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const { data: savedAddresses } = useAddresses(isReady && isAuthenticated);
  const { data: pickupLocations } = usePickupLocations(deliveryType === "store_pickup");

  const email = emailInput ?? user?.email ?? "";
  const phone = phoneInput ?? user?.phone ?? "";
  const fullName = fullNameInput ?? user?.full_name ?? "";

  // Default to the customer's saved default address when one exists.
  const defaultAddress =
    savedAddresses?.find((a) => a.is_default) ?? savedAddresses?.[0];
  const addressId =
    addressIdInput ?? (defaultAddress ? String(defaultAddress.id) : NEW_ADDRESS);

  const pickupLocationId =
    pickupLocationIdInput ??
    (pickupLocations?.length ? String(pickupLocations[0].id) : "");

  const setAddressField = (field: keyof CreateAddressInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((a) => ({ ...a, [field]: e.target.value }));

  const setBillingField = (field: keyof CreateAddressInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setBilling((a) => ({ ...a, [field]: e.target.value }));

  const usingNewAddress = addressId === NEW_ADDRESS;

  // Splitting turns the chosen gateway into its "…_and_cash" variant.
  const canSplit = paymentMethod === "stripe" || paymentMethod === "paypal";
  const effectiveMethod: PaymentMethod =
    splitPayment && canSplit
      ? paymentMethod === "stripe"
        ? "stripe_and_cash"
        : "paypal_and_cash"
      : paymentMethod;

  /**
   * Optional address fields are validated by type, so blank strings are
   * rejected the same way nulls are. Send only what was filled in.
   */
  const cleanAddress = (input: CreateAddressInput): CreateAddressInput =>
    omitEmpty({
      ...input,
      address_line2: input.address_line2?.trim() || null,
      state: input.state?.trim() || null,
      postal_code: input.postal_code?.trim() || null,
      country: input.country?.trim() || null,
      email: input.email?.trim() || null,
    }) as CreateAddressInput;

  const validate = (): string | null => {
    if (lines.length === 0) return "Your cart is empty.";
    if (!email.trim()) return "Email is required.";
    if (deliveryType === "store_pickup") {
      if (!pickupLocationId) return "Please choose a pickup location.";
      return null;
    }
    if (usingNewAddress) {
      if (!address.full_name.trim()) return "Shipping name is required.";
      if (!address.phone.trim()) return "Shipping phone is required.";
      if (!address.address_line1.trim()) return "Street address is required.";
      if (!address.city.trim()) return "City is required.";
    }
    if (isSplitMethod(effectiveMethod)) {
      // The exact split is checked against the order total once it exists, but
      // an empty or nonsense amount can be caught before anything is created.
      const online = Number(onlineAmountInput);
      if (!Number.isFinite(online) || online <= 0) {
        return "Enter how much you want to pay now.";
      }
    }
    if (!billingSameAsShipping) {
      if (!billing.full_name.trim()) return "Billing name is required.";
      if (!billing.phone.trim()) return "Billing phone is required.";
      if (!billing.address_line1.trim()) return "Billing street address is required.";
      if (!billing.city.trim()) return "Billing city is required.";
    }
    return null;
  };

  const handlePlaceOrder = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setPlacing(true);

    try {
      const payload: CreateOrderInput = {
        email: email.trim(),
        phone: phone.trim() || undefined,
        full_name: fullName.trim() || undefined,
        delivery_type: deliveryType,
        items: lines.map((line) =>
          omitEmpty({
            product_id: line.product_id,
            variant_id: line.variant_id,
            quantity: line.quantity,
            print_method: line.print_method,
            custom_text: line.custom_text,
            design_uploads: line.design_uploads?.length ? line.design_uploads : null,
          })
        ) as CreateOrderInput["items"],
        ...(coupon ? { coupon_code: coupon.code } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      if (deliveryType === "store_pickup") {
        payload.pickup_location_id = Number(pickupLocationId);
      } else if (usingNewAddress) {
        payload.shipping_address = cleanAddress({ ...address, email: address.email || email });
      } else {
        payload.shipping_address_id = Number(addressId);
      }

      if (deliveryType === "home_delivery" && !billingSameAsShipping) {
        payload.billing_address = cleanAddress({ ...billing, email: billing.email || email });
      }

      // Saving is best-effort: a failure here must not block the order.
      if (saveAddress && isAuthenticated && usingNewAddress && deliveryType === "home_delivery") {
        try {
          await addressService.create(cleanAddress({ ...address, email: address.email || email }));
        } catch {
          // ignore
        }
      }

      const order = await orderService.create(payload);
      const orderCode = orderReference(order);

      if (!orderCode) throw new Error("Order was created but no order number was returned.");

      // Offline methods never leave the site — there is no gateway to visit.
      if (isOfflineMethod(effectiveMethod)) {
        await clearCart();
        router.push(`/payment/success?order=${encodeURIComponent(orderCode)}`);
        return;
      }

      // The order's own total is authoritative: the API adds shipping and tax,
      // so splitting against the cart estimate would not add up.
      const orderTotal = Number(order.total_amount ?? 0) || total;
      const online = Number(onlineAmountInput);
      if (isSplitMethod(effectiveMethod) && !(online > 0 && online < orderTotal)) {
        setError(
          `Enter how much to pay now — more than $0 and less than $${orderTotal.toFixed(2)}.`
        );
        setPlacing(false);
        return;
      }

      const origin = window.location.origin;
      const session = await paymentService.createCheckoutSession({
        order_code: orderCode,
        payment_method: effectiveMethod,
        success_url: `${origin}/payment/success?order=${encodeURIComponent(orderCode)}`,
        cancel_url: `${origin}/payment/cancel?order=${encodeURIComponent(orderCode)}`,
        ...(isSplitMethod(effectiveMethod)
          ? { online_amount: online, cash_amount: orderTotal - online }
          : {}),
        metadata: { source: "web" },
      });

      const redirectUrl = checkoutRedirectUrl(session);
      if (!redirectUrl) {
        // Never fall through to the confirmation page here: the customer has
        // not paid, and telling them the order is done would be a lie. The
        // order exists, so point them at retrying it.
        throw new Error(
          `Your order ${orderCode} was placed, but the payment page could not be opened. ` +
            "Nothing has been charged — please try again or contact us."
        );
      }

      // The cart is deliberately left alone here — it is cleared on the success
      // page. Clearing before the gateway would leave a shopper who cancels
      // with an empty cart and nothing to retry.
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order.");
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <section className="container py-16">
        <div className="h-64 rounded-[24px] bg-[#F4F4F5] animate-pulse" />
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="container py-20 text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Nothing to check out</h1>
        <p className="text-gray-600 mb-8">Your cart is empty.</p>
        <Link href="/products"><Button size="xl">Browse products</Button></Link>
      </section>
    );
  }

  return (
    <section className="container pt-10 pb-20 md:pt-16 md:pb-32">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-3">Checkout</h1>
      {!isAuthenticated && (
        <p className="text-gray-600 mb-8">
          Checking out as a guest.{" "}
          <Link href="/login?redirect=/checkout" className="underline font-medium text-black">Sign in</Link>{" "}
          to use your saved addresses.
        </p>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-6">
        {/* Left: form */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          {/* Contact */}
          <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8">
            <h2 className="text-xl font-bold text-black mb-5">Contact details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmailInput(e.target.value)} className="bg-white h-12 rounded-xl" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullNameInput(e.target.value)} className="bg-white h-12 rounded-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhoneInput(e.target.value)} className="bg-white h-12 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8">
            <h2 className="text-xl font-bold text-black mb-5">Delivery method</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {([
                { value: "home_delivery", label: "Ship to me" },
                { value: "store_pickup", label: "Store pickup" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDeliveryType(option.value)}
                  className={`flex-1 h-12 rounded-xl font-medium transition-colors ${
                    deliveryType === option.value
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-black/5"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {deliveryType === "store_pickup" ? (
              pickupLocations?.length ? (
                <div className="flex flex-col gap-2 max-w-md">
                  <Label>Pickup location</Label>
                  <Select value={pickupLocationId} onValueChange={setPickupLocationIdInput}>
                    <SelectTrigger className="w-full h-12 rounded-xl bg-white">
                      <SelectValue placeholder="Choose a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickupLocations.map((loc) => (
                        <SelectItem key={loc.id} value={String(loc.id)}>
                          {[loc.name, loc.city].filter(Boolean).join(" — ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No pickup locations available right now.</p>
              )
            ) : (
              <div className="flex flex-col gap-4">
                {!!savedAddresses?.length && (
                  <div className="flex flex-col gap-2 max-w-md">
                    <Label>Shipping address</Label>
                    <Select value={addressId} onValueChange={setAddressIdInput}>
                      <SelectTrigger className="w-full h-12 rounded-xl bg-white">
                        <SelectValue placeholder="Choose an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedAddresses.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {[a.full_name, a.address_line1, a.city].filter(Boolean).join(", ")}
                          </SelectItem>
                        ))}
                        <SelectItem value={NEW_ADDRESS}>Use a new address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {usingNewAddress && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="a_name">Full name *</Label>
                      <Input id="a_name" value={address.full_name} onChange={setAddressField("full_name")} className="bg-white h-12 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="a_phone">Phone *</Label>
                      <Input id="a_phone" value={address.phone} onChange={setAddressField("phone")} className="bg-white h-12 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="a_l1">Street address *</Label>
                      <Input id="a_l1" value={address.address_line1} onChange={setAddressField("address_line1")} className="bg-white h-12 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="a_l2">Apartment, suite (optional)</Label>
                      <Input id="a_l2" value={address.address_line2 ?? ""} onChange={setAddressField("address_line2")} className="bg-white h-12 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="a_city">City *</Label>
                      <Input id="a_city" value={address.city} onChange={setAddressField("city")} className="bg-white h-12 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="a_state">State</Label>
                      <Input id="a_state" value={address.state ?? ""} onChange={setAddressField("state")} className="bg-white h-12 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="a_zip">Postal code</Label>
                      <Input id="a_zip" value={address.postal_code ?? ""} onChange={setAddressField("postal_code")} className="bg-white h-12 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="a_country">Country</Label>
                      <Input id="a_country" value={address.country ?? ""} onChange={setAddressField("country")} className="bg-white h-12 rounded-xl" />
                    </div>

                    {isAuthenticated && (
                      <label className="sm:col-span-2 flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="w-4 h-4 accent-black"
                        />
                        Save this address to my account
                      </label>
                    )}
                  </div>
                )}

                {/* Billing */}
                <div className="border-t border-gray-300 pt-6 mt-2">
                  <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="w-4 h-4 accent-black"
                    />
                    Billing address is the same as shipping
                  </label>

                  {!billingSameAsShipping && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="b_name">Full name *</Label>
                        <Input id="b_name" value={billing.full_name} onChange={setBillingField("full_name")} className="bg-white h-12 rounded-xl" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="b_phone">Phone *</Label>
                        <Input id="b_phone" value={billing.phone} onChange={setBillingField("phone")} className="bg-white h-12 rounded-xl" />
                      </div>
                      <div className="flex flex-col gap-2 sm:col-span-2">
                        <Label htmlFor="b_l1">Street address *</Label>
                        <Input id="b_l1" value={billing.address_line1} onChange={setBillingField("address_line1")} className="bg-white h-12 rounded-xl" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="b_city">City *</Label>
                        <Input id="b_city" value={billing.city} onChange={setBillingField("city")} className="bg-white h-12 rounded-xl" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="b_state">State</Label>
                        <Input id="b_state" value={billing.state ?? ""} onChange={setBillingField("state")} className="bg-white h-12 rounded-xl" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="b_zip">Postal code</Label>
                        <Input id="b_zip" value={billing.postal_code ?? ""} onChange={setBillingField("postal_code")} className="bg-white h-12 rounded-xl" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="b_country">Country</Label>
                        <Input id="b_country" value={billing.country ?? ""} onChange={setBillingField("country")} className="bg-white h-12 rounded-xl" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8">
            <h2 className="text-xl font-bold text-black mb-5">Payment</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { value: "stripe", label: "Card", icon: "/images/payment-gateways/shop.png" },
                { value: "paypal", label: "PayPal", icon: "/images/payment-gateways/pay-pal.png" },
                { value: "bank_transfer", label: "Bank transfer", icon: null },
                { value: "cash", label: "Pay on collection", icon: null },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentMethod(option.value)}
                  className={`h-16 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 px-2 ${
                    paymentMethod === option.value
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-black/5"
                  }`}
                >
                  {option.icon && (
                    <Image src={option.icon} alt="" width={44} height={16} className="object-contain" />
                  )}
                  <span className="text-sm text-center leading-tight">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Split payment: part online now, the rest on collection. */}
            {canSplit && (
              <div className="mt-5">
                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitPayment}
                    onChange={(e) => setSplitPayment(e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                  Pay part now, the rest on collection
                </label>

                {splitPayment && (
                  <div className="flex flex-col gap-2 mt-3 max-w-xs">
                    <Label htmlFor="online_amount">Amount to pay now (USD)</Label>
                    <Input
                      id="online_amount"
                      type="number"
                      min={1}
                      step={1}
                      value={onlineAmountInput}
                      onChange={(e) => setOnlineAmountInput(e.target.value)}
                      placeholder={total > 0 ? (total / 2).toFixed(2) : "50"}
                      className="bg-white h-12 rounded-xl"
                    />
                    <p className="text-xs text-gray-500">
                      The balance is collected when you pick the order up. Shipping and
                      tax are added to your order, so the exact split is worked out
                      against the final total.
                    </p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <p className="text-sm text-gray-600 mt-4">
                We will email you our bank details once the order is placed. Production
                starts when the transfer clears.
              </p>
            )}

            <div className="flex flex-col gap-2 mt-6">
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" className="bg-white h-12 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
          <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8">
            <h2 className="text-xl font-bold text-black mb-6">Your order</h2>

            <div className="flex flex-col gap-4 mb-6">
              {lines.map((line) => (
                <div key={line.key} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0">
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      className="object-contain p-1"
                      {...(line.image.startsWith("http") ? { unoptimized: true } : {})}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">{line.name}</p>
                    <p className="text-xs text-gray-500">Qty {line.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-black">
                    ${(line.price * line.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount ({coupon?.code})</span>
                  <span className="font-bold">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping &amp; tax</span>
                <span className="font-bold">Confirmed at payment</span>
              </div>
            </div>

            <div className="border-t border-gray-300 mt-5 pt-5 flex justify-between items-center mb-6">
              <span className="font-bold text-black text-lg">Total</span>
              <span className="font-bold text-black text-xl">${total.toFixed(2)}</span>
            </div>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <Button size="xl" className="w-full" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? "Placing order…" : "Place order"}
            </Button>
            <Link href="/cart" className="block text-center text-sm text-gray-600 underline mt-4">
              Back to cart
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddresses } from "@/hooks/use-addresses";
import {
  addressService,
  type Address,
  type CreateAddressInput,
} from "@/services/address.service";

const emptyAddress: CreateAddressInput = {
  full_name: "",
  phone: "",
  email: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
  type: "shipping",
};

function formatAddress(a: Address) {
  return [a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country]
    .filter(Boolean)
    .join(", ");
}

export function AddressBook({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const { data: addresses, isLoading } = useAddresses(enabled);

  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateAddressInput>(emptyAddress);
  const [error, setError] = useState<string | null>(null);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) return addressService.update(editing.id, form);
      return addressService.create(form);
    },
    onSuccess: () => {
      closeForm();
      void refresh();
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Couldn't save the address."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => addressService.remove(id),
    onSuccess: () => void refresh(),
  });

  const makeDefault = useMutation({
    mutationFn: (id: number) => addressService.setDefault(id),
    onSuccess: () => void refresh(),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyAddress);
    setError(null);
    setCreating(true);
  };

  const openEdit = (address: Address) => {
    setCreating(false);
    setEditing(address);
    setError(null);
    setForm({
      full_name: address.full_name ?? "",
      phone: address.phone ?? "",
      email: address.email ?? "",
      address_line1: address.address_line1 ?? "",
      address_line2: address.address_line2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postal_code: address.postal_code ?? "",
      country: address.country ?? "US",
      type: address.type ?? "shipping",
      is_default: address.is_default,
    });
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setError(null);
  };

  const field =
    (key: keyof CreateAddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const formOpen = creating || !!editing;

  return (
    <div className="mt-14">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black">Saved addresses</h2>
        {!formOpen && (
          <Button variant="outline" onClick={openCreate}>
            Add address
          </Button>
        )}
      </div>

      {formOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            save.mutate();
          }}
          className="mb-8 grid gap-4 rounded-2xl border border-gray-200 p-5 sm:grid-cols-2"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-name">Full name</Label>
            <Input id="addr-name" value={form.full_name} onChange={field("full_name")} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-phone">Phone</Label>
            <Input id="addr-phone" value={form.phone} onChange={field("phone")} required />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="addr-line1">Address</Label>
            <Input id="addr-line1" value={form.address_line1} onChange={field("address_line1")} required />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="addr-line2">Apartment, suite (optional)</Label>
            <Input id="addr-line2" value={form.address_line2 ?? ""} onChange={field("address_line2")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-city">City</Label>
            <Input id="addr-city" value={form.city} onChange={field("city")} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-state">State</Label>
            <Input id="addr-state" value={form.state ?? ""} onChange={field("state")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-zip">Postal code</Label>
            <Input id="addr-zip" value={form.postal_code ?? ""} onChange={field("postal_code")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-country">Country</Label>
            <Input id="addr-country" value={form.country ?? ""} onChange={field("country")} required />
          </div>

          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : editing ? "Save changes" : "Add address"}
            </Button>
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F4F4F5]" />
          ))}
        </div>
      ) : !addresses?.length ? (
        <div className="rounded-[24px] bg-[#F4F4F5] p-10 text-center">
          <p className="text-gray-600">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-black">{address.full_name}</p>
                  {address.is_default && (
                    <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{formatAddress(address)}</p>
                {address.phone && (
                  <p className="text-sm text-gray-500">{address.phone}</p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={makeDefault.isPending}
                    onClick={() => makeDefault.mutate(address.id)}
                  >
                    Make default
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => openEdit(address)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(address.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AppointmentStatus, PaymentStatus } from "@/app/_prisma/enums";
import { createAppointmentAction } from "@/app/_lib/serverActions/appointment";

type ClientOption = { id: string; firstName: string; lastName: string };
type ServiceOption = {
  id: string;
  title: string;
  price: string;
  durationMinutes: number;
};

interface ComponentProps {
  csrfToken: string;
  clients: ClientOption[];
  services: ServiceOption[];
}

export default function AppointmentCreateForm({
  csrfToken,
  clients,
  services
}: ComponentProps) {
  const serviceMap = useMemo(
    () => new Map(services.map((s) => [s.id, s])),
    [services]
  );
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  function handleServiceChange(value: string) {
    const service = serviceMap.get(value);
    if (!service) return;
    setDurationMinutes(String(service.durationMinutes));
    setPrice(String(service.price));
  }

  return (
    <form action={createAppointmentAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <select name="clientId" required className="rounded-md border px-3 py-2 text-sm">
        <option value="">Client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.firstName} {client.lastName}
          </option>
        ))}
      </select>
      <select
        name="serviceId"
        required
        className="rounded-md border px-3 py-2 text-sm"
        onChange={(event) => handleServiceChange(event.target.value)}
      >
        <option value="">Service</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.title}
          </option>
        ))}
      </select>
      <input
        name="startAt"
        type="datetime-local"
        required
        className="rounded-md border px-3 py-2 text-sm"
      />
      <input
        name="durationMinutes"
        type="number"
        placeholder="Min"
        required
        className="w-24 rounded-md border px-3 py-2 text-sm"
        value={durationMinutes}
        onChange={(event) => setDurationMinutes(event.target.value)}
      />
      <input
        name="price"
        type="number"
        step="0.01"
        placeholder="Price"
        className="w-28 rounded-md border px-3 py-2 text-sm"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      />
      <input
        name="notes"
        placeholder="Notes"
        className="w-40 rounded-md border px-3 py-2 text-sm"
      />
      <select name="status" className="rounded-md border px-3 py-2 text-sm">
        {Object.values(AppointmentStatus).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <select name="paymentStatus" className="rounded-md border px-3 py-2 text-sm">
        {Object.values(PaymentStatus).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Add
      </button>
    </form>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
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
  existingAppointments: { startAt: string; durationMinutes: number }[];
  workdayStart: string;
  workdayEnd: string;
}

export default function AppointmentCreateForm({
  csrfToken,
  clients,
  services,
  existingAppointments,
  workdayStart,
  workdayEnd
}: ComponentProps) {
  const serviceMap = useMemo(
    () => new Map(services.map((s) => [s.id, s])),
    [services]
  );
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState<string>("10:00");
  const serviceRef = useRef<HTMLSelectElement | null>(null);
  const timeRef = useRef<HTMLInputElement | null>(null);
  const timePickStageRef = useRef<number>(0);

  function toMinutes(value: string) {
    const [h, m] = value.split(":").map((n) => Number(n));
    return h * 60 + m;
  }

  function localDateKey(dateObj: Date) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const availability = useMemo(() => {
    if (!date || !durationMinutes) return [];
    const duration = Number(durationMinutes);
    if (!duration || duration <= 0) return [];
    const dayAppointments = existingAppointments
      .map((appt) => ({
        startAt: new Date(appt.startAt),
        durationMinutes: appt.durationMinutes
      }))
      .filter((appt) => localDateKey(appt.startAt) === date)
      .map((appt) => {
        const start = appt.startAt.getHours() * 60 + appt.startAt.getMinutes();
        return { start, end: start + appt.durationMinutes };
      });

    const slots: { time: string; available: boolean }[] = [];
    const startDay = toMinutes(workdayStart || "08:00");
    const endDay = toMinutes(workdayEnd || "18:00");
    for (let t = startDay; t <= endDay - duration; t += 30) {
      const end = t + duration;
      const conflict = dayAppointments.some(
        (a) => t < a.end && end > a.start
      );
      const hh = String(Math.floor(t / 60)).padStart(2, "0");
      const mm = String(t % 60).padStart(2, "0");
      slots.push({ time: `${hh}:${mm}`, available: !conflict });
    }
    return slots;
  }, [date, durationMinutes, existingAppointments]);

  function handleServiceChange(value: string) {
    const service = serviceMap.get(value);
    if (!service) return;
    setDurationMinutes(String(service.durationMinutes));
    setPrice(String(service.price));
    requestAnimationFrame(() => {
      const input = timeRef.current;
      if (!input) return;
      timePickStageRef.current = 0;
      if (typeof (input as any).showPicker === "function") {
        (input as any).showPicker();
      } else {
        input.focus();
        input.click();
      }
    });
  }

  function buildStartAtValue(dateValue: string, timeValue: string) {
    if (!dateValue || !timeValue) return "";
    const normalizedTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
    const local = new Date(`${dateValue}T${normalizedTime}`);
    const offsetMinutes = -local.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return `${dateValue}T${normalizedTime}${sign}${hh}:${mm}`;
  }

  return (
    <form action={createAppointmentAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input
        type="hidden"
        name="startAt"
        value={buildStartAtValue(date, time)}
      />
      <select
        name="clientId"
        required
        className="rounded-md border px-3 py-2 text-sm"
        onChange={(event) => {
          if (!event.target.value) return;
          requestAnimationFrame(() => {
            const select = serviceRef.current;
            if (!select) return;
            if (typeof (select as any).showPicker === "function") {
              (select as any).showPicker();
            } else {
              select.focus();
              select.click();
            }
          });
        }}
      >
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
        ref={serviceRef}
      >
        <option value="">Service</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.title}
          </option>
        ))}
      </select>
      <input
        type="date"
        required
        className="rounded-md border px-3 py-2 text-sm"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
      <input
        type="time"
        required
        className="rounded-md border px-3 py-2 text-sm"
        value={time}
        onChange={(event) => {
          setTime(event.target.value);
          if (timePickStageRef.current === 0) {
            timePickStageRef.current = 1;
            return;
          }
          requestAnimationFrame(() => {
            timeRef.current?.blur();
            timePickStageRef.current = 0;
          });
        }}
        ref={timeRef}
      />
      {availability.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {availability.map((slot) => (
            <button
              key={slot.time}
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${
                slot.available
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              onClick={() => {
                if (!slot.available) return;
                setTime(slot.time);
              }}
              disabled={!slot.available}
            >
              {slot.time}
            </button>
          ))}
        </div>
      ) : null}
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

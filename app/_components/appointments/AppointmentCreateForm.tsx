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
  const dateRef = useRef<HTMLInputElement | null>(null);
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
    <form
      action={createAppointmentAction}
      className="w-full min-w-0 max-w-full rounded-2xl border bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input
        type="hidden"
        name="startAt"
        value={buildStartAtValue(date, time)}
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1.2fr_0.8fr_0.7fr]">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Client
          </div>
          <select
            name="clientId"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
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
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Service
          </div>
          <select
            name="serviceId"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
            onChange={(event) => handleServiceChange(event.target.value)}
            ref={serviceRef}
          >
            <option value="">Select service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Date</div>
          <input
            type="date"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            onClick={(event) => {
              const input = event.currentTarget as HTMLInputElement;
              if (typeof (input as any).showPicker === "function") {
                (input as any).showPicker();
              }
            }}
            ref={dateRef}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Time</div>
          <input
            type="time"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
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
            onClick={(event) => {
              const input = event.currentTarget as HTMLInputElement;
              timePickStageRef.current = 0;
              if (typeof (input as any).showPicker === "function") {
                (input as any).showPicker();
              }
            }}
            ref={timeRef}
          />
        </div>
      </div>

      {availability.length > 0 ? (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Available slots
          </div>
          <div className="grid min-w-0 max-w-full grid-flow-col auto-cols-max grid-rows-2 gap-2 overflow-x-auto pb-1">
            {availability.map((slot) => (
              <button
                key={slot.time}
                type="button"
                className={`whitespace-nowrap rounded-md border px-2 py-1 text-xs ${
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
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.6fr_0.6fr_1fr_0.7fr_0.7fr_auto]">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Duration (min)
          </div>
          <input
            name="durationMinutes"
            type="number"
            placeholder="Min"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Price</div>
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Price"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Notes</div>
          <input
            name="notes"
            placeholder="Notes"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Status</div>
          <select
            name="status"
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            {Object.values(AppointmentStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Payment
          </div>
          <select
            name="paymentStatus"
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            {Object.values(PaymentStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Add appointment
          </button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CalendarSlot, type CalendarSlotProps } from "@/components/ui/CalendarSlot";
import { FormField } from "@/components/ui/FormField";
import { timeSlots } from "@/lib/mock-data";
import { getBookedSlots } from "@/lib/actions/reservations";
import { formatDurationLabel } from "@/lib/format";
import {
  CATERING_PACKAGES,
  formatColones,
  type CateringPackageId,
} from "@/lib/pricing";
import type { ReservationFormState, Sport, UpdateField } from "./types";

const SPORT_OPTIONS: { label: string; value: Sport }[] = [
  { label: "Fútbol", value: "FUTBOL" },
  { label: "Básquetbol", value: "BASQUETBOL" },
  { label: "Vóleibol", value: "VOLEIBOL" },
];

export function StepFechaHora({
  form,
  updateField,
  totalAmount,
  maxDurationMinutes,
}: {
  form: ReservationFormState;
  updateField: UpdateField;
  totalAmount: number;
  maxDurationMinutes: number | null;
}) {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (!form.spaceId || !form.date) {
      setBookedSlots([]);
      return;
    }

    let cancelled = false;
    setLoadingAvailability(true);

    getBookedSlots(form.spaceId, form.date)
      .then((slots) => {
        if (!cancelled) setBookedSlots(slots);
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.spaceId, form.date]);

  function slotStatus(
    time: string,
    current: string | null,
    disableUpTo?: string | null,
  ): CalendarSlotProps["status"] {
    if (bookedSlots.includes(time)) return "booked";
    if (disableUpTo && time <= disableUpTo) return "disabled";
    if (current === time) return "selected";
    return "available";
  }

  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Solo la fila de "Hora de fin" necesita saber de maxDurationMinutes — la
  // de "Hora de inicio" sigue con slotStatus sin cambios.
  function exceedsMaxDuration(time: string): boolean {
    if (!maxDurationMinutes || !form.startTime) return false;
    return timeToMinutes(time) - timeToMinutes(form.startTime) > maxDurationMinutes;
  }

  function endTimeStatus(time: string): CalendarSlotProps["status"] {
    if (exceedsMaxDuration(time)) return "disabled";
    return slotStatus(time, form.endTime, form.startTime);
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-heading text-2xl text-neutral-900">
        Elige fecha y hora disponible
      </h2>

      <FormField
        type="date"
        label="Fecha del evento"
        name="date"
        value={form.date}
        onChange={(v) => updateField("date", v)}
        required
      />

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-800">
          Hora de inicio
          {loadingAvailability && (
            <span className="ml-2 text-xs font-normal text-neutral-600">
              Consultando disponibilidad…
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((time) => (
            <CalendarSlot
              key={time}
              date={form.date ? new Date(form.date) : new Date()}
              time={time}
              status={slotStatus(time, form.startTime)}
              onSelect={() => updateField("startTime", time)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-800">
          Hora de fin
        </p>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((time) => (
            <CalendarSlot
              key={time}
              date={form.date ? new Date(form.date) : new Date()}
              time={time}
              status={endTimeStatus(time)}
              onSelect={() => updateField("endTime", time)}
              title={
                exceedsMaxDuration(time) && maxDurationMinutes
                  ? `Excede el máximo de ${formatDurationLabel(maxDurationMinutes)} para este espacio`
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {form.spaceId === "salon-multiusos" && (
        <FormField
          type="number"
          label="Sets de mobiliario base (1 mesa + 6 sillas, ¢2.500 c/u)"
          name="baseFurnitureSets"
          value={String(form.baseFurnitureSets)}
          onChange={(v) => updateField("baseFurnitureSets", Number(v) || 0)}
          min={0}
        />
      )}

      {form.spaceId === "cocina-comedor" && (
        <FormField
          type="select"
          label="Paquete según cantidad de personas"
          name="cateringPackage"
          value={form.cateringPackage ?? ""}
          onChange={(v) => updateField("cateringPackage", v as CateringPackageId)}
          options={Object.entries(CATERING_PACKAGES).map(([id, pkg]) => ({
            label: `${pkg.label} — ${formatColones(pkg.price)}`,
            value: id,
          }))}
          required
        />
      )}

      {form.spaceId === "cancha-futsal" && (
        <FormField
          type="select"
          label="Deporte a jugar"
          name="sport"
          value={form.sport}
          onChange={(v) => updateField("sport", v as Sport)}
          options={SPORT_OPTIONS}
          helpText="Informativo — no cambia el monto de la reserva."
          required
        />
      )}

      {(form.spaceId === "salon-multiusos" || form.spaceId === "cocina-comedor") && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800">
            {form.spaceId === "cocina-comedor"
              ? "Extras individuales (si necesita más de lo que trae el paquete)"
              : "Extras individuales"}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              type="number"
              label="Mesas extra (¢1.000 c/u)"
              name="extraTables"
              value={String(form.extraTables)}
              onChange={(v) => updateField("extraTables", Number(v) || 0)}
              min={0}
            />
            <FormField
              type="number"
              label="Sillas extra (¢250 c/u)"
              name="extraChairs"
              value={String(form.extraChairs)}
              onChange={(v) => updateField("extraChairs", Number(v) || 0)}
              min={0}
            />
            <FormField
              type="number"
              label="Manteles extra (¢1.000 c/u)"
              name="extraTablecloths"
              value={String(form.extraTablecloths)}
              onChange={(v) => updateField("extraTablecloths", Number(v) || 0)}
              min={0}
            />
          </div>
        </div>
      )}

      <div className="rounded-lg bg-neutral-50 p-4">
        <p className="text-sm text-neutral-600">Monto total</p>
        <p className="font-heading text-2xl text-primary-blue">
          {formatColones(totalAmount)}
        </p>
      </div>
    </div>
  );
}

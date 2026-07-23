"use client";

import { CATERING_PACKAGES, formatColones } from "@/lib/pricing";
import {
  MARITAL_STATUS_LABELS,
  SPORT_LABELS,
  type ReservationFormState,
  type ReservationSpace,
  type UpdateField,
} from "./types";

export function StepResumen({
  form,
  updateField,
  selectedSpace,
  totalAmount,
}: {
  form: ReservationFormState;
  updateField: UpdateField;
  selectedSpace: ReservationSpace | null;
  totalAmount: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-2xl text-neutral-900">
        Resumen de tu reserva
      </h2>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-neutral-600">Espacio</dt>
        <dd className="text-neutral-900">{selectedSpace?.name}</dd>

        <dt className="text-neutral-600">Fecha</dt>
        <dd className="text-neutral-900">{form.date}</dd>

        <dt className="text-neutral-600">Horario</dt>
        <dd className="text-neutral-900">
          {form.startTime} - {form.endTime}
        </dd>

        {form.spaceId === "salon-multiusos" && (
          <>
            <dt className="text-neutral-600">Mobiliario base</dt>
            <dd className="text-neutral-900">
              {form.baseFurnitureSets} set(s)
            </dd>
          </>
        )}

        {form.spaceId === "cocina-comedor" && form.cateringPackage && (
          <>
            <dt className="text-neutral-600">Paquete</dt>
            <dd className="text-neutral-900">
              {CATERING_PACKAGES[form.cateringPackage].label}
            </dd>
          </>
        )}

        {form.spaceId === "cancha-futsal" && form.sport && (
          <>
            <dt className="text-neutral-600">Deporte</dt>
            <dd className="text-neutral-900">{SPORT_LABELS[form.sport]}</dd>
          </>
        )}

        {(form.spaceId === "salon-multiusos" ||
          form.spaceId === "cocina-comedor") && (
          <>
            <dt className="text-neutral-600">Extras</dt>
            <dd className="text-neutral-900">
              {form.extraTables} mesa(s), {form.extraChairs} silla(s),{" "}
              {form.extraTablecloths} mantel(es)
            </dd>
          </>
        )}

        <dt className="text-neutral-600">Contratista</dt>
        <dd className="text-neutral-900">
          {form.contractorName} · {form.contractorIdNumber} ·{" "}
          {form.contractorPhone}
        </dd>

        {form.contractorMaritalStatus && (
          <>
            <dt className="text-neutral-600">Estado civil</dt>
            <dd className="text-neutral-900">
              {MARITAL_STATUS_LABELS[form.contractorMaritalStatus] ?? "—"}
            </dd>
          </>
        )}

        <dt className="text-neutral-600">Actividad</dt>
        <dd className="text-neutral-900">
          {form.activityDescription} ({form.attendeesCount} personas)
        </dd>
      </dl>

      <div className="rounded-lg bg-neutral-50 p-4">
        <p className="text-sm text-neutral-600">Monto total</p>
        <p className="font-heading text-2xl text-primary-blue">
          {formatColones(totalAmount)}
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={form.termsAccepted}
          onChange={(e) => updateField("termsAccepted", e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span>
          Acepto las condiciones del contrato de uso de instalaciones: las
          instalaciones quedan sujetas a fiscalización de LA ADI, aplican
          multas por cancelación, y me comprometo a entregar el espacio en
          las mismas condiciones en que lo recibí.
        </span>
      </label>
    </div>
  );
}

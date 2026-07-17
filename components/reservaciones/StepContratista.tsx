"use client";

import { FormField } from "@/components/ui/FormField";
import {
  CONTRACTOR_PHONE_PATTERN,
  type ReservationFormState,
  type UpdateField,
} from "./types";

const MARITAL_STATUS_OPTIONS = [
  { label: "Soltero(a)", value: "SOLTERO" },
  { label: "Casado(a)", value: "CASADO" },
  { label: "Divorciado(a)", value: "DIVORCIADO" },
  { label: "Viudo(a)", value: "VIUDO" },
  { label: "Unión libre", value: "UNION_LIBRE" },
];

export function StepContratista({
  form,
  updateField,
}: {
  form: ReservationFormState;
  updateField: UpdateField;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl text-neutral-900">
        Tus datos de contacto
      </h2>

      <FormField
        type="text"
        label="Nombre completo"
        name="contractorName"
        value={form.contractorName}
        onChange={(v) => updateField("contractorName", v)}
        required
      />
      <FormField
        type="text"
        label="Cédula"
        name="contractorIdNumber"
        value={form.contractorIdNumber}
        onChange={(v) => updateField("contractorIdNumber", v)}
        required
      />
      <FormField
        type="tel"
        label="Teléfono"
        name="contractorPhone"
        value={form.contractorPhone}
        onChange={(v) => updateField("contractorPhone", v)}
        placeholder="8888-8888"
        helpText="8 dígitos, con o sin guion."
        error={
          form.contractorPhone !== "" &&
          !CONTRACTOR_PHONE_PATTERN.test(form.contractorPhone)
            ? "Ingresa un teléfono válido (ej. 8888-8888)."
            : undefined
        }
        required
      />
      <FormField
        type="text"
        label="Profesión"
        name="contractorProfession"
        value={form.contractorProfession}
        onChange={(v) => updateField("contractorProfession", v)}
        required
      />
      <FormField
        type="select"
        label="Estado civil"
        name="contractorMaritalStatus"
        value={form.contractorMaritalStatus}
        onChange={(v) =>
          updateField(
            "contractorMaritalStatus",
            v as ReservationFormState["contractorMaritalStatus"],
          )
        }
        options={MARITAL_STATUS_OPTIONS}
        required
      />
      <FormField
        type="text"
        label="Vecindario / dirección"
        name="contractorAddress"
        value={form.contractorAddress}
        onChange={(v) => updateField("contractorAddress", v)}
        required
      />
      <FormField
        type="textarea"
        label="Descripción de la actividad"
        name="activityDescription"
        value={form.activityDescription}
        onChange={(v) => updateField("activityDescription", v)}
        required
      />
      <FormField
        type="number"
        label="Cantidad de personas asistentes"
        name="attendeesCount"
        value={form.attendeesCount}
        onChange={(v) => updateField("attendeesCount", v)}
        min={1}
        required
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { timeSlots } from "@/lib/mock-data";
import { createManualReservation } from "@/lib/actions/reservations";

const PAYMENT_STATUS_OPTIONS = [
  { label: "Depósito pendiente", value: "DEPOSIT_PENDING" },
  { label: "50% pagado", value: "DEPOSIT_PAID" },
  { label: "100% pagado", value: "FULLY_PAID" },
];

const initialState = {
  spaceId: "",
  date: "",
  startTime: "",
  endTime: "",
  contractorName: "",
  contractorPhone: "",
  contractorIdNumber: "",
  contractorAddress: "",
  activityDescription: "",
  attendeesCount: "",
  paymentStatus: "",
};

// Para reservas coordinadas por fuera del sitio (WhatsApp, teléfono) —
// crea la fila directo, sin pasar por el flujo de depósito del wizard
// público. Sección expandible en vez de modal: más cómodo para un
// formulario con varios campos, sin la complejidad de manejar
// Escape/backdrop-click que sí tiene ReservationDetailModal.
export function AddManualReservationForm({
  spaces,
}: {
  spaces: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof typeof initialState>(
    key: K,
    value: string,
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Solo espacio/fecha/horario/nombre son obligatorios — el resto queda
  // opcional, el servidor aplica "No registrado"/0 si se dejan vacíos.
  const canSubmit =
    form.spaceId !== "" &&
    form.date !== "" &&
    form.startTime !== "" &&
    form.endTime !== "" &&
    form.startTime < form.endTime &&
    form.contractorName.trim() !== "" &&
    form.paymentStatus !== "";

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const result = await createManualReservation({
      spaceId: form.spaceId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      contractorName: form.contractorName,
      contractorPhone: form.contractorPhone || undefined,
      contractorIdNumber: form.contractorIdNumber || undefined,
      contractorAddress: form.contractorAddress || undefined,
      activityDescription: form.activityDescription || undefined,
      attendeesCount: form.attendeesCount ? Number(form.attendeesCount) : undefined,
      paymentStatus: form.paymentStatus as
        | "DEPOSIT_PENDING"
        | "DEPOSIT_PAID"
        | "FULLY_PAID",
    });

    setIsSubmitting(false);

    if (result.ok) {
      setForm(initialState);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-neutral-100 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-heading text-base text-neutral-900">
          + Agregar reserva manual
        </span>
        <span className="text-sm text-neutral-600">
          {open ? "Ocultar" : "Mostrar"}
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-xs text-neutral-600">
            Para reservas coordinadas por fuera del sitio (WhatsApp,
            teléfono). Solo el espacio, la fecha, el horario y el nombre
            son obligatorios.
          </p>

          <FormField
            type="select"
            label="Espacio"
            name="spaceId"
            value={form.spaceId}
            onChange={(v) => updateField("spaceId", v)}
            options={spaces.map((s) => ({ label: s.name, value: s.id }))}
            required
          />
          <FormField
            type="date"
            label="Fecha del evento"
            name="date"
            value={form.date}
            onChange={(v) => updateField("date", v)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              type="select"
              label="Hora de inicio"
              name="startTime"
              value={form.startTime}
              onChange={(v) => updateField("startTime", v)}
              options={timeSlots.map((t) => ({ label: t, value: t }))}
              required
            />
            <FormField
              type="select"
              label="Hora de fin"
              name="endTime"
              value={form.endTime}
              onChange={(v) => updateField("endTime", v)}
              options={timeSlots.map((t) => ({ label: t, value: t }))}
              required
            />
          </div>
          <FormField
            type="text"
            label="Nombre del contratista"
            name="contractorName"
            value={form.contractorName}
            onChange={(v) => updateField("contractorName", v)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              type="tel"
              label="Teléfono (opcional)"
              name="contractorPhone"
              value={form.contractorPhone}
              onChange={(v) => updateField("contractorPhone", v)}
              placeholder="No registrado"
            />
            <FormField
              type="text"
              label="Cédula (opcional)"
              name="contractorIdNumber"
              value={form.contractorIdNumber}
              onChange={(v) => updateField("contractorIdNumber", v)}
              placeholder="No registrado"
            />
          </div>
          <FormField
            type="text"
            label="Dirección (opcional)"
            name="contractorAddress"
            value={form.contractorAddress}
            onChange={(v) => updateField("contractorAddress", v)}
            placeholder="No registrado"
          />
          <FormField
            type="textarea"
            label="Descripción de la actividad (opcional)"
            name="activityDescription"
            value={form.activityDescription}
            onChange={(v) => updateField("activityDescription", v)}
            placeholder="No registrado"
          />
          <FormField
            type="number"
            label="Cantidad de personas (opcional)"
            name="attendeesCount"
            value={form.attendeesCount}
            onChange={(v) => updateField("attendeesCount", v)}
            min={0}
            placeholder="0"
          />
          <FormField
            type="select"
            label="Estado de pago"
            name="paymentStatus"
            value={form.paymentStatus}
            onChange={(v) => updateField("paymentStatus", v)}
            options={PAYMENT_STATUS_OPTIONS}
            required
          />

          {error && <p className="text-sm text-error">{error}</p>}

          <div>
            <Button
              variant="primary"
              disabled={!canSubmit}
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              Crear reserva
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

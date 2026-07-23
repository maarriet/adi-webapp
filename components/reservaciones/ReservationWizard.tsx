"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createReservation } from "@/lib/actions/reservations";
import { siteConfig } from "@/lib/site-config";
import {
  calculateSalonTotal,
  calculateCateringTotal,
  calculateDayNightRate,
  calculateDepositAmount,
  formatColones,
} from "@/lib/pricing";
import { StepEspacio } from "./StepEspacio";
import { StepFechaHora } from "./StepFechaHora";
import { StepContratista } from "./StepContratista";
import { StepResumen } from "./StepResumen";
import {
  CONTRACTOR_PHONE_PATTERN,
  initialReservationFormState,
  type ReservationFormState,
  type ReservationSpace,
} from "./types";

const STEP_LABELS = ["Espacio", "Fecha y hora", "Contratista", "Resumen"];

export function ReservationWizard({ spaces }: { spaces: ReservationSpace[] }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ReservationFormState>(
    initialReservationFormState,
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<K extends keyof ReservationFormState>(
    key: K,
    value: ReservationFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedSpace = spaces.find((s) => s.id === form.spaceId) ?? null;
  // Mismo criterio ya usado en StepFechaHora.tsx / app/admin/agenda —
  // las canchas no piden profesión/estado civil.
  const isCourt = selectedSpace?.maxDurationMinutes != null;

  const totalAmount =
    form.spaceId === "salon-multiusos"
      ? calculateSalonTotal({
          baseFurnitureSets: form.baseFurnitureSets,
          extraTables: form.extraTables,
          extraChairs: form.extraChairs,
          extraTablecloths: form.extraTablecloths,
        })
      : form.spaceId === "cocina-comedor"
        ? calculateCateringTotal({
            packageId: form.cateringPackage,
            extraTables: form.extraTables,
            extraChairs: form.extraChairs,
            extraTablecloths: form.extraTablecloths,
          })
        : form.spaceId === "cancha-futbol-11" || form.spaceId === "cancha-futsal"
          ? calculateDayNightRate({
              baseRate: selectedSpace?.baseRate ?? 0,
              nightRate: selectedSpace?.nightRate ?? null,
              endTime: form.endTime,
            })
          : 0;

  const canContinue = (() => {
    if (step === 1) return form.spaceId !== null;
    if (step === 2) {
      if (!form.date || !form.startTime || !form.endTime) return false;
      if (form.startTime >= form.endTime) return false;
      if (form.spaceId === "cocina-comedor" && !form.cateringPackage) return false;
      if (form.spaceId === "cancha-futsal" && !form.sport) return false;
      return true;
    }
    if (step === 3) {
      return (
        form.contractorName.trim() !== "" &&
        form.contractorIdNumber.trim() !== "" &&
        CONTRACTOR_PHONE_PATTERN.test(form.contractorPhone) &&
        (isCourt || form.contractorProfession.trim() !== "") &&
        (isCourt || form.contractorMaritalStatus !== "") &&
        form.contractorAddress.trim() !== "" &&
        form.activityDescription.trim() !== "" &&
        Number(form.attendeesCount) > 0
      );
    }
    return true;
  })();

  async function handleConfirm() {
    if (!form.spaceId || !form.date || !form.startTime || !form.endTime) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createReservation({
      spaceId: form.spaceId,
      spaceName: selectedSpace?.name ?? "",
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      contractorName: form.contractorName,
      contractorIdNumber: form.contractorIdNumber,
      contractorPhone: form.contractorPhone,
      contractorProfession: form.contractorProfession.trim() || null,
      contractorMaritalStatus: form.contractorMaritalStatus || null,
      contractorAddress: form.contractorAddress,
      activityDescription: form.activityDescription,
      attendeesCount: Number(form.attendeesCount),
      baseFurnitureSets: form.baseFurnitureSets,
      extraTables: form.extraTables,
      extraChairs: form.extraChairs,
      extraTablecloths: form.extraTablecloths,
      cateringPackage: form.cateringPackage,
      sport: form.sport || null,
      totalAmount,
      termsAccepted: form.termsAccepted,
    });

    setIsSubmitting(false);

    if (result.ok) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
  }

  function handleReset() {
    setForm(initialReservationFormState);
    setStep(1);
    setSubmitted(false);
    setSubmitError(null);
  }

  if (submitted) {
    const depositAmount = calculateDepositAmount(totalAmount);
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-heading text-3xl text-neutral-900">
          ¡Perfecto! Tu reserva ha sido confirmada.
        </h1>
        <p className="mt-4 text-neutral-600">
          Espacio: {selectedSpace?.name} · Fecha: {form.date} · Horario:{" "}
          {form.startTime} - {form.endTime}
        </p>
        <p className="mt-1 text-lg font-semibold text-primary-blue">
          Monto total: {formatColones(totalAmount)}
        </p>
        <p className="mt-1 text-base font-medium text-neutral-800">
          Monto para asegurar tu reserva (50%): {formatColones(depositAmount)}
        </p>

        <div className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-left text-sm text-neutral-800">
          Realiza el SINPE al <strong>{siteConfig.sinpeNumber}</strong> y
          envía el comprobante a este mismo número por WhatsApp para
          asegurar tu reserva. Si no se recibe el comprobante antes de la
          medianoche de hoy, el espacio se libera automáticamente.
        </div>

        <p className="mt-4 text-xs text-neutral-600">
          En unos minutos deberías recibir un mensaje de WhatsApp con estos
          mismos detalles.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="primary" onClick={handleReset}>
            Hacer otra reserva
          </Button>
          <Button variant="ghost" href="/">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <ol className="mb-8 flex items-center justify-between text-sm text-neutral-600">
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            className={`flex-1 text-center ${
              step === index + 1 ? "font-semibold text-primary-blue" : ""
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <StepEspacio
          spaces={spaces}
          value={form.spaceId}
          onChange={(id) => updateField("spaceId", id)}
        />
      )}
      {step === 2 && (
        <StepFechaHora
          form={form}
          updateField={updateField}
          totalAmount={totalAmount}
          maxDurationMinutes={selectedSpace?.maxDurationMinutes ?? null}
        />
      )}
      {step === 3 && (
        <StepContratista form={form} updateField={updateField} isCourt={isCourt} />
      )}
      {step === 4 && (
        <StepResumen
          form={form}
          updateField={updateField}
          selectedSpace={selectedSpace}
          totalAmount={totalAmount}
        />
      )}

      {submitError && (
        <p className="mt-4 rounded-md bg-error/10 px-4 py-2 text-sm text-error">
          {submitError}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          disabled={step === 1 || isSubmitting}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          Volver atrás
        </Button>

        {step < 4 ? (
          <Button
            variant="primary"
            disabled={!canContinue}
            onClick={() => setStep((s) => Math.min(4, s + 1))}
          >
            Continuar
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={!form.termsAccepted || isSubmitting}
            loading={isSubmitting}
            onClick={handleConfirm}
          >
            Confirmar reserva
          </Button>
        )}
      </div>
    </div>
  );
}

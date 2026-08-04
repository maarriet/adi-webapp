"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatLocalDate, formatTime } from "@/lib/format";
import { formatColones } from "@/lib/pricing";
import { reactivateReservation } from "@/lib/actions/reservations";

export type AutoExpiredReservationData = {
  id: string;
  contractorName: string;
  spaceName: string;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
};

function AutoExpiredRow({
  reservation,
}: {
  reservation: AutoExpiredReservationData;
}) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<
    "DEPOSIT_PAID" | "FULLY_PAID"
  >("DEPOSIT_PAID");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReactivate() {
    setIsSubmitting(true);
    setError(null);
    const result = await reactivateReservation(reservation.id, paymentStatus);
    setIsSubmitting(false);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-3">
      <p className="font-medium text-neutral-900">
        {reservation.contractorName}
      </p>
      <p className="text-sm text-primary-blue">{reservation.spaceName}</p>
      <p className="text-sm text-neutral-600">
        {formatLocalDate(reservation.startTime)} ·{" "}
        {formatTime(reservation.startTime)} -{" "}
        {formatTime(reservation.endTime)}
      </p>
      <p className="text-sm font-semibold text-neutral-900">
        {formatColones(reservation.totalAmount)}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={paymentStatus}
          onChange={(e) =>
            setPaymentStatus(e.target.value as "DEPOSIT_PAID" | "FULLY_PAID")
          }
          className="rounded-md border border-neutral-100 px-2 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-blue"
        >
          <option value="DEPOSIT_PAID">Comprobante del 50%</option>
          <option value="FULLY_PAID">Comprobante del 100%</option>
        </select>
        <Button variant="primary" size="sm" loading={isSubmitting} onClick={handleReactivate}>
          Reactivar y marcar pagada
        </Button>
      </div>

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

// Reservas que releaseExpiredDeposits canceló solas por depósito vencido —
// se pueden reactivar acá cuando el cliente manda el comprobante tarde.
// Mismo patrón visual colapsable que AddManualReservationForm.tsx.
export function AutoExpiredReservations({
  reservations,
}: {
  reservations: AutoExpiredReservationData[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-lg border border-neutral-100 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-heading text-base text-neutral-900">
          Reservas autocanceladas ({reservations.length})
        </span>
        <span className="text-sm text-neutral-600">
          {open ? "Ocultar" : "Mostrar"}
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3">
          {reservations.length === 0 ? (
            <p className="text-sm text-neutral-600">
              No hay reservas autocanceladas recientes.
            </p>
          ) : (
            reservations.map((reservation) => (
              <AutoExpiredRow key={reservation.id} reservation={reservation} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

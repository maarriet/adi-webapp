"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { formatLocalDate, formatTime } from "@/lib/format";
import { formatColones } from "@/lib/pricing";
import {
  cancelReservation,
  markDepositPaid,
  markFullyPaid,
} from "@/lib/actions/reservations";
import { ReservationDetailModal } from "./ReservationDetailModal";

export type ReservationCardData = {
  id: string;
  spaceId: string;
  spaceName: string;
  maxDurationMinutes: number | null;
  startTime: Date;
  endTime: Date;
  status: string;
  paymentStatus: string;
  contractorName: string;
  contractorPhone: string;
  contractorIdNumber: string;
  contractorProfession: string;
  contractorMaritalStatus: string;
  contractorAddress: string;
  activityDescription: string;
  attendeesCount: number;
  baseFurnitureSets: number | null;
  extraTables: number | null;
  extraChairs: number | null;
  extraTablecloths: number | null;
  cateringPackage: string | null;
  totalAmount: number;
  depositDeadline: Date | null;
  createdAt: Date;
};

export function ReservationCard({
  reservation,
  depositRequestWhatsappHref,
  dayReminderWhatsappHref,
}: {
  reservation: ReservationCardData;
  depositRequestWhatsappHref: string | null;
  dayReminderWhatsappHref: string | null;
}) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      `¿Estás seguro de cancelar la reserva de ${reservation.contractorName} para ${reservation.spaceName} el ${formatLocalDate(reservation.startTime)}?`,
    );
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      await cancelReservation(reservation.id);
      // cancelReservation ya llama revalidatePath("/admin/agenda") en el
      // servidor, pero como se invoca directo (no vía <form action>), hay
      // que forzar el refresh del router explícitamente para que la
      // tarjeta desaparezca sin recargar la página a mano.
      router.refresh();
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-base text-neutral-900">
            {reservation.contractorName}
          </p>
          <p className="text-sm text-neutral-600">{reservation.contractorPhone}</p>
        </div>
        <div className="text-right">
          {reservation.paymentStatus === "FULLY_PAID" ? (
            <span className="whitespace-nowrap rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              100% pagado
            </span>
          ) : reservation.paymentStatus === "DEPOSIT_PAID" ? (
            <span className="whitespace-nowrap rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              50% pagado
            </span>
          ) : (
            <>
              <span className="whitespace-nowrap rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                Depósito pendiente
              </span>
              {reservation.depositDeadline && (
                <p className="mt-1 text-xs text-warning">
                  Vence hoy {formatTime(reservation.depositDeadline)}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm text-primary-blue">{reservation.spaceName}</p>
      <p className="text-sm text-neutral-600">
        {formatLocalDate(reservation.startTime)} ·{" "}
        {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
      </p>
      <p className="text-sm font-semibold text-neutral-900">
        {formatColones(reservation.totalAmount)}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {reservation.paymentStatus === "DEPOSIT_PENDING" && (
          <>
            <form action={markDepositPaid.bind(null, reservation.id)}>
              <button
                type="submit"
                className="rounded-md bg-primary-blue px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-blue/90"
              >
                Marcar 50% pagado
              </button>
            </form>
            {depositRequestWhatsappHref && (
              <a
                href={depositRequestWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-primary-green px-3 py-1.5 text-sm font-medium text-primary-green transition-colors hover:bg-primary-green/10"
              >
                Enviar mensaje de reserva
              </a>
            )}
          </>
        )}

        {reservation.paymentStatus === "DEPOSIT_PAID" && (
          <>
            <form action={markFullyPaid.bind(null, reservation.id)}>
              <button
                type="submit"
                className="rounded-md bg-success px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-success/90"
              >
                Marcar 100% pagado
              </button>
            </form>
            {dayReminderWhatsappHref && (
              <a
                href={dayReminderWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-primary-green px-3 py-1.5 text-sm font-medium text-primary-green transition-colors hover:bg-primary-green/10"
              >
                Enviar recordatorio del día
              </a>
            )}
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          icon={<InformationCircleIcon className="h-4 w-4" />}
          onClick={() => setDetailOpen(true)}
        >
          Ver detalle
        </Button>

        <Button
          variant="danger"
          size="sm"
          icon={<XCircleIcon className="h-4 w-4" />}
          loading={isCancelling}
          onClick={handleCancel}
        >
          Cancelar reserva
        </Button>
      </div>

      {detailOpen && (
        <ReservationDetailModal
          reservation={reservation}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}

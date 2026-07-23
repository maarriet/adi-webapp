"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpTrayIcon,
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
import { uploadReceipt } from "@/lib/actions/receipts";
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
  // Solo aplican para Salón Multiusos y Cocina/Comedor — null para canchas.
  contractorProfession: string | null;
  contractorMaritalStatus: string | null;
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
  paymentConfirmedWhatsappHref,
  receiptSignedUrl,
}: {
  reservation: ReservationCardData;
  depositRequestWhatsappHref: string | null;
  dayReminderWhatsappHref: string | null;
  paymentConfirmedWhatsappHref: string | null;
  receiptSignedUrl: string | null;
}) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

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

  async function handleReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    setReceiptError(null);
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      const result = await uploadReceipt(reservation.id, formData);
      if (result.ok) {
        router.refresh();
      } else {
        setReceiptError(result.error);
      }
    } finally {
      setIsUploadingReceipt(false);
      // Permite volver a elegir el mismo archivo (ej. tras un error) sin
      // que el navegador ignore el cambio por ser el mismo valor.
      event.target.value = "";
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

        {(reservation.paymentStatus === "DEPOSIT_PAID" ||
          reservation.paymentStatus === "FULLY_PAID") &&
          paymentConfirmedWhatsappHref && (
            <a
              href={paymentConfirmedWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-primary-green px-3 py-1.5 text-sm font-medium text-primary-green transition-colors hover:bg-primary-green/10"
            >
              Enviar confirmación de pago
            </a>
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

      {/* Comprobante SINPE — siempre visible (no depende de paymentStatus,
          el comprobante puede llegar en cualquier momento, incluso antes
          de marcar el depósito como pagado). */}
      <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3">
        <input
          ref={receiptInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleReceiptChange}
        />
        {receiptSignedUrl ? (
          <>
            <a href={receiptSignedUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={receiptSignedUrl}
                alt="Comprobante de pago"
                className="h-10 w-10 rounded object-cover"
              />
            </a>
            <a
              href={receiptSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary-blue hover:underline"
            >
              Ver comprobante
            </a>
            <Button
              variant="ghost"
              size="sm"
              loading={isUploadingReceipt}
              onClick={() => receiptInputRef.current?.click()}
            >
              Reemplazar
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowUpTrayIcon className="h-4 w-4" />}
            loading={isUploadingReceipt}
            onClick={() => receiptInputRef.current?.click()}
          >
            Subir comprobante
          </Button>
        )}
        {receiptError && (
          <span className="text-xs text-error">{receiptError}</span>
        )}
      </div>

      {detailOpen && (
        <ReservationDetailModal
          reservation={reservation}
          receiptSignedUrl={receiptSignedUrl}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}

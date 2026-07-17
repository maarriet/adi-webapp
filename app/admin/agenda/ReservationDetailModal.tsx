"use client";

import { useEffect } from "react";
import { formatLocalDate, formatTime } from "@/lib/format";
import { CATERING_PACKAGES, formatColones } from "@/lib/pricing";
import { MARITAL_STATUS_LABELS } from "@/components/reservaciones/types";
import type { ReservationCardData } from "./ReservationCard";

const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente de confirmación",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

export function ReservationDetailModal({
  reservation,
  onClose,
}: {
  reservation: ReservationCardData;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de la reserva de ${reservation.contractorName}`}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-heading text-xl text-neutral-900">
            Detalle de la reserva
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-neutral-600 hover:text-neutral-900"
          >
            ✕
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-neutral-600">ID de reserva</dt>
          <dd className="break-all text-neutral-900">{reservation.id}</dd>

          <dt className="text-neutral-600">Estado</dt>
          <dd className="text-neutral-900">
            {RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status}
          </dd>

          <dt className="text-neutral-600">Creada el</dt>
          <dd className="text-neutral-900">
            {formatLocalDate(reservation.createdAt)} ·{" "}
            {formatTime(reservation.createdAt)}
          </dd>

          <dt className="text-neutral-600">Espacio</dt>
          <dd className="text-neutral-900">{reservation.spaceName}</dd>

          <dt className="text-neutral-600">Fecha y hora</dt>
          <dd className="text-neutral-900">
            {formatLocalDate(reservation.startTime)} ·{" "}
            {formatTime(reservation.startTime)} -{" "}
            {formatTime(reservation.endTime)}
          </dd>

          <dt className="text-neutral-600">Monto</dt>
          <dd className="text-neutral-900">
            {formatColones(reservation.totalAmount)}
          </dd>

          <dt className="col-span-2 mt-2 border-t border-neutral-100 pt-2 text-neutral-600">
            Datos del contratista
          </dt>

          <dt className="text-neutral-600">Cédula</dt>
          <dd className="text-neutral-900">{reservation.contractorIdNumber}</dd>

          <dt className="text-neutral-600">Profesión</dt>
          <dd className="text-neutral-900">{reservation.contractorProfession}</dd>

          <dt className="text-neutral-600">Estado civil</dt>
          <dd className="text-neutral-900">
            {MARITAL_STATUS_LABELS[reservation.contractorMaritalStatus] ??
              reservation.contractorMaritalStatus}
          </dd>

          <dt className="text-neutral-600">Dirección</dt>
          <dd className="text-neutral-900">{reservation.contractorAddress}</dd>

          <dt className="col-span-2 mt-2 border-t border-neutral-100 pt-2 text-neutral-600">
            Actividad
          </dt>

          <dt className="text-neutral-600">Descripción</dt>
          <dd className="text-neutral-900">{reservation.activityDescription}</dd>

          <dt className="text-neutral-600">Asistentes</dt>
          <dd className="text-neutral-900">{reservation.attendeesCount}</dd>

          {reservation.spaceId === "salon-multiusos" && (
            <>
              <dt className="text-neutral-600">Mobiliario</dt>
              <dd className="text-neutral-900">
                {reservation.baseFurnitureSets ?? 0} set(s) base,{" "}
                {reservation.extraTables ?? 0} mesa(s) extra,{" "}
                {reservation.extraChairs ?? 0} silla(s) extra,{" "}
                {reservation.extraTablecloths ?? 0} mantel(es) extra
              </dd>
            </>
          )}

          {reservation.spaceId === "cocina-comedor" && reservation.cateringPackage && (
            <>
              <dt className="text-neutral-600">Paquete</dt>
              <dd className="text-neutral-900">
                {CATERING_PACKAGES[
                  reservation.cateringPackage as keyof typeof CATERING_PACKAGES
                ]?.label ?? reservation.cateringPackage}
              </dd>
            </>
          )}

          {/* Cancha de Futsal tiene un selector de "Deporte a jugar" en el
              wizard público, pero ese dato nunca se guarda en Reservation
              (solo viaja al email de notificación) — no hay nada que
              mostrar acá para ese espacio, ver CLAUDE.md. */}
        </dl>
      </div>
    </div>
  );
}

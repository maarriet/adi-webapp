import { prisma } from "@/lib/prisma";
import { formatLocalDate, formatTime } from "@/lib/format";
import { formatColones, calculateDepositAmount } from "@/lib/pricing";
import { CONTRACTOR_PHONE_PATTERN } from "@/components/reservaciones/types";
import { releaseExpiredDeposits } from "@/lib/actions/reservations";
import { getReceiptSignedUrl } from "@/lib/actions/receipts";
import {
  buildDepositRequestMessage,
  buildDayReminderMessage,
  buildPaymentConfirmedMessage,
  buildWhatsappReminderHref,
} from "./whatsapp-message";
import { ReservationCard } from "./ReservationCard";
import { AddManualReservationForm } from "./AddManualReservationForm";

// Vista interna, con datos que cambian en cada reserva — no pre-renderizar.
export const dynamic = "force-dynamic";

export default async function AdminAgendaPage() {
  // Libera de paso cualquier reserva con depósito vencido antes de leer la
  // agenda — el admin ve la lista ya sin las que se cancelaron solas.
  await releaseExpiredDeposits();

  // `include` sin `select` ya devuelve todos los campos escalares de
  // Reservation (cédula, profesión, mobiliario, createdAt, status,
  // depositDeadline, receiptUrl, etc.) además de la relación incluida —
  // el modal de detalle usa esos campos sin necesidad de ampliar esta
  // query. Sin filtro de paymentStatus a propósito: el admin necesita ver
  // también las DEPOSIT_PENDING.
  const [reservations, spaces] = await Promise.all([
    prisma.reservation.findMany({
      where: { status: { not: "CANCELLED" }, startTime: { gte: new Date() } },
      orderBy: { startTime: "asc" },
      take: 20,
      include: { space: { select: { name: true, maxDurationMinutes: true } } },
    }),
    prisma.space.findMany({
      where: { bookable: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Se arma en un paso aparte (no dentro del .map() de la parte JSX) porque
  // getReceiptSignedUrl es async — un .map() de JSX no puede ser async.
  const cards = await Promise.all(
    reservations.map(async (reservation) => {
      const totalAmount = Number(reservation.totalAmount);
      const depositAmount = calculateDepositAmount(totalAmount);
      const remainingAmount = totalAmount - depositAmount;
      const date = formatLocalDate(reservation.startTime);
      const startTime = formatTime(reservation.startTime);
      const endTime = formatTime(reservation.endTime);

      const depositRequestMessage = buildDepositRequestMessage({
        // Nombre completo a propósito — a diferencia de ProximasReservas
        // (vista pública, usa formatShortName), esta es información
        // operativa interna y necesita el nombre completo.
        contractorName: reservation.contractorName,
        spaceName: reservation.space.name,
        date,
        startTime,
        endTime,
        totalAmount: formatColones(totalAmount),
        depositAmount: formatColones(depositAmount),
      });
      const dayReminderMessage = buildDayReminderMessage({
        contractorName: reservation.contractorName,
        spaceName: reservation.space.name,
        startTime,
        endTime,
        remainingAmount: formatColones(remainingAmount),
      });
      const paymentConfirmedMessage = buildPaymentConfirmedMessage({
        contractorName: reservation.contractorName,
        spaceName: reservation.space.name,
        date,
        startTime,
        endTime,
      });

      // Dos reservas reales anteriores al campo contractorPhone
      // quedaron con el placeholder "No registrado" (ver CLAUDE.md) —
      // no es un teléfono real, así que no se arma link de WhatsApp
      // para esos casos (igual se puede marcar el pago a mano).
      const hasValidPhone = CONTRACTOR_PHONE_PATTERN.test(
        reservation.contractorPhone,
      );
      const depositRequestWhatsappHref = hasValidPhone
        ? buildWhatsappReminderHref(reservation.contractorPhone, depositRequestMessage)
        : null;
      const dayReminderWhatsappHref = hasValidPhone
        ? buildWhatsappReminderHref(reservation.contractorPhone, dayReminderMessage)
        : null;
      const paymentConfirmedWhatsappHref = hasValidPhone
        ? buildWhatsappReminderHref(reservation.contractorPhone, paymentConfirmedMessage)
        : null;

      const receiptSignedUrl = reservation.receiptUrl
        ? await getReceiptSignedUrl(reservation.receiptUrl)
        : null;

      return {
        depositRequestWhatsappHref,
        dayReminderWhatsappHref,
        paymentConfirmedWhatsappHref,
        receiptSignedUrl,
        reservation: {
          id: reservation.id,
          spaceId: reservation.spaceId,
          spaceName: reservation.space.name,
          maxDurationMinutes: reservation.space.maxDurationMinutes,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          status: reservation.status,
          paymentStatus: reservation.paymentStatus,
          depositDeadline: reservation.depositDeadline,
          contractorName: reservation.contractorName,
          contractorPhone: reservation.contractorPhone,
          contractorIdNumber: reservation.contractorIdNumber,
          contractorProfession: reservation.contractorProfession,
          contractorMaritalStatus: reservation.contractorMaritalStatus,
          contractorAddress: reservation.contractorAddress,
          activityDescription: reservation.activityDescription,
          attendeesCount: reservation.attendeesCount,
          baseFurnitureSets: reservation.baseFurnitureSets,
          extraTables: reservation.extraTables,
          extraChairs: reservation.extraChairs,
          extraTablecloths: reservation.extraTablecloths,
          cateringPackage: reservation.cateringPackage,
          totalAmount,
          createdAt: reservation.createdAt,
        },
      };
    }),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-2xl text-neutral-900">
        Agenda de Reservas
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Vista interna para gestionar el estado de pago de las próximas
        reservas.
      </p>

      <AddManualReservationForm spaces={spaces} />

      {cards.length === 0 ? (
        <p className="mt-6 text-neutral-600">
          No hay reservas próximas registradas.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {cards.map((card) => (
            <ReservationCard
              key={card.reservation.id}
              depositRequestWhatsappHref={card.depositRequestWhatsappHref}
              dayReminderWhatsappHref={card.dayReminderWhatsappHref}
              paymentConfirmedWhatsappHref={card.paymentConfirmedWhatsappHref}
              receiptSignedUrl={card.receiptSignedUrl}
              reservation={card.reservation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

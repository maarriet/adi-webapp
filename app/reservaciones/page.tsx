import { prisma } from "@/lib/prisma";
import { ReservationWizard } from "@/components/reservaciones/ReservationWizard";
import { ProximasReservas } from "@/components/reservaciones/ProximasReservas";
import { releaseExpiredDeposits } from "@/lib/actions/reservations";

// La disponibilidad de espacios/horarios cambia con cada reserva — no
// pre-renderizar estáticamente en build.
export const dynamic = "force-dynamic";

export default async function ReservacionesPage() {
  // Libera de paso cualquier reserva con depósito vencido antes de leer el
  // calendario — así el horario ya aparece disponible sin esperar a un cron.
  const [, spacesFromDb] = await Promise.all([
    releaseExpiredDeposits(),
    prisma.space.findMany({
      where: { bookable: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const upcomingReservationsFromDb = await prisma.reservation.findMany({
    where: {
      status: { not: "CANCELLED" },
      // Solo reservas con depósito pagado o pago completo — las
      // DEPOSIT_PENDING todavía no están confirmadas, no se muestran
      // públicamente (sí se ven en /admin/agenda).
      paymentStatus: { not: "DEPOSIT_PENDING" },
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
    take: 20,
    include: { space: { select: { name: true } } },
  });

  // Space.baseRate/nightRate son Decimal en Prisma — no serializables tal
  // cual al pasarlos como prop a un Client Component, se convierten a
  // number | null.
  const spaces = spacesFromDb.map((space) => ({
    id: space.id,
    name: space.name,
    description: space.description,
    capacity: space.capacity,
    baseRate: space.baseRate ? Number(space.baseRate) : null,
    nightRate: space.nightRate ? Number(space.nightRate) : null,
    bookable: space.bookable,
    maxDurationMinutes: space.maxDurationMinutes,
    images: space.images,
  }));

  const upcomingReservations = upcomingReservationsFromDb.map((reservation) => ({
    id: reservation.id,
    contractorName: reservation.contractorName,
    spaceName: reservation.space.name,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
  }));

  return (
    <>
      <ReservationWizard spaces={spaces} />
      <ProximasReservas reservations={upcomingReservations} />
    </>
  );
}

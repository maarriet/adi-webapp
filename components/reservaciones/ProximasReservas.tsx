import { formatLocalDate, formatShortName, formatTime } from "@/lib/format";

export type UpcomingReservation = {
  id: string;
  contractorName: string;
  spaceName: string;
  startTime: Date;
  endTime: Date;
};

export function ProximasReservas({
  reservations,
}: {
  reservations: UpcomingReservation[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h2 className="font-heading text-2xl text-neutral-900">
        Próximas Reservas
      </h2>

      {reservations.length === 0 ? (
        <p className="mt-4 text-neutral-600">
          No hay reservas próximas registradas.
        </p>
      ) : (
        <>
          {/* Desktop/tablet: tabla */}
          <div className="mt-6 hidden overflow-hidden rounded-lg border border-neutral-100 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-accent-orange bg-primary-blue text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Facilidad</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Hora</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="even:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-900">
                      {formatShortName(reservation.contractorName)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {reservation.spaceName}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {formatLocalDate(reservation.startTime)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {formatTime(reservation.startTime)} -{" "}
                      {formatTime(reservation.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: tarjetas apiladas */}
          <div className="mt-6 flex flex-col gap-3 sm:hidden">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="rounded-lg border border-neutral-100 bg-white p-4 shadow-sm"
              >
                <p className="font-heading text-base text-neutral-900">
                  {formatShortName(reservation.contractorName)}
                </p>
                <p className="text-sm text-primary-blue">
                  {reservation.spaceName}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatLocalDate(reservation.startTime)} ·{" "}
                  {formatTime(reservation.startTime)} -{" "}
                  {formatTime(reservation.endTime)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

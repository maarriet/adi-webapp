// Formateo de fechas compartido entre Home, el listado y el detalle de
// Noticias y Eventos, y la tabla de próximas reservas — evita repetir
// Intl.DateTimeFormat en cada página.
//
// IMPORTANTE — hay dos convenciones de construcción de fechas en este
// proyecto, y cada una necesita su propio formateador:
//   1. `Event.startDate`/`endDate` (seed) se guardan como
//      `new Date("YYYY-MM-DD")`, que el motor de JS interpreta como
//      medianoche **UTC**. Usar `formatDate`/`formatDateRange` (fijan
//      `timeZone: "UTC"`) — sin esto, un offset negativo (ej. Costa Rica,
//      UTC-6) corre la fecha mostrada un día hacia atrás.
//   2. `Reservation.startTime`/`endTime` (lib/actions/reservations.ts) se
//      guardan como `new Date(`${date}T${time}:00`)`, SIN sufijo de zona,
//      que JS interpreta en la hora **local** del servidor. Usar
//      `formatLocalDate`/`formatTime` (SIN `timeZone` fijo) — si se les
//      aplica `timeZone: "UTC"` por error, una reserva que empieza a las
//      18:00 o después (que en UTC-6 cae al día siguiente en UTC) se
//      muestra con la fecha equivocada.
// Mezclar estas dos funciones entre los dos tipos de fecha reintroduce el
// bug de "un día de diferencia" en una dirección o la otra.

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

// Para eventos de varios días (ej. Fiestas de Verano): "10 de abril – 20 de
// abril de 2026". Si no hay endDate o cae el mismo día, se comporta como
// formatDate normal.
export function formatDateRange(start: Date, end: Date | null): string {
  if (!end || isSameUtcDay(start, end)) {
    return formatDate(start);
  }
  const startStr = new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(start);
  return `${startStr} – ${formatDate(end)}`;
}

// Para Reservation.startTime/endTime — ver nota de convenciones arriba.
// Sin `timeZone` fijo: usa la hora local del servidor, igual que como se
// construyeron.
export function formatLocalDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "long" }).format(date);
}

// Para Reservation.startTime/endTime — ver nota de convenciones arriba.
// Devuelve "HH:mm", ej. "15:00".
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// "Marco Arrieta Cruz" → "Marco A." — privacidad para la tabla de "Próximas
// Reservas" en /reservaciones. No usar en ningún otro lado (el email de
// notificación y la base de datos siguen con el nombre completo).
export function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}

// Para Space.maxDurationMinutes: 90 → "1h30", 60 → "1h". Se usa en el
// tooltip del wizard (StepFechaHora) y en el mensaje de WhatsApp del panel
// admin (app/admin/agenda).
export function formatDurationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h${String(remainder).padStart(2, "0")}`;
}

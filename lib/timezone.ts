// Costa Rica es UTC-6 todo el año (sin horario de verano) — un offset fijo
// alcanza, no hace falta el motor de zonas horarias IANA para la escritura.
// Ver CLAUDE.md / lib/format.ts para el bug real que motivó este archivo:
// `new Date(...)` sin sufijo de zona se interpreta en la zona horaria del
// proceso que lo ejecuta (local en dev, UTC en Vercel) — inconsistente entre
// entornos. Estos helpers anclan explícitamente a Costa Rica sin importar
// dónde corra el proceso.
const COSTA_RICA_OFFSET = "-06:00";

// Ancla un date+time (sin sufijo de zona, ej. input del wizard) a la hora
// real de Costa Rica. `time` incluye segundos (ej. "19:00:00" o
// "23:59:59.999").
export function toCostaRicaDate(date: string, time: string): Date {
  return new Date(`${date}T${time}${COSTA_RICA_OFFSET}`);
}

// "Hoy" en fecha de Costa Rica (YYYY-MM-DD), sin importar la zona del
// proceso — usa Intl en vez de los getters locales de Date.
export function costaRicaTodayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
  }).format(new Date());
}

// Día de la semana (0=domingo...6=sábado, igual que Date.getDay()) de una
// fecha "YYYY-MM-DD" — se parsea como medianoche UTC y se lee con el getter
// UTC (mismo patrón que Event.startDate/formatDate en lib/format.ts): el
// día de la semana de un string de fecha pura es una propiedad del
// calendario, no de un instante — nunca depende de dónde corra el proceso.
export function costaRicaDayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

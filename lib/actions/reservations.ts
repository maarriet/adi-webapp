"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { timeSlots } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import {
  toCostaRicaDate,
  costaRicaTodayDateString,
  costaRicaDayOfWeek,
} from "@/lib/timezone";
import {
  CATERING_PACKAGES,
  calculateCateringTotal,
  calculateDayNightRate,
  calculateSalonTotal,
  formatColones,
  type CateringPackageId,
} from "@/lib/pricing";
import { SPORT_LABELS, type MaritalStatus } from "@/components/reservaciones/types";

// Cancela de paso cualquier reserva cuyo depósito venció sin pagarse —
// "expiración perezosa": no hay cron, se llama al inicio de cada lugar que
// consulta el calendario (getBookedSlots, /admin/agenda, "Próximas
// Reservas" pública) para que el horario se libere solo en la próxima
// consulta, reusando el filtro `status: { not: "CANCELLED" }` que ya existe
// en todos esos lugares.
export async function releaseExpiredDeposits(): Promise<void> {
  await prisma.reservation.updateMany({
    where: {
      paymentStatus: "DEPOSIT_PENDING",
      depositDeadline: { lt: new Date() },
      status: { not: "CANCELLED" },
    },
    data: { status: "CANCELLED", autoExpired: true },
  });
}

export type BookedSlot = { time: string; reason: "reserved" | "contract" };

// Devuelve qué horas de `timeSlots` ya están ocupadas para ese espacio en esa
// fecha exacta — por una Reservation real que se solape (se excluyen las
// canceladas) o por un RecurringBlock activo (horarios comprometidos cada
// semana por contratos previos al sitio, ver CLAUDE.md) para ese día de la
// semana. `reason` le permite a la UI (StepFechaHora.tsx) distinguir un
// horario ya tomado por otro visitante de uno reservado por contrato.
export async function getBookedSlots(
  spaceId: string,
  date: string,
): Promise<BookedSlot[]> {
  if (!spaceId || !date) return [];

  await releaseExpiredDeposits();

  const dayStart = toCostaRicaDate(date, "00:00:00");
  const dayEnd = toCostaRicaDate(date, "23:59:59");

  const [reservations, recurringBlocks] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        spaceId,
        status: { not: "CANCELLED" },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.recurringBlock.findMany({
      where: { spaceId, dayOfWeek: costaRicaDayOfWeek(date), active: true },
      select: { startTime: true, endTime: true },
    }),
  ]);

  const result: BookedSlot[] = [];
  for (const time of timeSlots) {
    const slotStart = toCostaRicaDate(date, `${time}:00`);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
    if (
      reservations.some(
        (r) => slotStart < r.endTime && slotEnd > r.startTime,
      )
    ) {
      result.push({ time, reason: "reserved" });
      continue;
    }
    // Comparación directa de strings "HH:mm" — timeSlots y los bloqueos son
    // siempre horas exactas del mismo día, sin cruce de medianoche.
    if (recurringBlocks.some((b) => time >= b.startTime && time < b.endTime)) {
      result.push({ time, reason: "contract" });
    }
  }
  return result;
}

// Compartida entre createReservation y createManualReservation — misma
// query exacta en ambas, no solo parecida.
async function hasReservationConflict(
  spaceId: string,
  startTime: Date,
  endTime: Date,
): Promise<boolean> {
  const conflict = await prisma.reservation.findFirst({
    where: {
      spaceId,
      status: { not: "CANCELLED" },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  return conflict !== null;
}

export type CreateReservationInput = {
  spaceId: string;
  // Nombre del espacio, ya conocido por el wizard (evita una query extra
  // acá) — solo se usa para el email de notificación, Reservation no tiene
  // columna propia para esto (solo guarda spaceId).
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  contractorName: string;
  contractorIdNumber: string;
  contractorPhone: string;
  // Solo aplican para Salón Multiusos y Cocina/Comedor — null para canchas
  // (Fútbol 11, Futsal), que no los piden en el wizard.
  contractorProfession: string | null;
  contractorMaritalStatus: MaritalStatus | null;
  contractorAddress: string;
  activityDescription: string;
  attendeesCount: number;
  baseFurnitureSets: number;
  extraTables: number;
  extraChairs: number;
  extraTablecloths: number;
  cateringPackage: CateringPackageId | null;
  // Deporte elegido en Cancha de Futsal — informativo, no se persiste en
  // Reservation (decisión documentada en CLAUDE.md), solo va en el email.
  sport: string | null;
  // Solo informativo — nunca se guarda ni se usa para el cobro. El monto
  // real se recalcula siempre en el servidor (ver calculateServerTotalAmount
  // más abajo); un cliente malicioso podría mandar cualquier valor acá.
  totalAmount: number;
  termsAccepted: boolean;
};

export type CreateReservationResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function buildReservationEmailHtml(
  input: CreateReservationInput,
  reservationId: string,
  totalAmount: number,
): string {
  const rows: [string, string][] = [
    ["Espacio", input.spaceName],
    ["Fecha", formatDate(new Date(input.date))],
    ["Horario", `${input.startTime} - ${input.endTime}`],
    ["Solicitante", input.contractorName],
    ["Cédula", input.contractorIdNumber],
    ["Teléfono", input.contractorPhone],
    ["Actividad", `${input.activityDescription} (${input.attendeesCount} personas)`],
  ];

  if (input.baseFurnitureSets || input.extraTables || input.extraChairs || input.extraTablecloths) {
    rows.push([
      "Mobiliario",
      `${input.baseFurnitureSets} set(s) base, ${input.extraTables} mesa(s) extra, ${input.extraChairs} silla(s) extra, ${input.extraTablecloths} mantel(es) extra`,
    ]);
  }

  if (input.cateringPackage) {
    rows.push(["Paquete", CATERING_PACKAGES[input.cateringPackage].label]);
  }

  if (input.sport) {
    rows.push(["Deporte", SPORT_LABELS[input.sport as keyof typeof SPORT_LABELS] ?? input.sport]);
  }

  rows.push(["Monto total", formatColones(totalAmount)]);

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 12px 6px 0;color:#475569;font-size:14px;white-space:nowrap;">${label}</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${value}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#152a4e;">Nueva reserva recibida</h2>
      <p style="color:#475569;font-size:14px;">
        Se registró una nueva solicitud de reserva a través del sitio web
        (ID: ${reservationId}), pendiente de confirmación.
      </p>
      <table style="border-collapse:collapse;width:100%;">${rowsHtml}</table>
    </div>
  `;
}

// Best-effort: nunca debe tumbar la creación de la reserva. Si Resend falla
// (credencial inválida, servicio caído, NOTIFICATION_EMAIL sin definir),
// solo se registra en consola — la reserva ya quedó guardada en la base.
async function sendReservationNotificationEmail(
  input: CreateReservationInput,
  reservationId: string,
  totalAmount: number,
): Promise<void> {
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (!process.env.RESEND_API_KEY || !notificationEmail) {
    console.error(
      "sendReservationNotificationEmail: falta RESEND_API_KEY o NOTIFICATION_EMAIL, no se envía el correo.",
    );
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: notificationEmail,
      subject: `Nueva reserva: ${input.spaceName} — ${formatDate(new Date(input.date))}`,
      html: buildReservationEmailHtml(input, reservationId, totalAmount),
    });
    if (error) {
      console.error("sendReservationNotificationEmail: Resend devolvió un error:", error);
    }
  } catch (error) {
    console.error("sendReservationNotificationEmail: falló el envío:", error);
  }
}

// Solo los campos que la lógica de precios realmente necesita — tanto
// createReservation (con CreateReservationInput completo) como
// createManualReservation (que no pide mobiliario/paquete) le pasan un
// objeto que cumple esta forma más angosta.
type PricingInput = {
  spaceId: string;
  endTime: string;
  baseFurnitureSets: number;
  extraTables: number;
  extraChairs: number;
  extraTablecloths: number;
  cateringPackage: CateringPackageId | null;
};

// Recalcula el monto en el servidor — nunca se confía en `input.totalAmount`
// (un cliente malicioso podría mandar cualquier valor). Misma lógica de
// precios y misma bifurcación por espacio que ReservationWizard.tsx, pero
// `baseRate`/`nightRate` de las canchas se leen frescos de la base (esos
// campos ni siquiera viajan en CreateReservationInput) en vez de confiar en
// nada que venga del cliente.
async function calculateServerTotalAmount(
  input: PricingInput,
): Promise<number> {
  if (input.spaceId === "salon-multiusos") {
    return calculateSalonTotal({
      baseFurnitureSets: input.baseFurnitureSets,
      extraTables: input.extraTables,
      extraChairs: input.extraChairs,
      extraTablecloths: input.extraTablecloths,
    });
  }

  if (input.spaceId === "cocina-comedor") {
    return calculateCateringTotal({
      packageId: input.cateringPackage,
      extraTables: input.extraTables,
      extraChairs: input.extraChairs,
      extraTablecloths: input.extraTablecloths,
    });
  }

  // Canchas (Fútbol 11 / Futsal): el precio depende de Space.baseRate/
  // nightRate reales — se leen frescos de la base, nunca del cliente.
  const space = await prisma.space.findUnique({
    where: { id: input.spaceId },
    select: { baseRate: true, nightRate: true },
  });

  return calculateDayNightRate({
    baseRate: space?.baseRate ? Number(space.baseRate) : 0,
    nightRate: space?.nightRate ? Number(space.nightRate) : null,
    endTime: input.endTime,
  });
}

// Reconstruye el rango horario, revisa conflictos una vez más (defensivo —
// pudo cambiar la disponibilidad entre el paso 2 y la confirmación) y crea la
// reserva con status PENDING (pendiente de revisión/confirmación por LA ADI).
export async function createReservation(
  input: CreateReservationInput,
): Promise<CreateReservationResult> {
  const startTime = toCostaRicaDate(input.date, `${input.startTime}:00`);
  const endTime = toCostaRicaDate(input.date, `${input.endTime}:00`);

  if (await hasReservationConflict(input.spaceId, startTime, endTime)) {
    return {
      ok: false,
      error: "Ese horario ya no está disponible. Por favor elige otro.",
    };
  }

  const totalAmount = await calculateServerTotalAmount(input);
  if (Math.abs(totalAmount - input.totalAmount) > 0.01) {
    // No debería pasar si la lógica de precios del wizard y la del
    // servidor están sincronizadas — si aparece en los logs, es una señal
    // de que se desincronizaron (o de un intento de manipular el monto
    // desde el cliente). De cualquier forma, el monto del servidor es la
    // fuente de verdad y es el que se guarda.
    console.warn(
      `createReservation: totalAmount del cliente (${input.totalAmount}) no coincide con el recalculado en el servidor (${totalAmount}) para spaceId=${input.spaceId}. Se usa el del servidor.`,
    );
  }

  // Plazo del depósito: fin del día en que se crea la reserva (hoy, hora
  // de Costa Rica) — no el día del evento. Anclado explícitamente a
  // America/Costa_Rica (ver lib/timezone.ts) — no depender de la zona del
  // proceso, que en Vercel es UTC.
  const depositDeadline = toCostaRicaDate(
    costaRicaTodayDateString(),
    "23:59:59.999",
  );

  const created = await prisma.reservation.create({
    data: {
      spaceId: input.spaceId,
      startTime,
      endTime,
      status: "PENDING",
      paymentStatus: "DEPOSIT_PENDING",
      depositDeadline,
      contractorName: input.contractorName,
      contractorIdNumber: input.contractorIdNumber,
      contractorPhone: input.contractorPhone,
      contractorProfession: input.contractorProfession,
      contractorMaritalStatus: input.contractorMaritalStatus,
      contractorAddress: input.contractorAddress,
      activityDescription: input.activityDescription,
      attendeesCount: input.attendeesCount,
      baseFurnitureSets: input.baseFurnitureSets,
      extraTables: input.extraTables,
      extraChairs: input.extraChairs,
      extraTablecloths: input.extraTablecloths,
      cateringPackage: input.cateringPackage,
      totalAmount,
      termsAccepted: input.termsAccepted,
    },
  });

  await sendReservationNotificationEmail(input, created.id, totalAmount);

  return { ok: true, id: created.id };
}

export type CreateManualReservationInput = {
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
  contractorName: string;
  contractorIdNumber?: string;
  contractorPhone?: string;
  contractorAddress?: string;
  activityDescription?: string;
  attendeesCount?: number;
  paymentStatus: "DEPOSIT_PENDING" | "DEPOSIT_PAID" | "FULLY_PAID";
};

// Para reservas coordinadas por fuera del sitio (WhatsApp, teléfono) que
// un admin registra directo desde /admin/agenda — a diferencia de
// createReservation (wizard público), no exige depósito ni le pone
// vencimiento, y el estado de pago lo elige el admin en vez de arrancar
// siempre en DEPOSIT_PENDING.
export async function createManualReservation(
  input: CreateManualReservationInput,
): Promise<CreateReservationResult> {
  const startTime = toCostaRicaDate(input.date, `${input.startTime}:00`);
  const endTime = toCostaRicaDate(input.date, `${input.endTime}:00`);

  if (startTime >= endTime) {
    return {
      ok: false,
      error: "La hora de fin debe ser posterior a la de inicio.",
    };
  }

  if (await hasReservationConflict(input.spaceId, startTime, endTime)) {
    return { ok: false, error: "Ese horario ya tiene una reserva." };
  }

  // Misma lógica de precios que el wizard público, vía la función interna
  // ya usada por createReservation — este formulario no pide mobiliario/
  // paquete/deporte, así que para Salón sale el monto base sin extras y
  // para Cocina/Comedor sale ¢0 si no se especifica paquete (limitación
  // conocida: este formulario no tiene selector de paquete).
  const totalAmount = await calculateServerTotalAmount({
    spaceId: input.spaceId,
    endTime: input.endTime,
    baseFurnitureSets: 0,
    extraTables: 0,
    extraChairs: 0,
    extraTablecloths: 0,
    cateringPackage: null,
  });

  const created = await prisma.reservation.create({
    data: {
      spaceId: input.spaceId,
      startTime,
      endTime,
      // CONFIRMED, no PENDING: a diferencia del wizard público (que
      // arranca en PENDING, pendiente de revisión de LA ADI), estas ya
      // fueron coordinadas y acordadas de antemano — no hay nada que
      // revisar.
      status: "CONFIRMED",
      paymentStatus: input.paymentStatus,
      // Null a propósito, NUNCA se calcula "fin del día de hoy" — es lo
      // que exime a estas reservas de releaseExpiredDeposits() (que solo
      // actúa sobre paymentStatus: DEPOSIT_PENDING con depositDeadline
      // vencido; un depositDeadline null nunca matchea ese filtro).
      depositDeadline: null,
      contractorName: input.contractorName,
      contractorIdNumber: input.contractorIdNumber?.trim() || "No registrado",
      contractorPhone: input.contractorPhone?.trim() || "No registrado",
      contractorAddress: input.contractorAddress?.trim() || "No registrado",
      activityDescription: input.activityDescription?.trim() || "No registrado",
      attendeesCount: input.attendeesCount || 0,
      totalAmount,
    },
  });

  // Sin email de notificación (a diferencia de createReservation): esto no
  // es una solicitud nueva que alguien deba revisar, ya se sabe de ella.

  revalidatePath("/admin/agenda");
  return { ok: true, id: created.id };
}

// Usadas desde app/admin/agenda (Server Actions pasadas directo a un <form
// action={...}>) — el depósito y el pago completo son dos eventos de pago
// independientes en el contrato real (50% el día de la reserva, 50% el día
// del evento), por eso son dos acciones separadas en vez de un único
// "marcar como pagado": alguien puede confirmar solo el depósito, o pagar
// todo de una vez sin pasar por el estado intermedio.
export async function markDepositPaid(reservationId: string): Promise<void> {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { paymentStatus: "DEPOSIT_PAID" },
  });
  revalidatePath("/admin/agenda");
}

export async function markFullyPaid(reservationId: string): Promise<void> {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { paymentStatus: "FULLY_PAID" },
  });
  revalidatePath("/admin/agenda");
}

// Cancelar libera el horario automáticamente: getBookedSlots y el chequeo
// de conflicto de createReservation ya filtran `status: { not: "CANCELLED" }`.
export async function cancelReservation(reservationId: string): Promise<void> {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin/agenda");
}

export type ReactivateReservationResult =
  | { ok: true }
  | { ok: false; error: string };

// Para reservas que releaseExpiredDeposits canceló solas (autoExpired:
// true) cuando el cliente manda el comprobante tarde — sección "Reservas
// autocanceladas" en /admin/agenda. Reusa hasReservationConflict (misma
// query que createReservation/createManualReservation): la reserva sigue
// CANCELLED en este punto, así que ese filtro ya la auto-excluye, no hace
// falta pasarle un id a ignorar.
export async function reactivateReservation(
  reservationId: string,
  paymentStatus: "DEPOSIT_PAID" | "FULLY_PAID",
): Promise<ReactivateReservationResult> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation) {
    return { ok: false, error: "No se encontró la reserva." };
  }

  if (
    await hasReservationConflict(
      reservation.spaceId,
      reservation.startTime,
      reservation.endTime,
    )
  ) {
    return {
      ok: false,
      error:
        "Ese horario ya fue reservado por otra persona, no se puede reactivar. Contacta al cliente para ofrecerle otro horario.",
    };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "PENDING",
      paymentStatus,
      autoExpired: false,
      // null a propósito, mismo criterio que createManualReservation: ya
      // no debe expirar, el pago ya se confirmó.
      depositDeadline: null,
    },
  });

  revalidatePath("/admin/agenda");
  return { ok: true };
}

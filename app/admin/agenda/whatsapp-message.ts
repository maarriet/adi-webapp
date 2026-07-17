import { siteConfig } from "@/lib/site-config";

// Copy específico de /admin/agenda — no vive en lib/ porque no lo usa
// ninguna otra pantalla. El envío sigue siendo semi-manual: estos helpers
// solo arman el texto, el link wa.me abre WhatsApp con el mensaje listo,
// pero alguien tiene que presionar "Enviar" ahí (ver CLAUDE.md).
//
// Dos mensajes distintos según en qué punto del esquema de depósito (50%
// el día de la reserva, 50% restante el día del evento) esté la reserva —
// no una variante por tipo de espacio como antes.

// DEPOSIT_PENDING: se acaba de crear la reserva, falta el depósito.
export function buildDepositRequestMessage({
  contractorName,
  spaceName,
  date,
  startTime,
  endTime,
  totalAmount,
  depositAmount,
}: {
  contractorName: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: string; // ya formateado con formatColones (incluye el símbolo ₡)
  depositAmount: string; // ídem
}): string {
  return `Hola ${contractorName}, se recibió tu solicitud de reserva para ${spaceName} el ${date} de ${startTime} a ${endTime}. Monto total: ${totalAmount}. Para asegurar tu reserva, realiza un depósito del 50% (${depositAmount}) por SINPE al ${siteConfig.sinpeNumber} y envía el comprobante a este WhatsApp. Si el depósito no se reporta antes de la medianoche de hoy, la reserva se libera automáticamente y el espacio queda disponible para otra persona — puedes intentar de nuevo mañana. ¡Gracias! - ADI Quebradas y Calle Vargas`;
}

// DEPOSIT_PAID: ya pagó el depósito, falta el 50% restante el día del evento.
export function buildDayReminderMessage({
  contractorName,
  spaceName,
  startTime,
  endTime,
  remainingAmount,
}: {
  contractorName: string;
  spaceName: string;
  startTime: string;
  endTime: string;
  remainingAmount: string; // ya formateado con formatColones
}): string {
  return `Hola ${contractorName}, te recordamos tu reserva de hoy en ${spaceName} de ${startTime} a ${endTime}. Recuerda realizar el pago del 50% restante (${remainingAmount}) durante el día por SINPE al ${siteConfig.sinpeNumber} y enviar el comprobante a este WhatsApp. ¡Te esperamos! - ADI Quebradas y Calle Vargas`;
}

// Mismo formato sin "+" que getWhatsappHref (lib/site-config.ts).
export function buildWhatsappReminderHref(phone: string, message: string): string {
  const digits = phone.replace(/-/g, "");
  return `https://wa.me/506${digits}?text=${encodeURIComponent(message)}`;
}

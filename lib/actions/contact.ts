"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export type SubmitContactMessageInput = {
  name: string;
  email: string;
  message: string;
};

export type SubmitContactMessageResult =
  | { ok: true }
  | { ok: false; error: string };

function buildContactEmailHtml(input: SubmitContactMessageInput): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#152a4e;">Nuevo mensaje de contacto</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr>
          <td style="padding:6px 12px 6px 0;color:#475569;font-size:14px;white-space:nowrap;">Nombre</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${input.name}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#475569;font-size:14px;white-space:nowrap;">Correo</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${input.email}</td>
        </tr>
      </table>
      <p style="margin-top:16px;color:#475569;font-size:14px;">Mensaje:</p>
      <p style="color:#0f172a;font-size:14px;white-space:pre-wrap;">${input.message}</p>
    </div>
  `;
}

// Best-effort: nunca debe tumbar el guardado del mensaje. Mismo patrón que
// sendReservationNotificationEmail (lib/actions/reservations.ts).
async function sendContactNotificationEmail(
  input: SubmitContactMessageInput,
): Promise<void> {
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (!process.env.RESEND_API_KEY || !notificationEmail) {
    console.error(
      "sendContactNotificationEmail: falta RESEND_API_KEY o NOTIFICATION_EMAIL, no se envía el correo.",
    );
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: notificationEmail,
      subject: `Nuevo mensaje de contacto — ${input.name}`,
      html: buildContactEmailHtml(input),
    });
    if (error) {
      console.error("sendContactNotificationEmail: Resend devolvió un error:", error);
    }
  } catch (error) {
    console.error("sendContactNotificationEmail: falló el envío:", error);
  }
}

export async function submitContactMessage(
  input: SubmitContactMessageInput,
): Promise<SubmitContactMessageResult> {
  try {
    await prisma.contactMessage.create({ data: input });
  } catch (error) {
    console.error("submitContactMessage failed:", error);
    return {
      ok: false,
      error: "No pudimos enviar tu mensaje. Por favor intenta de nuevo.",
    };
  }

  await sendContactNotificationEmail(input);

  return { ok: true };
}

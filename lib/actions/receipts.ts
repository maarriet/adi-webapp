"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, RECEIPTS_BUCKET } from "@/lib/supabase-admin";

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024; // 10MB

export type UploadReceiptResult = { ok: true } | { ok: false; error: string };

// Sube la imagen del comprobante SINPE al bucket privado "recibos-pago" y
// guarda la ruta del objeto en Reservation.receiptUrl (no una URL — ver
// nota en prisma/schema.prisma). No borra un comprobante anterior si se
// reemplaza (cada subida usa una ruta con timestamp único, así que el
// archivo viejo queda huérfano en el bucket) — simplificación consciente,
// el volumen de comprobantes de esta herramienta no justifica la
// complejidad de limpiarlo.
export async function uploadReceipt(
  reservationId: string,
  formData: FormData,
): Promise<UploadReceiptResult> {
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No se seleccionó ningún archivo." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "El comprobante debe ser una imagen." };
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return { ok: false, error: "La imagen es muy pesada (máximo 10MB)." };
  }

  const path = `${reservationId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("uploadReceipt: falló la subida a Supabase Storage:", uploadError);
    return { ok: false, error: "No pudimos subir el comprobante. Intenta de nuevo." };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { receiptUrl: path },
  });

  revalidatePath("/admin/agenda");
  return { ok: true };
}

// Genera una URL firmada (vigente por 1 hora) para mostrar/abrir un
// comprobante ya subido — un bucket privado no tiene URLs públicas
// permanentes. Se llama server-side (app/admin/agenda/page.tsx) para
// cada reserva que ya tenga receiptUrl.
export async function getReceiptSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error || !data) {
    console.error("getReceiptSignedUrl: falló la generación de la URL firmada:", error);
    return null;
  }
  return data.signedUrl;
}

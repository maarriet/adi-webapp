import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase con la service role key — bypassa RLS por completo,
// úsese SOLO dentro de Server Actions / código server-only (nunca en un
// Client Component). Hoy se usa exclusivamente para Storage
// (bucket "recibos-pago", privado): subir comprobantes y generar URLs
// firmadas para verlos, ambas operaciones que la anon key no puede hacer
// sobre un bucket privado.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export const RECEIPTS_BUCKET = "recibos-pago";

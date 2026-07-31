import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase con la service role key — bypassa RLS por completo,
// úsese SOLO dentro de Server Actions / código server-only (nunca en un
// Client Component). Hoy se usa exclusivamente para Storage
// (bucket "recibos-pago", privado): subir comprobantes y generar URLs
// firmadas para verlos, ambas operaciones que la anon key no puede hacer
// sobre un bucket privado.
// `global.fetch` fuerza `cache: "no-store"` en cada request que hace este
// cliente — bug real encontrado en producción: aunque
// app/admin/agenda/page.tsx ya es `force-dynamic`, el fetch interno de
// supabase-js (usa el fetch global de Node, que Next.js parchea) igual
// quedaba cacheado por el Data Cache de Next.js, sirviendo la misma URL
// firmada ya vencida en cada carga ("exp" claim timestamp check failed").
// Confirmado en vivo: dos requests a /admin/agenda con 3s de diferencia
// devolvían el mismo token JWT exacto en la URL firmada. `force-dynamic`
// por sí solo no alcanzó para esta llamada — hay que forzar el `cache`
// explícitamente en el propio fetch.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  },
);

export const RECEIPTS_BUCKET = "recibos-pago";

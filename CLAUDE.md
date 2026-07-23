# CLAUDE.md

## Fuente de verdad del diseño

`docs/blueprint.md` es la fuente de verdad de diseño y producto: sitemap, paleta de
colores, escala tipográfica, especificación de componentes (`Button`, `Card`,
`CalendarSlot`, `FormField`), wireframes textuales y copy en español. Cualquier
feature, página o componente nuevo debe ser consistente con ese documento, salvo
que se documente explícitamente un cambio.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma (`prisma@6.19.3`, `@prisma/client@6.19.3` — versión fijada intencionalmente,
  ver nota abajo) como ORM
- Supabase (PostgreSQL) como base de datos, y Supabase Storage (vía
  `@supabase/supabase-js`) para el bucket privado de comprobantes de pago
  — ver "Estructura de carpetas" (`lib/supabase-admin.ts`) abajo
- `@heroicons/react` (variante outline) para iconografía, según la
  recomendación de la sección 2 del blueprint

El blueprint (sección 6) también contempla Framer Motion, Sanity CMS, Resend y
Cloudinary para fases posteriores del proyecto. No están configurados todavía —
se agregarán cuando se implementen las features que los requieren.

### Nota sobre la versión de Prisma

Al iniciar el proyecto, `npm install prisma` instaló por defecto Prisma 7, que
introduce cambios incompatibles con el patrón clásico: ya no permite `url` en el
`datasource` del schema y requiere un "driver adapter" (`@prisma/adapter-pg` + `pg`)
para conectar directamente a Postgres, además de un archivo `prisma.config.ts`
separado. Se fijó la versión en `6.19.3` para mantener el flujo estándar
(`PrismaClient()` + `DATABASE_URL` vía `.env`) documentado en el blueprint. Si en el
futuro se decide migrar a Prisma 7+, hay que actualizar `lib/prisma.ts` para usar un
driver adapter y mover la configuración de conexión a `prisma.config.ts`.

## Estado actual

Todas las páginas del sitemap están construidas: Home, Reservaciones,
Proyectos e Impacto, Gobernanza, Involúcrate, Noticias y Eventos (listado +
detalle) y Contacto. **Supabase está conectado** — el schema, la migración y
el seed corren contra el proyecto real (ver "Conexión a Supabase" abajo).
Home, Proyectos, Noticias/Eventos y Reservaciones leen datos reales vía
Prisma (`prisma.space/project/event.findMany()`, etc.); "Confirmar reserva" y
el formulario de Contacto escriben filas reales en `Reservation` y
`ContactMessage` vía Server Actions (`lib/actions/`), ambas también con
notificación por email vía Resend. Solo quedan en contenido estático (sin
tabla en el schema, no es "mock temporal"): `financialImpactSummary` y
`timeSlots` en `lib/mock-data.ts`, y `valores` en `lib/valores.tsx` — ver
esa sección abajo para el porqué.

## Conexión a Supabase

`prisma/schema.prisma` usa **dos variables de conexión** (patrón recomendado
por Supabase para Prisma), no una sola:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL") // pooler (pgbouncer, puerto 6543) — runtime
  directUrl = env("DIRECT_URL")   // conexión directa (puerto 5432) — migraciones
}
```

`DATABASE_URL` (pooler transaccional) es la que usa la app en cada request;
`DIRECT_URL` la usa únicamente la CLI de Prisma (`migrate`, `db push`, `db
seed`) porque pgbouncer en modo transacción no soporta bien las prepared
statements que las migraciones necesitan. Sin esta separación, `prisma
migrate dev` falla o se cuelga contra Supabase. Ambas variables (más
`NEXT_PUBLIC_SUPABASE_URL` — ya se usa también para Storage, ver abajo —
y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, esta última todavía sin usar en código,
lista para Auth a futuro; `RESEND_API_KEY`/`NOTIFICATION_EMAIL`,
notificación por email de reservas nuevas; `ADMIN_PASSWORD`, contraseña de
`/admin/agenda`; y `SUPABASE_SERVICE_ROLE_KEY`, solo-servidor, para el
bucket de comprobantes de pago, ver "Estructura de carpetas" abajo) están
documentadas con placeholders en `.env.example`.

**Páginas con datos en vivo son `export const dynamic = "force-dynamic"`**
(`app/page.tsx`, `app/proyectos/page.tsx`, `app/noticias-eventos/page.tsx` +
`[slug]/page.tsx`, `app/reservaciones/page.tsx`). Sin esto, Next.js intenta
pre-renderizarlas estáticamente en build time (fallando si no hay DB
accesible en ese momento, y peor, horneando una foto vieja de los datos si
sí la hay). Cualquier página nueva que lea de Prisma necesita el mismo
export.

`prisma/seed.ts` siembra las 5 instalaciones, 3 proyectos y 3 noticias/
eventos reales (mismos datos que tenía `lib/mock-data.ts` antes de
conectarse a Supabase). Usa `upsert` (por `id` en Space/Project, por `slug`
en Event) — re-ejecutable sin duplicar filas. Correr con `npx prisma db
seed` (requiere el paquete `tsx` y el bloque `"prisma": {"seed": "tsx
prisma/seed.ts"}` en `package.json`, ya configurados).

## Marca visual

La paleta de colores real de LA ADI **reemplaza** la paleta placeholder de la
sección 2 del blueprint — excepción documentada, autorizada explícitamente
por el usuario. Los valores actuales (`#152A4E`/`#E8792B`/`#8C929B`) son los
oficiales de la guía de marca, dados directamente por el usuario; **superan**
una aproximación anterior por muestreo de píxeles del logo (`#081830`/
`#F97F2E`/`#9FA4AB`) usada antes de tener los valores oficiales — si en algún
momento los colores se ven "apagados" respecto al logo, son estos valores
oficiales los correctos, no los del logo renderizado.

- `--primary-blue` → `#152a4e` (azul marino oscuro de marca; blueprint
  original: `#2563EB`).
- `--accent-orange` → `#e8792b` (blueprint original: `#EA580C`).
- `--swoosh-gray` (nuevo, no está en el blueprint) → `#8c929b`, para el
  detalle decorativo curvo del logo. Token de Tailwind: `colors.swoosh`.
- `--primary-green` y los neutrales/semánticos no cambiaron.

Como todo el sitio consume estos colores vía los tokens de Tailwind y no hex
sueltos, cambiar los valores en `app/globals.css` re-temátiza Header, Footer,
Button, Card y todas las páginas automáticamente.

- `public/images/logo.png` — logo real (convertido de un JPG fuente a PNG).
  Se usa en `Header`/`Footer` vía `next/image`. Tiene fondo blanco (no
  transparente) — en el Footer (fondo oscuro) se ve dentro de una caja
  blanca; aceptado como solución temporal hasta tener una versión con
  transparencia.
- `app/icon.png` — favicon recortado del isotipo (solo la figura naranja,
  sin el texto del logo completo, que sería ilegible en 16×16). Convención
  especial de Next.js App Router — se sirve automáticamente, no se toca
  `metadata`. Reemplaza el `favicon.ico` placeholder de create-next-app
  (eliminado).

## Estructura de carpetas

- `app/` — rutas del App Router, una por sección del sitemap del blueprint:
  `/` (Home), `/reservaciones`, `/proyectos` (+ `/proyectos/[id]` para el
  detalle — usa el `id` legible de `Project`, ej. `comite-lote-adi`, no un
  `slug` aparte), `/gobernanza`, `/involucrate`, `/noticias-eventos` (+
  `/noticias-eventos/[slug]` para el detalle), `/contacto`. Slugs en español
  sin tildes ni `ñ`. Todas construidas con contenido real (no placeholders).
  `/proyectos/[id]` muestra **todas** las `images` del proyecto (a
  diferencia de la tarjeta de listado, que solo usa `images[0]`) y, si
  `contactPhone` existe, un bloque "¿Interesado?" con link `tel:+506...`.
- `lib/prisma.ts` — único punto de acceso al cliente de Prisma (patrón singleton
  para evitar agotar conexiones en dev por hot-reload). Importar `prisma` desde
  aquí, no instanciar `PrismaClient` en otros archivos.
- `lib/supabase-admin.ts` — cliente de Supabase con la **service role key**
  (`SUPABASE_SERVICE_ROLE_KEY`, solo-servidor) — bypassa RLS por completo,
  así que **solo se importa desde Server Actions** (`lib/actions/receipts.ts`),
  nunca desde un Client Component. Hoy se usa exclusivamente para Storage:
  el bucket privado `recibos-pago` (comprobantes de pago SINPE) se creó
  una única vez con un script suelto (`storage.createBucket("recibos-pago",
  { public: false })`, no quedó como parte del código de la app — mismo
  espíritu que `prisma/seed.ts`, pero infraestructura de un solo uso, no
  se vuelve a correr). Con la anon key no alcanza: un bucket privado no
  tiene URLs públicas ni permite subir archivos sin RLS configurado
  explícitamente, así que tanto la subida como la lectura pasan por el
  servidor con la service role key.
- `prisma/schema.prisma` — modelos `Space`, `Reservation`, `Project`,
  `ProjectUpdate`, `Event` tal como se definen en `docs/blueprint.md` sección 6,
  con extensiones documentadas:
  - `ProjectUpdate` y los enums `ReservationStatus`/`ProjectStatus` añadidos,
    ya que el blueprint los referencia pero no los define explícitamente.
  - **`Space.baseRate`** (antes `hourlyRate`, renombrado): monto fijo por
    reserva cuando aplica, no tarifa por hora — así es como funciona el
    contrato real de alquiler.
  - **`Space.nightRate`** (`Decimal?`, nuevo): tarifa nocturna, solo la usan
    Cancha de Fútbol 11 y Cancha de Futsal (ambas con esquema diurno/
    nocturno idéntico); `null` para Salón Multiusos y Cocina/Comedor.
    Elegido en vez de un campo `Json pricing` porque no rompe nada del
    código existente que ya lee `space.baseRate` como número simple (Salón,
    y ahora también la tarifa diurna de las canchas) — solo se agrega el
    campo opcional en paralelo. Ver `lib/pricing.ts` para el cálculo.
  - **`Reservation`** ampliado con los datos reales del contrato de alquiler
    de instalaciones de LA ADI (reemplaza el `requester Json` genérico del
    blueprint por campos tipados): datos del contratista (`contractorName`,
    `contractorIdNumber`, `contractorPhone`, `contractorProfession`,
    `contractorMaritalStatus`, `contractorAddress` — el campo de teléfono se
    llama `contractorPhone`, no `requesterPhone`, para seguir la misma
    convención de nombres que ya tenían el resto de campos del contratista).
    **`contractorProfession`/`contractorMaritalStatus` son nullable**
    (`String?`/`MaritalStatus?`): el contrato real solo los pide para Salón
    Multiusos y Cocina/Comedor, no para las canchas — `StepContratista.tsx`
    deja de renderizar esos dos `FormField` cuando `isCourt` (mismo
    criterio `space.maxDurationMinutes != null` ya usado en otros lugares),
    y `ReservationWizard.tsx` no los exige en la validación de "Continuar"
    del paso 3 en ese caso. Pasar de requerido a opcional no arriesga datos
    existentes (ninguna fila se vuelve `null` sola), así que a diferencia
    de los cambios de enum, `prisma migrate dev` generó y aplicó la
    migración directo, sin necesitar el flujo manual de
    `--create-only`/SQL a mano/`migrate deploy`. `StepResumen.tsx` y
    `ReservationDetailModal.tsx` (`/admin/agenda`) omiten la fila "Estado
    civil"/"Profesión" por completo cuando el valor es `null`, en vez de
    mostrarla vacía — mismo patrón ya usado ahí para "Paquete" (Cocina/
    Comedor) y "Deporte" (Futsal, que ni siquiera se persiste).
    Detalle de actividad (`activityDescription`,
    `attendeesCount`), opciones de precio específicas por espacio
    (`baseFurnitureSets`/`extraTables`/`extraChairs`/`extraTablecloths` para
    Salón Multiusos; `cateringPackage` para Cocina/Comedor — mutuamente
    excluyentes, validado en el formulario, no en la base de datos),
    `totalAmount` y `termsAccepted`. Al agregar `contractorPhone` como
    columna requerida ya había 2 reservas reales en la base (no de
    prueba) — la migración las rellenó con el placeholder literal
    `"No registrado"` en vez de perderlas o inventarles un teléfono; si
    alguna vez se ve ese valor en un dato real, es de esas 2 filas
    anteriores al campo. Enums nuevos: `MaritalStatus`,
    `CateringPackage`.
  - **`Reservation.paymentStatus`** (`PaymentStatus`, default
    `DEPOSIT_PENDING`): independiente de `status` (`ReservationStatus` — si
    la ADI confirmó/agendó la reserva) — este otro campo rastrea el
    **esquema de pago en 2 partes** del contrato real: 50% de depósito el
    mismo día de la reserva, 50% restante el día del evento. Enum de 3
    valores: `DEPOSIT_PENDING` (recién creada, depósito sin confirmar) →
    `DEPOSIT_PAID` (depósito confirmado) → `FULLY_PAID` (pago completo).
    **No es una secuencia estrictamente lineal**: desde `/admin/agenda` hay
    dos Server Actions independientes en `lib/actions/reservations.ts` —
    `markDepositPaid` (→ `DEPOSIT_PAID`) y `markFullyPaid` (→
    `FULLY_PAID`, disponible tanto desde `DEPOSIT_PENDING` como desde
    `DEPOSIT_PAID`, para cuando alguien paga todo de una vez sin pasar por
    el estado intermedio). Reemplazó al `markReservationPaid` original
    (2 estados, `PENDING`/`PAID`) — ver migración de datos abajo.
  - **`Reservation.depositDeadline`** (`DateTime?`, nuevo): fin del día en
    que se **creó** la reserva (no el día del evento) — plazo para pagar el
    depósito. Se fija en `createReservation` con
    `new Date(); .setHours(23, 59, 59, 999)` (hora local del servidor,
    mismo patrón "local sin conversión UTC" que ya usan
    `startTime`/`endTime`, ver `lib/format.ts`). `null` = sin fecha límite,
    usado para las reservas anteriores a este esquema (ver migración
    abajo) — quedan exentas de la expiración automática.
  - **`Reservation.receiptUrl`** (`String?`, nuevo): a pesar del nombre,
    guarda la **ruta** del objeto en el bucket privado de Supabase Storage
    `recibos-pago` (ej. `<reservationId>/<timestamp>-archivo.jpg`), no una
    URL — un bucket privado no tiene URLs públicas permanentes, así que
    guardar una URL firmada directamente se rompería sola al expirar. La
    URL firmada real (1 hora de vigencia) se genera al vuelo desde esta
    ruta cada vez que `/admin/agenda` se renderiza
    (`getReceiptSignedUrl`, `lib/actions/receipts.ts`). Se sube vía
    `uploadReceipt(reservationId, formData)` (valida que sea imagen y
    pese menos de 10MB) — botón "Subir comprobante" en
    `ReservationCard.tsx`, **siempre visible sin importar `paymentStatus`**
    (el comprobante puede llegar antes de que el admin marque el pago).
    No borra el archivo anterior si se reemplaza un comprobante (cada
    subida usa una ruta con timestamp único) — simplificación consciente,
    el volumen de esta herramienta no justifica limpiar archivos huérfanos.
  - **Expiración automática del depósito, sin cron** —
    `releaseExpiredDeposits()` (`lib/actions/reservations.ts`, exportada):
    cancela (`status: "CANCELLED"`) cualquier reserva con
    `paymentStatus: DEPOSIT_PENDING` cuyo `depositDeadline` ya pasó. No hay
    proceso programado — es "expiración perezosa": se llama al inicio de
    los 3 lugares que consultan el calendario (`getBookedSlots`,
    `app/admin/agenda/page.tsx`, la query de "Próximas Reservas" en
    `app/reservaciones/page.tsx`), así que el horario se libera solo la
    próxima vez que alguien mira el calendario, reusando el filtro
    `status: { not: "CANCELLED" }` que ya existía en los 3 lugares.
    **`createReservation` no la llama directamente** (no forma parte de
    esos 3 lugares) — en la práctica no hace falta, porque el wizard
    siempre pasa por `getBookedSlots` (paso 2) antes de llegar a
    `createReservation` (paso 4), así que un vencimiento en ese
    espacio/fecha ya se habría limpiado segundos antes en la misma sesión;
    si se invoca `createReservation` de forma directa (sin pasar por el
    wizard), ese caso límite queda sin cubrir.
  - **Vista pública vs. admin**: la query de "Próximas Reservas"
    (`app/reservaciones/page.tsx`) filtra
    `paymentStatus: { not: "DEPOSIT_PENDING" }` — una reserva sin depósito
    confirmado no se muestra públicamente. `/admin/agenda` **no** filtra
    por `paymentStatus` — el admin necesita ver también las
    `DEPOSIT_PENDING` para poder gestionarlas.
  - **Migración de datos existentes** (`prisma/migrations/
    20260717202141_add_deposit_workflow`): el enum viejo (`PENDING`/`PAID`)
    no comparte ningún valor por nombre con el nuevo, así que Prisma no
    puede generar la migración solo — se escribió el SQL a mano (mismo
    patrón que la migración de `contractorPhone`), con
    `ALTER COLUMN ... USING CASE ... END` para mapear explícitamente
    `PAID` → `FULLY_PAID` y `PENDING` → `DEPOSIT_PAID` (**nunca**
    `DEPOSIT_PENDING` — así ninguna reserva ya aprobada corre riesgo de
    auto-cancelarse por la nueva regla de expiración) y
    `depositDeadline: null` para las 12 filas existentes en ese momento
    (sin fecha límite = exentas de expiración). En este entorno,
    `prisma migrate dev` (incluso con `--create-only`) falla con "the
    environment is non-interactive" porque Prisma detecta la pérdida
    potencial de datos del cambio de enum y exige confirmación
    interactiva; el flujo que sí funciona es crear la carpeta de migración
    a mano (`prisma/migrations/<timestamp>_<nombre>/migration.sql`) y
    aplicarla con `prisma migrate deploy` (explícitamente no interactivo,
    pensado para CI/despliegues).
  - **`calculateDepositAmount(totalAmount)`** (`lib/pricing.ts`): mitad del
    total, redondeada (`Math.round`). El monto restante se calcula como
    `totalAmount - calculateDepositAmount(totalAmount)` en cada call site
    (no una función aparte) para que ambas mitades sumen siempre exacto al
    total, sin arrastre de redondeo. Función pura, se usa tanto desde
    `ReservationWizard.tsx` (pantalla de confirmación, ver abajo) como
    desde `app/admin/agenda/page.tsx` (los 2 mensajes de WhatsApp, ver
    abajo).
  - **Desviación del blueprint sección 1**: las instalaciones reales que
    administra LA ADI son Salón Multiusos, Área de Cocina y Comedor, Cancha
    de Fútbol 11 y Cancha de Futsal (4 espacios) — no los 3 espacios
    genéricos del blueprint (Cancha de fútbol, Salón multiuso, Área
    recreativa). "Plaza de Deportes" existió brevemente como espacio
    separado (`bookable: false`, "próximamente") pero se eliminó del seed y
    de la base real: es el mismo lugar físico que Cancha de Fútbol 11, que
    ya tiene su propia tarjeta con precio real — mantenerlo aparte era un
    duplicado. Se confirmó (`prisma.reservation.count`) que no tenía
    reservas asociadas antes de borrar la fila. El evento "Fiestas de Verano
    2026" sigue usando `location: "Plaza de Deportes"` como texto libre —
    ese campo no es una referencia a `Space`, así que no lo afectó.
  - **`Space.bookable`** (`Boolean`, default `true`): distingue instalaciones
    con tarifa definida de las que todavía no la tienen — hoy las 4
    instalaciones existentes son reservables (`bookable: true`); el campo
    queda para cuando se agregue una instalación nueva sin tarifa fijada.
  - **`Space.maxDurationMinutes`** (`Int?`, nuevo): límite de duración de una
    reserva; solo lo usan las canchas — Cancha de Fútbol 11 = `120` (2
    horas), Cancha de Futsal = `60` (definidos en `prisma/seed.ts`), `null`
    para Salón Multiusos y Cocina/Comedor (sin límite). Se valida en el
    paso 2 del wizard (`StepFechaHora.tsx`): al elegir hora de inicio, las
    opciones de hora de fin que excedan el límite quedan deshabilitadas con
    tooltip ("Excede el máximo de Xh para este espacio", vía
    `formatDurationLabel` en `lib/format.ts`). **Nota**: `timeSlots`
    (`lib/mock-data.ts`) son horas exactas, sin medias horas — con esa
    granularidad, Fútbol 11 (120 min) sí permite exactamente "inicio + 2
    horas" (120 no excede 120), pero "inicio + 3 horas" (180 min) queda
    bloqueado; Futsal (60 min) solo permite "inicio + 1 hora" (2+ horas
    siempre excede 60). La comparación se hace en minutos reales, así que si
    algún día se agregan slots de 30 minutos, estos límites empezarían a
    permitir más opciones intermedias sin tocar la lógica de validación.
    También se usa `maxDurationMinutes != null` como discriminador "es cancha" en el
    mensaje de WhatsApp de `/admin/agenda` (ver abajo), en vez de volver a
    hardcodear `spaceId === "cancha-..."`.
  - **`Space.images`** (`String[]`): fotos reales de cada instalación en
    `public/images/spaces/<Nombre>.jpg` (ej. `Area_Salon.jpg`,
    `Cancha_Futsal.jpg`). `components/ui/Card.tsx` ya prioriza
    `image` (la primera del array) sobre `icon` sobre un bloque gris —
    `app/proyectos/page.tsx` y `StepEspacio.tsx` le pasan
    `image={space.images[0]}`; si algún espacio nuevo no tiene fotos
    todavía, cae automáticamente al placeholder gris sin lógica adicional.
  - **`Project`** ampliado con `showProgress` (`Boolean`, default `true` —
    `false` oculta la barra de progreso en Card y en la página de detalle,
    para iniciativas que son convocatorias/promociones sin avance %, ej. la
    campaña de Taekwondo o el concurso de cotizaciones), `contactName`
    (`String?`) y `contactPhone` (`String?`, muestra un bloque de contacto
    con link `tel:` en la página de detalle cuando existe). Las 3
    iniciativas mock del blueprint original (Parque Central, Capacitación
    Laboral, Agua Potable) se reemplazaron por 3 reales de la comunidad
    (`comite-lote-adi`, `taekwondo-13-anos`, `concurso-mantenimiento-salon`).
  - **`Event`** ampliado con `type: ContentType` (`NEWS | EVENT` — un solo
    modelo para noticias y eventos, decisión confirmada con el usuario en vez
    de dos modelos separados), `slug` (único, para la ruta de detalle),
    `imageUrl` (opcional) y `featured` (para destacar, ej. Fiestas de Verano).
    **`summary`** (`String?`, nuevo): teaser corto para la tarjeta de
    listado; si es `null`, el listado usa `description` completo como
    respaldo. Se agregó al convertir "Convocatoria a Asamblea" en un resumen
    real post-evento con una `description` larga (varios párrafos) — sin
    `summary`, la tarjeta de listado mostraría el texto completo entero.
    `featured.endDate`/`item.endDate` (ya existía en el schema, ahora se usa
    de verdad) permite mostrar rango de fechas para eventos de varios días
    (Fiestas de Verano) vía `lib/format.ts` (`formatDateRange`) — ver abajo.
    **Importante**: `featured` NO depende de la fecha — Home muestra "Próximo
    evento" para lo que tenga `featured: true` sin importar si ya pasó. Si
    Fiestas de Verano queda con fechas pasadas respecto a la fecha actual,
    seguirá apareciendo como "próximo" hasta que se desmarque `featured`
    manualmente o se agregue lógica de fecha — no implementado todavía.
  - **`ContactMessage`** (`id/name/email/message/createdAt`): modelo para el
    formulario de Contacto, usado por `lib/actions/contact.ts`.
- `lib/format.ts` — helpers de fecha/hora compartidos. **Hay dos
  convenciones de construcción de fechas en el proyecto y cada una tiene su
  propio formateador — mezclarlas reintroduce un bug real de "un día de
  diferencia" que ya pasó dos veces, en direcciones opuestas**:
  - `Event.startDate`/`endDate` (seed) son `new Date("YYYY-MM-DD")`, que JS
    interpreta como medianoche **UTC**. Se formatean con `formatDate`/
    `formatDateRange`, que fijan `timeZone: "UTC"` explícitamente — bug
    real encontrado y corregido: sin esto, un offset negativo (Costa Rica,
    UTC-6) corría la fecha un día hacia atrás (Fiestas de Verano aparecía
    el 9 en vez del 10 de abril).
  - `Reservation.startTime`/`endTime` (`lib/actions/reservations.ts`) son
    `new Date(\`${date}T${time}:00\`)`, **sin** sufijo de zona, que JS
    interpreta en la hora **local** del servidor. Se formatean con
    `formatLocalDate`/`formatTime` (sin `timeZone` fijo). Casi reintroduzco
    el bug al construir la tabla de "Próximas Reservas": usar `formatDate`
    (UTC) ahí mostraba el día siguiente para cualquier reserva que empezara
    a las 18:00 o después (ej. una reserva de 20:00 aparecía fechada al día
    siguiente). `formatDateRange`/`isSameUtcDay` son válidas solo para
    `Event`, no usarlas con fechas de `Reservation`.
  - Regla práctica: antes de formatear una fecha nueva, revisar cómo se
    construyó ese campo (`new Date("YYYY-MM-DD")` → UTC; `new Date(`...T...`)`
    sin zona → local) y usar el formateador que corresponda.
- `lib/pricing.ts` — lógica de precios del contrato real de alquiler:
  - Salón Multiusos: `SALON_BASE_RATE` (¢45.000 fijo por reserva) +
    `baseFurnitureSets * SALON_FURNITURE_SET_PRICE` (¢2.500 por set de 1 mesa
    + 6 sillas) + extras individuales (`EXTRA_ITEM_PRICES`: mesa ¢1.000,
    silla ¢250, mantel ¢1.000).
  - Cocina/Comedor: precio de `CATERING_PACKAGES` según paquete elegido
    (35/¢35.000, 50/¢55.000, 75/¢75.000 personas, mobiliario base incluido)
    + extras individuales si se necesita más (`EXTRA_ITEM_PRICES`, los mismos
    de Salón Multiusos). A diferencia de Salón, Cocina/Comedor **no** tiene
    campo de "sets de mobiliario base" — ya viene incluido en el paquete.
  - Cancha de Fútbol 11: **esquema diurno/nocturno** — ¢25.000 diurno /
    ¢35.000 nocturno, máximo 2 horas por reserva (`maxDurationMinutes:
    120`, ver arriba). `calculateDayNightRate` (genérica, no específica de
    ningún espacio, hoy solo la usa Fútbol 11) devuelve `space.baseRate`
    (diurno) si la reserva **termina a las 18:00 o antes**, o
    `space.nightRate` (nocturno) si **termina después de las 18:00**
    (`hour > NIGHT_CUTOFF_HOUR`, no `>=`) — decide por la hora de **fin**,
    no la de inicio: una reserva que arranca de día pero se extiende hasta
    después de las 18:00 se cobra nocturna completa (ej. 17:00-19:00 es
    nocturna), pero una que termina justo a las 18:00 (ej. 16:00-18:00)
    sigue siendo diurna. El corte es estrictamente "después de", no
    "desde" — se corrigió explícitamente porque el usuario quería que las
    6:00 p.m. en punto todavía contaran como diurnas (una reserva que
    cierra justo cuando empieza la noche no debería pagar tarifa
    nocturna). Bug real corregido antes (no confundir con el ajuste de
    arriba): la primera versión miraba `startTime` en vez de `endTime`,
    así que una reserva 17:00-20:00 se cobraba diurna incorrectamente.
    `calculateDayNightRate` también tolera `nightRate: null` (devuelve
    siempre `baseRate` en ese caso) — necesario para Cancha de Futsal (ver
    abajo), que reutiliza esta misma función pasándole `nightRate: null`
    en vez de tener una rama de cálculo aparte. Si se vuelve a tocar esta
    función, mantener los tres: el chequeo sobre `endTime` (no
    `startTime`), el corte estrictamente `>` (no `>=`), y la tolerancia a
    `nightRate: null` — el call site en `ReservationWizard.tsx` pasa
    `selectedSpace?.nightRate ?? null` (no `?? 0`; con `?? 0` una reserva
    nocturna de un espacio sin `nightRate` se cobraría gratis).
  - Cancha de Futsal: ¢10.000 por hora, **sin** diferencia día/noche
    (`Space.nightRate` es `null` para este espacio — antes tenía esquema
    diurno/nocturno como Fútbol 11, se simplificó a un monto fijo). Máximo
    1 hora por reserva (`maxDurationMinutes: 60`, sin cambios). Hay un
    selector de "Deporte a jugar" — Fútbol/Básquetbol/Vóleibol —
    puramente informativo, no afecta el precio, y **sigue sin persistirse**
    como columna en `Reservation`: vive en el estado del wizard, se
    muestra en el resumen del paso 4, y se pasa como campo suelto
    (`sport`) a `createReservation` únicamente para incluirlo en el email
    de notificación — ver `lib/actions/reservations.ts` abajo.
  - `calculateSalonTotal`/`calculateCateringTotal`/`calculateDayNightRate`
    son funciones puras, se llaman en vivo desde el wizard de reservaciones
    en cada cambio de opción (incluida la hora de inicio, para el caso
    diurno/nocturno).
- `components/ui/` — componentes base reutilizables, siguiendo las interfaces
  de la sección 3 del blueprint: `Button.tsx`, `Card.tsx`, `CalendarSlot.tsx`,
  `FormField.tsx`. Todos extienden ligeramente la spec original del blueprint:
  - `Button` agrega `href?: string` — si viene, renderiza `next/link` con las
    mismas clases visuales; si no, renderiza `<button>`. Necesario porque el
    wireframe de Home usa botones que en realidad son CTAs de navegación
    (Hero, WhatsApp del header).
  - `Card` agrega `icon?: ReactNode` (tarjetas de "acciones rápidas", que
    usan ícono en vez de imagen) y `progress?: number` (barra de progreso
    que pide el wireframe de "iniciativas actuales" y que la spec original
    no contemplaba). Cuando no se pasa `image` ni `icon`, `Card` renderiza un
    bloque `bg-neutral-100` sólido como placeholder — evita depender de URLs
    externas (ej. Unsplash) hasta que haya imágenes reales en Supabase
    Storage. Si en el futuro se le pasa `image` con una URL externa, hay que
    agregar el dominio a `images.remotePatterns` en `next.config.mjs`
    (`next/image` lo exige). El union de `status` también se amplió con
    `'available' | 'coming_soon'` ("Disponible"/"Próximamente", verde/gris)
    para las tarjetas de instalaciones en Home y `/proyectos`, además de los
    valores originales de proyectos (`draft/active/completed`). También
    agrega `showProgress?: boolean` (default `true`) — la barra de progreso
    solo se dibuja si `progress` viene Y `showProgress` no es `false`, para
    proyectos que son convocatorias/promociones sin avance % real.
  - `CalendarSlot` sigue la spec tal cual (`date`, `time`, `status`,
    `onSelect`), con una corrección de accesibilidad respecto al blueprint:
    usa `aria-pressed` en vez de `aria-selected` (que el blueprint pedía),
    porque `aria-selected` no es válido en elementos con `role="button"` según
    la spec ARIA — `aria-pressed` es el atributo correcto para un botón tipo
    toggle y transmite la misma semántica de "seleccionado".
  - `FormField` agrega los props que la spec original no incluía pero que un
    campo controlado real necesita: `value`, `onChange`, `name`, `options`
    (para `select`), `rows` (para `textarea`); y agrega los tipos `'date'` y
    `'number'` al union de `type` (el formulario de reservaciones los
    necesita).
- `components/layout/` — `Header.tsx` (client component: nav responsive con
  menú hamburguesa en mobile vía `useState`, toggle de idioma ES/EN
  puramente visual — no hay i18n ni copy en inglés todavía, botón de
  WhatsApp) y `Footer.tsx` (contacto, redes, links legales — todo
  placeholder). Ambos se importan una sola vez en `app/layout.tsx`.
- `components/icons/WhatsAppIcon.tsx` — SVG inline del logo de WhatsApp;
  Heroicons (el set recomendado en la sección 2 del blueprint) no incluye
  logos de marca.
- `components/home/HeroCarousel.tsx` (Client Component, `useState`/
  `useEffect` para la rotación) — fondo del Hero de Home: 3 fotos reales
  de la comunidad en `public/images/hero/hero-{1,2,3}.jpg`, rotando cada
  5s con crossfade (`opacity` + `transition-opacity duration-1000`, todas
  las imágenes apiladas con `position: absolute`, así que no hay salto de
  layout). `next/image` con `fill` + `sizes="100vw"` + `priority` solo en
  la primera (candidata a LCP) — deja que Next optimice/comprima cada
  imagen al servirla (no hizo falta preprocesar los archivos fuente, que
  ya venían en una resolución razonable, ~2048px de ancho). Overlay con
  degradado del azul marino de marca encima de las fotos (más oscuro
  abajo, donde está el botón) — ver la nota de "Bug conocido" en
  Convenciones más abajo: usa valores `rgba()` arbitrarios en vez de
  `bg-primary-blue/90` porque ese modificador de opacidad no funciona con
  este token. Puramente ambiental: `aria-hidden="true"`, sin flechas ni
  puntos de navegación (se evaluó visualmente con capturas de pantalla y
  no hacían falta). `app/page.tsx` lo importa dentro de la sección del
  Hero (`position: relative`), reemplazando el fondo sólido que tenía
  antes; el botón "Reservar Espacios" (variant `primary`, también
  `bg-primary-blue`) necesitó un borde blanco extra
  (`border-2 border-white/70 shadow-lg`, vía el prop `className` de
  `Button`) porque si no se perdía contra el overlay del mismo tono.
- `components/reservaciones/` — el wizard de 4 pasos de `/reservaciones`:
  `ReservationWizard.tsx` (orquestador con el estado del formulario, cálculo
  de `totalAmount` en vivo, navegación entre pasos y vista de éxito real —
  solo se muestra si `createReservation` devuelve `ok: true`). La vista de
  éxito muestra el monto total, el monto del depósito (50%, vía
  `calculateDepositAmount` de `lib/pricing.ts`), un bloque destacado
  (`border-warning/30 bg-warning/10`) con las instrucciones de SINPE al
  `siteConfig.sinpeNumber` y el corte de medianoche, y una nota de que
  "en unos minutos" debería llegar un WhatsApp con los mismos datos —
  **esa nota asume que alguien en `/admin/agenda` presiona el botón de
  WhatsApp pronto; el envío sigue siendo 100% manual, no hay ningún envío
  automático todavía** (ver `app/admin/agenda/whatsapp-message.ts` abajo).
  Además de eso +
  `StepEspacio.tsx`, `StepFechaHora.tsx`, `StepContratista.tsx`,
  `StepResumen.tsx` (uno por paso) + `types.ts` (forma del estado del
  formulario y `ReservationSpace`, compartidas entre pasos). Nota: la
  descripción de la actividad y la cantidad de asistentes se agruparon en
  `StepContratista.tsx` (paso 3) porque el usuario no los asignó
  explícitamente a un paso al pedir la feature.
  - `app/reservaciones/page.tsx` (Server Component) trae los `Space`
    reservables vía Prisma y se los pasa a `ReservationWizard` como prop
    `spaces: ReservationSpace[]` — **importante**: `Space.baseRate` y
    `Space.nightRate` son `Decimal` en Prisma, no serializables tal cual al
    cruzar a un Client Component como prop, así que ambos se convierten a
    `Number(...)` (o `null`) antes de pasarlos. Cualquier otro campo
    `Decimal` que se necesite pasar a un Client Component necesita la misma
    conversión. La misma página llama `releaseExpiredDeposits()` antes de
    consultar (ver arriba) y trae también las próximas reservas
    (`status != CANCELLED`, `paymentStatus != DEPOSIT_PENDING` — sin
    depósito confirmado no se muestra públicamente, ver arriba —,
    `startTime >= ahora`, máx. 20) y las pasa a
    `ProximasReservas.tsx` (Server Component, tabla en desktop/tarjetas
    apiladas en mobile vía `hidden sm:block` / `sm:hidden`) — usa
    `formatShortName` de `lib/format.ts` para no mostrar el nombre completo
    del contratista en esa tabla pública ("Marco Arrieta Cruz" → "Marco
    A."); el nombre completo se sigue usando sin cambios en la base de
    datos y en el email de notificación.
- `middleware.ts` (raíz del proyecto) + `app/admin/agenda/` — panel interno
  para gestionar el estado de pago de las próximas reservas (pensado para
  la persona que abre/cierra las instalaciones, no para el público).
  - **Protección**: `middleware.ts` aplica HTTP Basic Auth solo a
    `/admin/:path*` (matcher), comparando la contraseña del diálogo del
    navegador contra `ADMIN_PASSWORD` (`.env`) — el "usuario" que pide el
    diálogo se ignora, solo importa la contraseña. Se eligió Basic Auth en
    vez de un formulario + cookie de sesión porque no requiere UI propia ni
    lógica de sesión/CSRF que mantener: el navegador recuerda la credencial
    mientras esté abierto, suficiente para "una persona con una contraseña
    compartida" (no es multi-usuario ni de nivel empresarial, a propósito).
    Si `ADMIN_PASSWORD` no está definida, el middleware responde 500 en vez
    de dejar pasar la request sin protección.
  - `app/admin/agenda/page.tsx` (Server Component, `force-dynamic`):
    llama `releaseExpiredDeposits()` (ver arriba) antes de consultar, luego
    mismo filtro/orden que `ProximasReservas` (`status != CANCELLED`,
    `startTime >= ahora`, máx. 20) pero **sin** `formatShortName` y **sin**
    filtrar por `paymentStatus` — a diferencia de la tabla pública, esta
    vista es información operativa, necesita el nombre completo, el
    teléfono, el monto, y también debe mostrar las reservas
    `DEPOSIT_PENDING` (la pública no). No se comparte una query helper con
    `app/reservaciones/page.tsx`: el `select`/`include` que necesita cada
    vista es distinto, y la duplicación real (`where`/`orderBy`/`take`) es
    de solo 4 líneas. La query usa `include` **sin** `select` — en Prisma
    eso ya devuelve todos los campos escalares de `Reservation` (cédula,
    profesión, mobiliario, `createdAt`, `status`, etc.) además de la
    relación incluida, así que el modal de detalle (ver abajo) no necesitó
    ampliar la query, solo dejar de descartar esos campos al armar los
    props de cada tarjeta.
  - `app/admin/agenda/ReservationCard.tsx` (Client Component, una tarjeta
    por reserva — se volvió Client Component porque necesita `useState`
    para el modal y `confirm()` antes de cancelar; `page.tsx` solo arma los
    datos y hace `.map()`). Exporta el tipo `ReservationCardData` (forma
    "aplanada" y client-safe de una reserva: `totalAmount` ya convertido a
    `number`, fechas como `Date` — RSC serializa `Date` de forma nativa al
    cruzar a un Client Component, no hace falta convertir a string).
    Insignia de 3 estados según `reservation.paymentStatus`: naranja/
    `warning` "Depósito pendiente" (`DEPOSIT_PENDING`) — con un texto
    pequeño debajo, `Vence hoy {formatTime(depositDeadline)}`, siempre
    "hoy" porque una `DEPOSIT_PENDING` vencida ya se auto-canceló vía
    `releaseExpiredDeposits` antes de llegar a esta lista, no puede
    mostrarse vencida —, morada "50% pagado" (`DEPOSIT_PAID`, usa la
    paleta `purple` nativa de Tailwind — `bg-purple-100 text-purple-700` —
    porque el design system no tiene un token morado definido, no vale la
    pena agregar uno para una sola insignia), verde/`success` "100%
    pagado" (`FULLY_PAID`). Botones de pago, ambos como `<form
    action={...}>` (Server Action pasada directo al `action` del form,
    funciona igual dentro de un Client Component; ambas llaman
    `revalidatePath("/admin/agenda")` para que la insignia cambie sin
    recarga manual) — **un solo botón de pago por estado, sin atajo para
    saltar directo a 100%** (decisión explícita del usuario, revierte un
    diseño de 2 botones de una sesión anterior):
    - `DEPOSIT_PENDING`: "Marcar 50% pagado" (→ `markDepositPaid`) +
      "Enviar mensaje de reserva" (WhatsApp, ver abajo).
    - `DEPOSIT_PAID`: "Marcar 100% pagado" (→ `markFullyPaid`) + "Enviar
      recordatorio del día" (WhatsApp, ver abajo).
    - `FULLY_PAID`: sin botones de pago.
    Dos botones más, **siempre visibles** (no dependen de
    `paymentStatus`):
    - **"Ver detalle"** (`Button` `variant="ghost"` `size="sm"`,
      `InformationCircleIcon`): abre `ReservationDetailModal`.
    - **"Cancelar reserva"** (`Button` `variant="danger"` — ya existía en
      `Button.tsx`, rojo, visualmente distinto del azul/verde de los otros
      dos): `window.confirm(...)` nativo (decisión explícita del usuario,
      para no construir un segundo modal solo para esto) con el nombre,
      espacio y fecha; si se confirma, llama la Server Action
      `cancelReservation(id)` directo (no por `<form>` — los Client
      Components pueden invocar Server Actions como funciones async
      normales) y **además** llama `router.refresh()`
      (`next/navigation`) explícitamente. **Importante, no es redundante**:
      `revalidatePath` dentro de la Server Action invalida la caché en el
      servidor, pero cuando la acción se invoca directo desde un
      `onClick` (a diferencia de `markDepositPaid`/`markFullyPaid`, que se
      disparan vía `<form action={...}>`), Next.js no siempre refresca el árbol de
      Server Components del lado del cliente por sí solo — se comprobó
      en vivo: sin `router.refresh()`, el `UPDATE` en la base ocurría
      correctamente pero la tarjeta cancelada seguía visible hasta
      recargar la página a mano. Si se agrega otra acción invocada directo
      (no vía `<form>`) que necesite reflejarse de inmediato en la UI,
      replicar este mismo patrón (`revalidatePath` en el servidor +
      `router.refresh()` en el cliente).
  - `app/admin/agenda/whatsapp-message.ts` — arma los links `wa.me` con
    **2 mensajes distintos según el punto del esquema de depósito** (no
    variantes por tipo de espacio como en una versión anterior):
    `buildDepositRequestMessage` (`DEPOSIT_PENDING` — pide el depósito del
    50%, menciona el corte de medianoche), `buildDayReminderMessage`
    (`DEPOSIT_PAID` — recuerda el 50% restante "de hoy") y
    `buildPaymentConfirmedMessage` (`DEPOSIT_PAID` **o** `FULLY_PAID` —
    confirma que el pago ya se recibió; a diferencia de los otros dos, que
    son exclusivos de un solo estado, este botón aparece en ambos). Mismo
    formato de teléfono sin `+` que `getWhatsappHref` en `lib/site-config.ts`
    (`https://wa.me/506<telefono>?text=<mensaje codificado>`, vía
    `buildWhatsappReminderHref`, sin cambios). Ambos mensajes usan
    `siteConfig.sinpeNumber` (no repiten el literal) y `formatColones`
    para los montos (ya incluye el símbolo `₡`, así que las plantillas no
    lo repiten aparte) — los montos se calculan con
    `calculateDepositAmount` (ver `lib/pricing.ts` arriba). **Los botones
    solo se muestran si `contractorPhone` matchea
    `CONTRACTOR_PHONE_PATTERN`** — las 2 reservas reales anteriores al
    campo `contractorPhone` (ver arriba) tienen el placeholder `"No
    registrado"`, que rompería la URL de WhatsApp (espacio sin codificar
    en el path) si se intentara armar un link con ese valor; para esos
    casos solo quedan disponibles los botones de "Marcar X% pagado" a
    mano.
  - **El envío es semi-manual, a propósito**: el botón abre WhatsApp Web/App
    con el mensaje ya escrito (`target="_blank"`, sin `window.open` ni JS
    de cliente — es un `<a>` normal), pero alguien tiene que presionar
    "Enviar" ahí mismo. Es el primer paso antes de una futura integración
    automática con WhatsApp Business API (no implementada).
  - `app/admin/agenda/ReservationDetailModal.tsx` (Client Component):
    overlay simple con `useState` en `ReservationCard` (no `<dialog>`
    nativo — se evitan diferencias de soporte entre navegadores para una
    herramienta interna), cierra con el botón "✕", clic en el fondo, o
    tecla Escape (`useEffect` + listener de `keydown`). Muestra todo lo
    que la tarjeta resumida no muestra: `id`, `status` general (mapa local
    `RESERVATION_STATUS_LABELS`, no existía en ningún otro lado),
    `createdAt` (formateado con `formatLocalDate`/`formatTime` — es un
    instante real vía `@default(now())`, no un campo "YYYY-MM-DD" ni
    "...T...", pero como el proceso corre en `America/Costa_Rica` igual
    que el resto, esos mismos formateadores ya muestran la hora correcta
    sin necesitar uno nuevo), cédula/profesión/estado civil/dirección, y
    el bloque específico según `spaceId` (mobiliario/extras para
    `salon-multiusos`, paquete de `CATERING_PACKAGES` para
    `cocina-comedor`). **Cancha de Futsal no muestra "deporte" en este
    modal** — `sport` nunca se guarda como columna en `Reservation` (ver
    nota de `sport` más abajo en `lib/actions/`), así que no hay nada que
    mostrar ahí; si en algún momento se quiere ver el deporte en el admin,
    hay que agregar la columna primero.
  - `MARITAL_STATUS_LABELS` vive en `components/reservaciones/types.ts`
    (junto al tipo `MaritalStatus`, mismo patrón que `SPORT_LABELS` junto
    a `Sport`) — se movió ahí desde `StepResumen.tsx` (donde era un const
    local sin exportar) porque el modal de detalle necesitaba la misma
    traducción; ahora `StepResumen.tsx` también lo importa de ahí. Si se
    necesita en un tercer lugar, ya está listo para reusar.
- `lib/actions/` — Server Actions (`"use server"`) que escriben en la base:
  - `reservations.ts`: `getBookedSlots(spaceId, date)` (consulta reservas que
    se solapan con esa fecha exacta para marcar horas `booked` en
    `CalendarSlot` — reemplaza la disponibilidad estática que tenía el
    mock); `createReservation(input)` (revisa conflictos de solapamiento una
    vez más de forma defensiva y crea la `Reservation` con
    `status: "PENDING"`). **`totalAmount` se recalcula siempre en el
    servidor** (`calculateServerTotalAmount`, misma función interna, no
    exportada) — el `input.totalAmount` que manda el cliente **nunca** se
    guarda ni se usa para el cobro, solo es informativo (un cliente
    malicioso podría invocar la Server Action directo, sin pasar por la UI,
    con cualquier valor). `calculateServerTotalAmount` replica exactamente
    la misma bifurcación por `spaceId` que ya usa `ReservationWizard.tsx`
    (`calculateSalonTotal`/`calculateCateringTotal`/`calculateDayNightRate`
    de `lib/pricing.ts`), pero para las canchas lee `Space.baseRate`/
    `nightRate` frescos de la base con `prisma.space.findUnique` — esos dos
    campos ni siquiera viajan en `CreateReservationInput`, así que no hay
    nada que un cliente pueda mandar para influir el precio de una cancha.
    Si el monto recalculado no coincide con el que mandó el cliente
    (no debería pasar si la lógica de precios del wizard y el servidor
    siguen sincronizadas), se guarda igual el valor del servidor — es la
    fuente de verdad — y se deja un `console.warn` con ambos valores, útil
    para detectar tanto manipulación como una futura desincronización real
    entre el cálculo del wizard y el del servidor. Verificado en vivo con
    una llamada directa a `createReservation` (sin pasar por el wizard)
    mandando `totalAmount: 1` para una reserva nocturna de Fútbol 11: la
    fila quedó guardada con `₡35.000` (el valor real), no `₡1`. Si se
    agrega un espacio o una regla de precio nueva, hay que replicar el
    cálculo en **ambos lados** (`ReservationWizard.tsx` para el preview en
    vivo, `calculateServerTotalAmount` para el monto real que se guarda) —
    no hay una función compartida cliente/servidor todavía porque el lado
    cliente no puede hacer una consulta a Prisma directamente.
    Después de crear la reserva con éxito, llama
    `sendReservationNotificationEmail` (mismo archivo, no exportada) que
    manda un correo vía **Resend** (`RESEND_API_KEY`/`NOTIFICATION_EMAIL`
    en `.env`, `from: "onboarding@resend.dev"` — dominio de pruebas de
    Resend, cambiar cuando haya dominio propio verificado) con el detalle
    completo de la reserva. **Best-effort, nunca bloquea**: todo el envío
    va en un `try/catch` propio (y valida que ambas env vars existan antes
    de intentar) — si Resend falla o las credenciales faltan, solo se hace
    `console.error`, la función igual retorna `{ ok: true, id }` porque la
    reserva ya quedó guardada en la base, que es lo prioritario.
    `CreateReservationInput` incluye `spaceName` y `sport` (ver arriba)
    solo para el cuerpo del correo — ninguno de los dos tiene columna en
    `Reservation`. `createReservation` también fija `paymentStatus:
    "DEPOSIT_PENDING"` y calcula `depositDeadline` (ver arriba, sección de
    `Reservation.paymentStatus`). También exporta
    `releaseExpiredDeposits()` (expiración perezosa de depósitos vencidos,
    ver arriba), `markDepositPaid(reservationId)` y
    `markFullyPaid(reservationId)` (los dos botones de pago de
    `/admin/agenda`, reemplazan al `markReservationPaid` original de 2
    estados) y `cancelReservation(reservationId)` (pone `status:
    "CANCELLED"` + `revalidatePath("/admin/agenda")`), todas usadas por
    `/admin/agenda` (ver arriba). Cancelar libera el horario
    automáticamente en el wizard público: `getBookedSlots` y el chequeo de
    conflicto de `createReservation` ya filtran `status: { not:
    "CANCELLED" }` — no hace falta tocar nada más, verificado en vivo
    (cancelar una reserva de prueba y confirmar que ese horario vuelve a
    aparecer como disponible en `/reservaciones`). También exporta
    `createManualReservation(input)`, usada por
    `app/admin/agenda/AddManualReservationForm.tsx` (sección expandible al
    inicio de `/admin/agenda`, no modal) para registrar reservas
    coordinadas por fuera del sitio (WhatsApp, teléfono) — a diferencia de
    `createReservation` (wizard público): solo exige espacio/fecha/
    horario/nombre (el resto de campos de texto caen a `"No registrado"` y
    `attendeesCount` a `0` si se dejan vacíos, aplicado en el servidor, no
    en el formulario), el estado de pago lo elige el admin en el momento
    (sin default forzado) en vez de arrancar siempre en
    `DEPOSIT_PENDING`, el `status` inicial es `CONFIRMED` (no `PENDING`:
    ya fueron coordinadas y acordadas, no hay nada que revisar), **y
    `depositDeadline` queda `null` siempre** — nunca se calcula "fin del
    día de hoy", que es justo lo que las exime de
    `releaseExpiredDeposits()`. Comparte `hasReservationConflict`
    (extraído de `createReservation`, que también lo usa ahora) y
    `calculateServerTotalAmount` (con `PricingInput`, un tipo más angosto
    que `CreateReservationInput` — extraído para que este segundo call
    site no tenga que fabricar un objeto con todos los campos del wizard
    público que no aplican acá) para no duplicar ni la validación de
    solapamiento ni el cálculo de precio. **Limitación conocida**: el
    formulario no tiene selector de paquete para Cocina/Comedor, así que
    una reserva manual de ese espacio sale en ¢0 — ninguna de las 5
    reservas reales cargadas usa ese espacio, así que no se resolvió
    todavía. Sin email de notificación (a diferencia de
    `createReservation`): no es una solicitud nueva que alguien deba
    revisar. **5 reservas reales cargadas** con esta acción (Cancha de
    Fútbol 11, 09:00-11:00, `FULLY_PAID`): 26 jul. (Gilbert), 6 sep., 20
    sep. y 27 sep. (Tito el 20, Jhon/equipo comunal los otros dos) y 11
    oct. 2026 (Jhon/equipo comunal) — coordinadas con el encargado
    anterior por fuera del sitio, cargadas solo para bloquear el horario
    y evitar dobles reservas, no para llevar un registro de contacto (por
    eso los demás campos quedan en `"No registrado"`/`0`). **Nota de
    entorno**: `revalidatePath` (usado por `createManualReservation`,
    igual que `markDepositPaid`/`markFullyPaid`/`cancelReservation`) tira
    `Invariant: static generation store missing` si se llama la Server
    Action desde un script standalone (`tsx algo.ts`) en vez de una
    request real de Next.js — la escritura en la base ya se completó
    ANTES de esa línea (es la última del cuerpo de la función), así que
    la fila queda guardada igual; solo hay que envolver la llamada en
    `try/catch` en el script y ese error específico se puede ignorar. Así
    se cargaron las 5 reservas de arriba.
  - `contact.ts`: `submitContactMessage(input)` (crea el `ContactMessage`,
    luego llama `sendContactNotificationEmail` — mismo patrón best-effort
    que `sendReservationNotificationEmail`: Resend, `from:
    "onboarding@resend.dev"`, asunto `Nuevo mensaje de contacto — {nombre}`,
    cuerpo con nombre/correo/mensaje completo, `try/catch` propio que solo
    hace `console.error` si falla — el mensaje ya quedó guardado en la
    base, que es lo prioritario, igual que en reservas).
  - Ambas se llaman directamente desde Client Components (`ReservationWizard`/
    `StepFechaHora`/`ContactForm`) — Next.js las trata como funciones remotas
    normales, no hace falta un endpoint API aparte.
- `components/contacto/ContactForm.tsx` — formulario de Contacto (client
  component). Llama a `submitContactMessage` (Server Action) y muestra la
  vista de confirmación solo si la escritura fue exitosa; si falla, muestra
  un mensaje de error en vez de fingir éxito.
- `lib/mock-data.ts` — **solo** contenido sin modelo correspondiente en el
  schema: `timeSlots` (regla de negocio de horario de atención, 08:00–22:00,
  no una tabla) y `financialImpactSummary` (informe financiero julio
  2025–mayo 2026, presentado como logros/reinversión — el desglose de
  aportes municipales/Hacienda/CoopeTransasi no vino individualizado, se
  agrupó en un solo rubro con el monto residual). Todo lo que sí tenía
  modelo (`mockSpaces`, `mockProjects`, `mockNewsEvents`, `mockBookedSlots`)
  se eliminó de este archivo — ahora se consulta directamente vía
  `lib/prisma.ts` en cada página/Server Action. `mockImpactMetrics` (las 4
  métricas numéricas placeholder que tenía Home) también se eliminó — ver
  `lib/valores.tsx` abajo, las reemplaza.
- `lib/valores.tsx` — los 5 Valores de la ADI (Transparencia, Responsabilidad
  compartida, Orden y disciplina, Compromiso comunitario, Respeto), cada uno
  con `title`/`description`/`icon` (JSX de Heroicons — por eso este archivo
  es `.tsx` y no vive en `lib/mock-data.ts`, que es `.ts` puro). Un solo
  lugar de verdad, consumido por dos páginas: `/gobernanza` los muestra
  completos (ícono + nombre + descripción) y Home solo ícono + nombre (sin
  `excerpt`) en la sección "Nuestros Valores" que reemplazó las 4 métricas
  numéricas placeholder (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`). Editar
  un valor acá se refleja en ambas páginas a la vez.
- `app/proyectos/page.tsx` — la sección "Impacto financiero" incluye una
  galería de 2 infografías reales del informe económico
  (`public/images/reports/Informe_Ingresos.jpg` /
  `Informe_Salidas.jpg` — **nota**: los archivos originales tenían doble
  extensión `.jpg.jpeg`, típico de una herramienta de conversión; se
  renombraron a `.jpg` limpio, sin ninguna referencia previa en el código
  que rompiera). `next/image` con `width={853} height={1280}` (dimensiones
  reales del archivo, leídas del header JPEG antes de fijarlas, para no
  forzar un aspect ratio incorrecto — son infografías con texto pequeño, no
  usan el recorte `object-cover` que sí usa `Card.tsx`). Cada imagen está
  envuelta en un `<a target="_blank">` a la imagen original a tamaño
  completo — se eligió "abrir en pestaña nueva" en vez de un modal porque
  `/proyectos` es un Server Component sin ningún Client Component todavía;
  un modal habría exigido convertir esta sección solo para esto, y el
  visor nativo del navegador ya permite hacer zoom, suficiente para leer
  el detalle.
- `lib/site-config.ts` — constantes de contacto/redes/legales reales de LA
  ADI: `lema` ("Una comunidad diferente."), `whatsappNumber`/`sinpeNumber`
  (8330-4351), `address` (Calle Vargas, Tambor, Alajuela), y `legalInfo`
  (cédula jurídica, folio real, presidente/apoderado general y su
  nombramiento). `socialLinks`/`legalLinks` siguen siendo placeholders
  (`href="#"`) — no hay cuentas de redes ni páginas legales reales todavía.

## Convenciones

- Colores, tipografía y espaciado se consumen vía las clases de Tailwind
  extendidas en `tailwind.config.ts` (`primary.blue`, `primary.green`,
  `accent.orange`, `neutral.50/100/600/800/900`, `success/warning/error/info`),
  que a su vez mapean a las variables CSS definidas en `app/globals.css`. No
  hardcodear valores hex o rem sueltos en componentes.
  - **Bug conocido, pendiente de arreglar en todo el sitio**: el
    modificador de opacidad de Tailwind (`bg-primary-blue/90`,
    `bg-primary-blue/10`, etc.) **no funciona** con estos tokens, porque
    `tailwind.config.ts` los mapea a `var(--primary-blue)` y esa variable
    CSS guarda un string hex plano (`#152a4e`), no canales RGB — Tailwind
    no puede componer opacidad sobre un `var()` que no puede leer en
    build time, y el resultado es que la clase se renderiza **invisible**
    (transparente), no con la opacidad pedida ni tampoco opaca al 100%.
    Se descubrió construyendo `components/home/HeroCarousel.tsx`: subir
    la opacidad del overlay de 40% a 95% no cambiaba nada visualmente — el
    overlay simplemente nunca se pintaba. El mismo patrón se usa hoy en
    `Button.tsx` (`hover:bg-primary-blue/90`, `hover:bg-primary-blue/10`,
    `hover:bg-primary-green/90`, `hover:bg-primary-green/10`), `Card.tsx`
    (`bg-primary-blue/10` en los círculos de ícono) y en un par de lugares
    más (`app/page.tsx`, `ReservationCard.tsx`) — en esos casos el efecto
    es sutil (un hover o un círculo de fondo que no se nota) así que nunca
    se notó a simple vista, a diferencia del overlay del Hero donde era
    obvio. **No corregido todavía** (fuera de alcance de la tarea del
    Hero, que solo tocó `HeroCarousel.tsx`) — el fix, si se hace, es
    reemplazar esos `/opacity` por valores `rgba()` arbitrarios
    (`bg-[rgba(21,42,78,0.1)]`, mismo patrón usado en `HeroCarousel.tsx`)
    o cambiar `--primary-blue`/`--primary-green` en `globals.css` para
    guardar canales RGB en vez de hex, y ajustar `tailwind.config.ts` para
    envolverlos en `rgb(var(--x) / <alpha-value>)`.
- Fuentes: `Inter` (`font-sans`, cuerpo de texto) y `Montserrat`
  (`font-heading`, encabezados), cargadas vía `next/font/google` en
  `app/layout.tsx`.
- El sitio es en español; usar el copy de la sección 5 del blueprint como
  referencia de tono y contenido al escribir nuevo texto de UI.

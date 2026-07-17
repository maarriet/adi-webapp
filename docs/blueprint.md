# Community Development Association Website — Blueprint

> Documento de referencia del proyecto. Léelo antes de proponer cualquier plan o feature.

---

## 1) Sitemap y estructura de contenido

### Navegación principal

```
Home ├── Reservaciones ├── Proyectos e Impacto ├── Gobernanza ├── Involúcrate ├── Noticias y Eventos └── Contacto
```

### Estructura detallada por página

**Home** — Portal de bienvenida y centro de acción
- Hero: foto de la comunidad + declaración de misión
- Acciones rápidas: Reservar espacios, Ver proyectos, Contactar por WhatsApp
- Iniciativas actuales (3 tarjetas)
- Próximos eventos (2 items)
- Dashboard de métricas de impacto
- Footer con info legal/contacto

**Reservaciones** — Experiencia de reserva simplificada
- Selección de espacio (Cancha de fútbol, Salón multiuso, Área recreativa)
- Vista de calendario con disponibilidad
- Flujo de reserva (4 pasos)
- Información de reglas y precios
- Sección de FAQ

**Proyectos e Impacto** — Storytelling y transparencia
- Grid de proyectos activos
- Páginas individuales por proyecto con seguimiento de progreso
- Galerías de fotos
- Métricas de impacto y testimonios

**Gobernanza** — Transparencia y rendición de cuentas
- Perfiles de miembros de la junta
- Archivo de actas de reuniones
- Reportes financieros y presupuestos
- Repositorio de documentos de políticas

**Involúcrate** — Participación comunitaria
- Oportunidades de voluntariado
- Matching por habilidades
- Opciones de donación/patrocinio
- Historias de éxito y testimonios

**Noticias y Eventos** — Actualizaciones comunitarias
- Calendario de eventos con filtros
- Artículos de noticias por categoría
- Anuncios de reuniones
- Celebraciones comunitarias

**Contacto** — Múltiples canales de comunicación
- Formulario de contacto
- Integración con WhatsApp
- Ubicación y horarios de oficina
- Contactos de emergencia

---

## 2) Dirección visual y de marca

### Paleta de colores

```css
/* Colores primarios */
--primary-blue: #2563EB     /* Confianza, estabilidad */
--primary-green: #059669    /* Crecimiento, comunidad */
--accent-orange: #EA580C    /* Energía, acción */

/* Neutrales */
--neutral-50: #F8FAFC
--neutral-100: #F1F5F9
--neutral-600: #475569
--neutral-800: #1E293B
--neutral-900: #0F172A

/* Colores semánticos */
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6
```

### Escala tipográfica

```css
/* Fuente primaria: Inter (Google Fonts) */
--font-primary: 'Inter', system-ui, sans-serif;
--font-secondary: 'Montserrat', sans-serif; /* Encabezados */

/* Escala */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Escala de espaciado

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Iconografía recomendada

- Heroicons (estilo outline, para consistencia)
- Phosphor Icons (alternativa, más lúdica)
- Iconos clave necesarios: Calendario, Usuarios, Documento, Teléfono, WhatsApp, Ubicación, Reloj

---

## 3) Especificaciones de componentes

### Button

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}
// Estados: default, hover, focus, active, disabled, loading
// Accesibilidad: role="button", aria-disabled, focus-visible
```

### Card

```typescript
interface CardProps {
  image?: string;
  title: string;
  excerpt?: string;
  status?: 'draft' | 'active' | 'completed';
  cta?: { text: string; href: string };
  metadata?: { date?: string; author?: string };
}
```

### CalendarSlot

```typescript
interface CalendarSlotProps {
  date: Date;
  time: string;
  status: 'available' | 'selected' | 'booked' | 'disabled';
  onSelect?: () => void;
}
// Accesibilidad: role="button", aria-selected, aria-disabled
```

### FormField

```typescript
interface FormFieldProps {
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
}
// Accesibilidad: aria-describedby, aria-invalid, aria-required
```

---

## 4) Wireframes textuales

### Home (Desktop)

```
[HEADER: Logo | Menú Nav | Toggle Idioma | Botón WhatsApp]
[HERO]
├── Imagen comunitaria full-width (1200x600)
├── Texto overlay: "Construyendo nuestra comunidad juntos"
├── Subtítulo: "Asociación de Desarrollo [Nombre Comunidad]"
└── CTA primario: "Reservar Espacios"
[ACCIONES RÁPIDAS - 3 columnas]
├── [Card: Reservar Espacios | ícono Calendario | "Reservar ahora"]
├── [Card: Proyectos Actuales | ícono Usuarios | "Ver proyectos"]
└── [Card: Contáctanos | ícono WhatsApp | "Contactar"]
[INICIATIVAS ACTUALES - 3 columnas]
├── [Project Card: Imagen + Título + Progreso + "Leer más"]
├── [Project Card: Imagen + Título + Progreso + "Leer más"]
└── [Project Card: Imagen + Título + Progreso + "Leer más"]
[PRÓXIMOS EVENTOS - 2 columnas]
├── [Evento: Badge fecha + Título + "Agregar al calendario"]
└── [Evento: Badge fecha + Título + "Agregar al calendario"]
[MÉTRICAS DE IMPACTO - 4 columnas]
├── [Métrica: Número + Label "Familias beneficiadas"]
├── [Métrica: Número + Label "Voluntarios activos"]
├── [Métrica: Número + Label "Proyectos completados"]
└── [Métrica: Número + Label "Horas de servicio"]
[FOOTER: Info contacto | Redes sociales | Páginas legales]
```

### Home (Mobile)

```
[HEADER: Hamburguesa | Logo | WhatsApp]
[HERO]
├── Imagen comunitaria (375x250)
├── Texto de misión (centrado)
└── Botón CTA primario
[ACCIONES RÁPIDAS - Apiladas]
├── Card Reservar Espacios
├── Card Proyectos Actuales
└── Card Contacto
[INICIATIVAS - Carrusel]
├── Tarjetas de proyecto deslizables
└── Indicador de puntos
[EVENTOS - Lista apilada]
├── Evento 1
└── Evento 2
[MÉTRICAS - Grid 2x2]
├── Familias | Voluntarios
└── Proyectos | Horas
[FOOTER - Colapsado]
```

### Flujo de Reservaciones

```
[PASO 1: Elegir Espacio]
├── Indicador de progreso (1/4)
├── "Selecciona el espacio"
├── [Card: Campo de Fútbol | Imagen + Descripción + "Seleccionar"]
├── [Card: Salón Comunal | Imagen + Descripción + "Seleccionar"]
└── [Card: Área Recreativa | Imagen + Descripción + "Seleccionar"]

[PASO 2: Fecha y Hora]
├── Indicador de progreso (2/4)
├── Widget de calendario (mes actual)
├── Horarios disponibles para la fecha seleccionada
├── Info de reglas y precios (sidebar)
└── [Botón: "Continuar"]

[PASO 3: Datos de Contacto]
├── Indicador de progreso (3/4)
├── Campos: Nombre*, Teléfono*, Email/WhatsApp*
├── Solicitudes especiales (textarea)
└── [Botón: "Revisar reserva"]

[PASO 4: Confirmación]
├── Indicador de progreso (4/4)
├── Resumen de la reserva
├── Checkbox de aceptación de términos*
├── [Botón: "Confirmar reserva"]
└── [Botón: "Volver atrás"]

[PÁGINA DE ÉXITO]
├── Ícono de éxito + "¡Reserva confirmada!"
├── Detalles de la reserva
├── "Revisa tu email para los detalles"
├── [Botón: "Hacer otra reserva"]
└── [Botón: "Volver al inicio"]
```

---

## 5) Copy en español (muestras)

**Home Hero**
- Headline: "Construyendo nuestra comunidad juntos"
- Subhead: "Espacios, proyectos y oportunidades para el desarrollo de [Nombre de la Comunidad]"

**Acciones rápidas**
- "Reservar Espacios"
- "Ver Proyectos"
- "Contactar por WhatsApp"

**Teasers de proyectos**
- Mejoramiento del Parque Central: "Renovación completa del área recreativa con nuevos juegos y zonas verdes para las familias."
- Programa de Capacitación Laboral: "Talleres gratuitos de oficios y emprendimiento para jóvenes y adultos de la comunidad."
- Red de Agua Potable Sector Norte: "Ampliación del sistema de agua potable para beneficiar a 150 familias adicionales."

**CTA de voluntariado**
- Headline: "¿Cómo puedes ayudar?"
- Body: "Tu tiempo, habilidades y experiencia pueden marcar la diferencia. Únete a nuestros voluntarios y sé parte del cambio que queremos ver en nuestra comunidad."
- Button: "Quiero ser voluntario"

**Microcopy del flujo de reservas**
- Elegir espacio: "Selecciona el espacio que deseas reservar"
- Selección de fecha: "Elige fecha y hora disponible"
- Formulario de contacto: "Tus datos de contacto"
- Error de validación: "Por favor completa este campo"
- Éxito: "¡Perfecto! Tu reserva ha sido confirmada. Revisa tu email para más detalles."

---

## 6) Plan técnico de implementación

### Track recomendado: Next.js (Track B — Jamstack)

**Justificación**
- Rendimiento superior para engagement comunitario
- Excelente SEO para contenido público
- Developer experience moderno (valor de portafolio)
- Arquitectura escalable para futuras features
- Hosting costo-efectivo en Vercel/Netlify

### Stack tecnológico

```typescript
// Framework principal
Next.js 14 (App Router)
TypeScript
Tailwind CSS
Framer Motion (animaciones)

// Backend y base de datos
Supabase (PostgreSQL + Auth + Storage)
Prisma ORM
Server Actions para formularios

// Gestión de contenido
Sanity CMS (contenido estructurado)
Next.js Image optimization

// Email y comunicaciones
Resend (emails transaccionales)
Integración con WhatsApp Business API

// Deploy y performance
Vercel (hosting + edge functions)
Cloudinary (optimización de imágenes)
```

### Modelos de datos (Prisma Schema)

```typescript
model Space {
  id          String @id @default(cuid())
  name        String
  description String
  rules       String[]
  capacity    Int
  hourlyRate  Decimal?
  images      String[]
  availability Json // Horario semanal
  reservations Reservation[]
}

model Reservation {
  id        String @id @default(cuid())
  spaceId   String
  space     Space @relation(fields: [spaceId], references: [id])
  startTime DateTime
  endTime   DateTime
  status    ReservationStatus
  requester Json // {name, phone, email, notes}
  createdAt DateTime @default(now())
}

model Project {
  id          String @id @default(cuid())
  title       String
  summary     String
  description String
  status      ProjectStatus
  progress    Int // 0-100
  impact      Json // Array de métricas
  images      String[]
  updates     ProjectUpdate[]
}

model Event {
  id          String @id @default(cuid())
  title       String
  description String
  startDate   DateTime
  endDate     DateTime?
  location    String?
  category    String
  published   Boolean @default(false)
}
```

### Plantillas de email

```typescript
// Confirmación de reserva
const confirmationTemplate = {
  subject: "Confirmación de Reserva - {{spaceName}}",
  body: `
    Hola {{requesterName}},
    Tu reserva ha sido confirmada:
    📅 Fecha: {{date}}
    🕐 Hora: {{startTime}} - {{endTime}}
    📍 Espacio: {{spaceName}}
    Reglas importantes:
    {{#each rules}}
    • {{this}}
    {{/each}}
    Para cancelar o modificar, contacta: {{contactPhone}}
    ¡Gracias por usar nuestros espacios comunitarios!
  `,
  attachments: ['reservation.ics']
}
```

---

## 7) Plan de sprint (dos semanas)

### Semana 1: Fundación y páginas núcleo

**Días 1-2: Setup e infraestructura**
- [ ] Inicialización del proyecto Next.js con TypeScript
- [ ] Configuración de Tailwind CSS y sistema de diseño
- [ ] Setup de proyecto Supabase y schema de base de datos
- [ ] Librería básica de componentes (Button, Card, Layout)

**Días 3-4: Home y navegación**
- [ ] Componente Header con navegación responsive
- [ ] Sección hero y acciones rápidas de Home
- [ ] Componente Footer con info de contacto
- [ ] Implementación responsive mobile-first

**Días 5-7: Páginas de contenido**
- [ ] Listado y páginas de detalle de Proyectos
- [ ] Página de Gobernanza con descargas de documentos
- [ ] Listado de Noticias/Eventos con filtros básicos
- [ ] Página de Contacto con formulario e integración WhatsApp

### Semana 2: Reservaciones y pulido

**Días 8-10: Sistema de reservas**
- [ ] Interfaz de selección de espacio
- [ ] Componente de calendario con disponibilidad
- [ ] Formulario de reserva multi-paso
- [ ] Sistema de confirmación por email

**Días 11-12: Gestión de contenido**
- [ ] Setup de Sanity CMS y schemas
- [ ] Interfaz de administración para actualizar contenido
- [ ] Optimización de imágenes y componentes de galería

**Días 13-14: Testing y deploy**
- [ ] Testing de accesibilidad y cumplimiento WCAG
- [ ] Optimización de performance y auditoría Lighthouse
- [ ] Deploy en Vercel y configuración de dominio
- [ ] Pruebas de aceptación con stakeholders

### Criterios de aceptación del MVP

- [ ] Todas las páginas cargan en menos de 2.5s en móvil
- [ ] El sistema de reservas envía emails de confirmación
- [ ] El contenido es editable vía Sanity CMS
- [ ] El sitio pasa auditoría de accesibilidad WCAG 2.2 AA
- [ ] La integración de WhatsApp funciona en dispositivos móviles
- [ ] Los formularios incluyen validación y manejo de errores apropiado
- [ ] El sitio es completamente responsive en todos los tamaños de dispositivo

---

*Este blueprint es la base del proyecto. Cualquier decisión de arquitectura o diseño debe ser consistente con lo aquí definido, salvo que se documente explícitamente un cambio.*

// Contenido estático sin tabla correspondiente en prisma/schema.prisma.
// Todo lo que sí tiene modelo (Space, Project, Event) ahora se consulta vía
// Prisma directamente en las páginas — ver lib/prisma.ts.

// Horas del día disponibles para reservar (bloques de una hora) — regla de
// negocio de horario de atención, no una tabla.
export const timeSlots: string[] = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

// Resumen del informe financiero — presentado como logros/reinversión
// comunitaria, no como estado de cuentas contable. El desglose de aportes
// municipales, reintegro de Hacienda y donación de CoopeTransasi no fue
// dado de forma individual, así que se agrupan en un solo rubro.
export const financialImpactSummary = {
  period: "Julio 2025 – Mayo 2026",
  totalIncome: 26889415.71,
  items: [
    {
      label: "Alquiler de instalaciones",
      amount: 5899530,
    },
    {
      label: "Fiestas de Verano 2026",
      amount: 15130650,
    },
    {
      label:
        "Aportes municipales, reintegro de Hacienda y donación de CoopeTransasi",
      amount: 5859235.71,
    },
  ],
};

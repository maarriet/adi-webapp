// Lógica de precios del contrato real de alquiler de instalaciones.
// Ver CLAUDE.md para el detalle de cada monto.

export type CateringPackageId = "PERSONS_35" | "PERSONS_50" | "PERSONS_75";

export const SALON_BASE_RATE = 45000; // monto fijo por reserva del Salón Multiusos
export const SALON_FURNITURE_SET_PRICE = 2500; // 1 mesa blanca + 6 sillas

export const EXTRA_ITEM_PRICES = {
  table: 1000,
  chair: 250,
  tablecloth: 1000,
};

export const CATERING_PACKAGES: Record<
  CateringPackageId,
  { label: string; price: number }
> = {
  PERSONS_35: { label: "35 personas", price: 35000 },
  PERSONS_50: { label: "50 personas", price: 55000 },
  PERSONS_75: { label: "75 personas", price: 75000 },
};

export function calculateSalonTotal({
  baseFurnitureSets,
  extraTables,
  extraChairs,
  extraTablecloths,
}: {
  baseFurnitureSets: number;
  extraTables: number;
  extraChairs: number;
  extraTablecloths: number;
}): number {
  return (
    SALON_BASE_RATE +
    baseFurnitureSets * SALON_FURNITURE_SET_PRICE +
    extraTables * EXTRA_ITEM_PRICES.table +
    extraChairs * EXTRA_ITEM_PRICES.chair +
    extraTablecloths * EXTRA_ITEM_PRICES.tablecloth
  );
}

export function calculateCateringTotal({
  packageId,
  extraTables,
  extraChairs,
  extraTablecloths,
}: {
  packageId: CateringPackageId | null;
  extraTables: number;
  extraChairs: number;
  extraTablecloths: number;
}): number {
  if (!packageId) return 0;
  return (
    CATERING_PACKAGES[packageId].price +
    extraTables * EXTRA_ITEM_PRICES.table +
    extraChairs * EXTRA_ITEM_PRICES.chair +
    extraTablecloths * EXTRA_ITEM_PRICES.tablecloth
  );
}

export const NIGHT_CUTOFF_HOUR = 18; // después de las 18:00 = tarifa nocturna (18:00 en punto todavía es diurna)

// Genérica (no específica de un espacio) — hoy solo la usa Cancha de
// Fútbol 11 (Futsal quedó con tarifa fija, sin diferencia día/noche, ver
// `nightRate: null` más abajo). Se decide por la hora de FIN, no la de
// inicio: una reserva que se extiende hasta después de las 18:00 se cobra
// nocturna completa, aunque haya empezado de día (ej. 17:00-19:00 es
// nocturna). El corte es estrictamente "después de", no "desde": una
// reserva que termina exactamente a las 18:00 (ej. 16:00-18:00) todavía es
// diurna — solo es nocturna si termina a las 19:00 o después (con la
// granularidad horaria actual de `timeSlots`).
export function calculateDayNightRate({
  baseRate,
  nightRate,
  endTime,
}: {
  baseRate: number;
  nightRate: number | null; // null = sin diferencia día/noche, siempre baseRate (ej. Futsal)
  endTime: string | null;
}): number {
  if (!endTime || nightRate == null) return baseRate;
  const hour = Number(endTime.split(":")[0]);
  return hour > NIGHT_CUTOFF_HOUR ? nightRate : baseRate;
}

// Esquema de pago en 2 partes: 50% depósito el día de la reserva, 50%
// restante el día del evento. El monto restante se calcula como
// totalAmount - calculateDepositAmount(totalAmount) en el call site (no una
// función aparte), para que ambas mitades sumen siempre exacto al total sin
// arrastre de redondeo.
export function calculateDepositAmount(totalAmount: number): number {
  return Math.round(totalAmount / 2);
}

export function formatColones(amount: number): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(amount);
}

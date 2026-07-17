import type { CateringPackageId } from "@/lib/pricing";

// Forma "segura para cliente" de Space: Prisma devuelve `baseRate` como
// Decimal, que no es serializable al cruzar de Server a Client Component
// como prop — se convierte a `number | null` antes de pasarlo (ver
// app/reservaciones/page.tsx).
export type ReservationSpace = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  baseRate: number | null;
  nightRate: number | null;
  bookable: boolean;
  maxDurationMinutes: number | null;
  images: string[];
};

// Formato costarricense: 8 dígitos, con o sin guion (88888888 u 8888-8888).
export const CONTRACTOR_PHONE_PATTERN = /^\d{4}-?\d{4}$/;

export type MaritalStatus =
  | "SOLTERO"
  | "CASADO"
  | "DIVORCIADO"
  | "VIUDO"
  | "UNION_LIBRE";

export const MARITAL_STATUS_LABELS: Record<string, string> = {
  SOLTERO: "Soltero(a)",
  CASADO: "Casado(a)",
  DIVORCIADO: "Divorciado(a)",
  VIUDO: "Viudo(a)",
  UNION_LIBRE: "Unión libre",
};

// Exclusivo de Cancha de Futsal (se juegan 3 deportes distintos en la misma
// cancha) — informativo, no afecta el precio.
export type Sport = "FUTBOL" | "BASQUETBOL" | "VOLEIBOL";

export const SPORT_LABELS: Record<Sport, string> = {
  FUTBOL: "Fútbol",
  BASQUETBOL: "Básquetbol",
  VOLEIBOL: "Vóleibol",
};

export type ReservationFormState = {
  spaceId: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  baseFurnitureSets: number;
  extraTables: number;
  extraChairs: number;
  extraTablecloths: number;
  cateringPackage: CateringPackageId | null;
  sport: Sport | "";
  contractorName: string;
  contractorIdNumber: string;
  contractorPhone: string;
  contractorProfession: string;
  contractorMaritalStatus: MaritalStatus | "";
  contractorAddress: string;
  activityDescription: string;
  attendeesCount: string;
  termsAccepted: boolean;
};

export const initialReservationFormState: ReservationFormState = {
  spaceId: null,
  date: "",
  startTime: null,
  endTime: null,
  baseFurnitureSets: 0,
  extraTables: 0,
  extraChairs: 0,
  extraTablecloths: 0,
  cateringPackage: null,
  sport: "",
  contractorName: "",
  contractorIdNumber: "",
  contractorPhone: "",
  contractorProfession: "",
  contractorMaritalStatus: "",
  contractorAddress: "",
  activityDescription: "",
  attendeesCount: "",
  termsAccepted: false,
};

export type UpdateField = <K extends keyof ReservationFormState>(
  key: K,
  value: ReservationFormState[K],
) => void;

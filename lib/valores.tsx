// Valores de la ADI — usados en /gobernanza (ícono + nombre + descripción)
// y en Home (solo ícono + nombre). Un solo lugar de verdad: si se edita un
// valor acá, se refleja en ambas páginas. Archivo .tsx (no .ts, como
// lib/mock-data.ts) porque los íconos son JSX de Heroicons.

import {
  EyeIcon,
  UserGroupIcon,
  ScaleIcon,
  HeartIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

export const valores = [
  {
    title: "Transparencia",
    description:
      "Manejo claro y verificable de los recursos e ingresos generados por el alquiler de instalaciones y actividades comunitarias.",
    icon: <EyeIcon className="h-8 w-8" />,
  },
  {
    title: "Responsabilidad compartida",
    description:
      "El bien comunal se cuida entre todos; cada persona que usa nuestras instalaciones es corresponsable de su estado.",
    icon: <UserGroupIcon className="h-8 w-8" />,
  },
  {
    title: "Orden y disciplina",
    description:
      "Reglas claras de convivencia, uso y fiscalización que garantizan que los espacios sirvan a toda la comunidad por igual.",
    icon: <ScaleIcon className="h-8 w-8" />,
  },
  {
    title: "Compromiso comunitario",
    description:
      "Trabajo constante para que cada colón generado se traduzca en beneficio directo para Quebradas y Calle Vargas.",
    icon: <HeartIcon className="h-8 w-8" />,
  },
  {
    title: "Respeto",
    description:
      "Por los vecinos, por las normas de convivencia y por el patrimonio de la comunidad.",
    icon: <HandRaisedIcon className="h-8 w-8" />,
  },
];

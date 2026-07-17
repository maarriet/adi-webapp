"use client";

import type { ReactNode } from "react";
import {
  BuildingOffice2Icon,
  CakeIcon,
  MapIcon,
  TrophyIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import type { ReservationSpace } from "./types";

// Heroicons no tiene íconos literales de balón/canasta — TrophyIcon y
// BoltIcon son la aproximación más cercana disponible en el set ya usado.
const spaceIcons: Record<string, ReactNode> = {
  "salon-multiusos": <BuildingOffice2Icon className="h-8 w-8" />,
  "cocina-comedor": <CakeIcon className="h-8 w-8" />,
  "plaza-deportes": <MapIcon className="h-8 w-8" />,
  "cancha-futbol-11": <TrophyIcon className="h-8 w-8" />,
  "cancha-futsal": <BoltIcon className="h-8 w-8" />,
};

const defaultIcon = <BuildingOffice2Icon className="h-8 w-8" />;

export function StepEspacio({
  spaces,
  value,
  onChange,
}: {
  spaces: ReservationSpace[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  // Defensivo: la página ya trae solo instalaciones con `bookable: true`,
  // pero se filtra de nuevo acá para que el componente sea correcto por sí
  // mismo sin depender de que el caller lo haga bien.
  const bookableSpaces = spaces.filter((space) => space.bookable);

  return (
    <div>
      <h2 className="font-heading text-2xl text-neutral-900">
        Selecciona el espacio que deseas reservar
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {bookableSpaces.map((space) => (
          <button
            key={space.id}
            type="button"
            onClick={() => onChange(space.id)}
            className={`rounded-lg text-left transition-shadow ${
              value === space.id ? "ring-2 ring-primary-blue" : ""
            }`}
          >
            <Card
              image={space.images[0]}
              icon={spaceIcons[space.id] ?? defaultIcon}
              title={space.name}
              excerpt={space.description}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

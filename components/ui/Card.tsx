import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "./Button";

export interface CardProps {
  image?: string;
  icon?: ReactNode;
  title: string;
  excerpt?: string;
  status?: "draft" | "active" | "completed" | "available" | "coming_soon";
  progress?: number;
  showProgress?: boolean;
  cta?: { text: string; href: string };
  metadata?: { date?: string; author?: string };
}

const statusClasses: Record<NonNullable<CardProps["status"]>, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  active: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  available: "bg-success/10 text-success",
  coming_soon: "bg-neutral-100 text-neutral-600",
};

const statusLabels: Record<NonNullable<CardProps["status"]>, string> = {
  draft: "Borrador",
  active: "Activo",
  completed: "Completado",
  available: "Disponible",
  coming_soon: "Próximamente",
};

export function Card({
  image,
  icon,
  title,
  excerpt,
  status,
  progress,
  showProgress = true,
  cta,
  metadata,
}: CardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-neutral-100 bg-white shadow-sm overflow-hidden">
      {image ? (
        <div className="relative h-48 w-full">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      ) : icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-blue/10 text-primary-blue m-6 mb-0">
          {icon}
        </div>
      ) : (
        <div className="h-48 w-full bg-neutral-100" aria-hidden="true" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        {status && (
          <span
            className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
          >
            {statusLabels[status]}
          </span>
        )}

        <h3 className="font-heading text-xl text-neutral-900">{title}</h3>

        {excerpt && <p className="text-sm text-neutral-600">{excerpt}</p>}

        {typeof progress === "number" && showProgress && (
          <div className="flex flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-primary-green"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-neutral-600">
              {progress}% completado
            </span>
          </div>
        )}

        {metadata && (metadata.date || metadata.author) && (
          <div className="flex gap-2 text-xs text-neutral-600">
            {metadata.date && <span>{metadata.date}</span>}
            {metadata.date && metadata.author && <span>·</span>}
            {metadata.author && <span>{metadata.author}</span>}
          </div>
        )}

        {cta && (
          <div className="mt-auto pt-2">
            <Button href={cta.href} variant="ghost" size="sm">
              {cta.text}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

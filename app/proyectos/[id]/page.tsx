import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  COMPLETED: "Completado",
};

function telHref(phone: string) {
  return `tel:+506${phone.replace(/-/g, "")}`;
}

export default async function ProyectoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });

  if (!project) {
    notFound();
  }

  const paragraphs = project.description.split("\n\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/proyectos"
        className="text-sm text-primary-blue hover:underline"
      >
        ← Volver a Proyectos e Impacto
      </Link>

      <span className="mt-6 block w-fit rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-medium text-info">
        {statusLabels[project.status] ?? project.status}
      </span>

      <h1 className="mt-3 font-heading text-3xl text-neutral-900 sm:text-4xl">
        {project.title}
      </h1>

      {project.showProgress && (
        <div className="mt-4 flex flex-col gap-1">
          <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-primary-green"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs text-neutral-600">
            {project.progress}% completado
          </span>
        </div>
      )}

      {project.images.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {project.images.map((src) => (
            <div key={src} className="relative h-56 w-full overflow-hidden rounded-lg">
              <Image src={src} alt={project.title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 text-neutral-800">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {project.contactPhone && (
        <div className="mt-8 rounded-lg border border-neutral-100 bg-neutral-50 p-6">
          <p className="font-heading text-lg text-neutral-900">
            ¿Interesado?
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {project.contactName
              ? `Contacta a ${project.contactName} al `
              : "Contáctanos al "}
            <a
              href={telHref(project.contactPhone)}
              className="font-medium text-primary-blue hover:underline"
            >
              {project.contactPhone}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

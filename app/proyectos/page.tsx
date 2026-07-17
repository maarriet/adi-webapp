import Image from "next/image";
import { Card, type CardProps } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { financialImpactSummary } from "@/lib/mock-data";
import { formatColones } from "@/lib/pricing";

const financialReportImages = [
  {
    src: "/images/reports/Informe_Ingresos.jpg",
    title: "Detalle de ingresos",
    alt: "Infografía con el detalle de ingresos del período",
  },
  {
    src: "/images/reports/Informe_Salidas.jpg",
    title: "Detalle de salidas",
    alt: "Infografía con el detalle de salidas del período",
  },
];

export const dynamic = "force-dynamic";

const spacePricing: Record<string, string> = {
  "salon-multiusos":
    "¢45.000 fijo por evento (sin mobiliario). Mobiliario base ¢2.500/set (1 mesa + 6 sillas). Extras: mesa ¢1.000, silla ¢250, mantel ¢1.000.",
  "cocina-comedor":
    "Paquetes con mobiliario incluido: 35 personas ¢35.000, 50 personas ¢55.000, 75 personas ¢75.000. Mismos extras individuales disponibles.",
};

export default async function ProyectosPage() {
  const [spaces, projects] = await Promise.all([
    prisma.space.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl text-neutral-900 sm:text-4xl">
        Proyectos e Impacto
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Las instalaciones que administramos y lo que hemos logrado gracias a
        su uso responsable.
      </p>

      <section className="mt-12">
        <h2 className="font-heading text-2xl text-neutral-900">
          Nuestras instalaciones
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Card
              key={space.id}
              image={space.images[0]}
              title={space.name}
              excerpt={spacePricing[space.id] ?? space.description}
              status={space.bookable ? "available" : "coming_soon"}
              cta={
                space.bookable
                  ? { text: "Reservar", href: "/reservaciones" }
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-lg bg-neutral-50 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-neutral-900">
          Impacto financiero
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Esto es lo que el uso responsable de nuestras instalaciones y el
          apoyo de la comunidad nos permitió reinvertir entre{" "}
          {financialImpactSummary.period}.
        </p>

        <p className="mt-6 font-heading text-3xl text-primary-blue">
          {formatColones(financialImpactSummary.totalIncome)}
        </p>
        <p className="text-sm text-neutral-600">Ingresos totales del período</p>

        <ul className="mt-6 flex flex-col gap-3">
          {financialImpactSummary.items.map((item) => (
            <li
              key={item.label}
              className="flex items-baseline justify-between gap-4 border-b border-neutral-100 pb-3 text-sm"
            >
              <span className="text-neutral-600">{item.label}</span>
              <span className="whitespace-nowrap font-medium text-neutral-900">
                {formatColones(item.amount)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {financialReportImages.map((report) => (
            <a
              key={report.src}
              href={report.src}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <p className="mb-2 text-sm font-semibold text-neutral-900">
                {report.title}
              </p>
              <div className="overflow-hidden rounded-lg border border-neutral-100 bg-white">
                <Image
                  src={report.src}
                  alt={report.alt}
                  width={853}
                  height={1280}
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-2 text-xs text-primary-blue group-hover:underline">
                Ver en tamaño completo ↗
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-heading text-2xl text-neutral-900">
          Otras iniciativas comunitarias
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              image={project.images[0]}
              title={project.title}
              excerpt={project.summary}
              status={project.status.toLowerCase() as CardProps["status"]}
              progress={project.progress}
              showProgress={project.showProgress}
              cta={{ text: "Leer más", href: `/proyectos/${project.id}` }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

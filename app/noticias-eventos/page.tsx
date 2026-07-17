import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NoticiasEventosPage() {
  const items = await prisma.event.findMany({
    where: { published: true },
    orderBy: { startDate: "asc" },
  });

  const featured = items.find((item) => item.featured);
  const rest = items.filter((item) => !item.featured);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl text-neutral-900 sm:text-4xl">
        Noticias y Eventos
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Actualizaciones, anuncios y celebraciones de la comunidad de
        Quebradas y Calle Vargas.
      </p>

      {featured && (
        <section className="mt-10 overflow-hidden rounded-lg bg-primary-blue text-white">
          <div className="flex flex-col sm:flex-row">
            {featured.imageUrl && (
              <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-64">
                <Image
                  src={featured.imageUrl}
                  alt={featured.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 px-6 py-8 sm:px-10">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium">
                Evento destacado
              </span>
              <h2 className="mt-3 font-heading text-2xl">{featured.title}</h2>
              <p className="mt-2 text-sm text-neutral-100/80">
                {formatDateRange(featured.startDate, featured.endDate)}
                {featured.location && ` · ${featured.location}`}
              </p>
              <p className="mt-3 max-w-2xl text-neutral-100/90">
                {featured.summary ?? featured.description}
              </p>
              <a
                href={`/noticias-eventos/${featured.slug}`}
                className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
              >
                Leer más
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((item) => (
          <Card
            key={item.id}
            image={item.imageUrl ?? undefined}
            title={item.title}
            excerpt={item.summary ?? item.description}
            metadata={{
              date: formatDateRange(item.startDate, item.endDate),
              author: item.type === "NEWS" ? "Noticia" : "Evento",
            }}
            cta={{ text: "Leer más", href: `/noticias-eventos/${item.slug}` }}
          />
        ))}
      </section>
    </div>
  );
}

import { CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Card, type CardProps } from "@/components/ui/Card";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getWhatsappHref, siteConfig } from "@/lib/site-config";
import { prisma } from "@/lib/prisma";
import { valores } from "@/lib/valores";
import { formatDateRange } from "@/lib/format";

// Lee datos en vivo (instalaciones, proyectos, próximo evento) — no
// pre-renderizar estáticamente en build, siempre en cada request.
export const dynamic = "force-dynamic";

const quickActions = [
  {
    title: "Reservar Espacios",
    icon: <CalendarIcon className="h-8 w-8" />,
    cta: { text: "Reservar ahora", href: "/reservaciones" },
  },
  {
    title: "Ver Proyectos",
    icon: <UsersIcon className="h-8 w-8" />,
    cta: { text: "Ver proyectos", href: "/proyectos" },
  },
  {
    title: "Contáctanos",
    icon: <WhatsAppIcon className="h-8 w-8" />,
    cta: { text: "Contactar", href: getWhatsappHref() },
  },
];

const featuredSpacePricing: Record<string, string> = {
  "salon-multiusos": "Desde ¢45.000 por evento",
  "cocina-comedor": "Paquetes desde ¢35.000",
};

export default async function Home() {
  const [spaces, projects, events] = await Promise.all([
    prisma.space.findMany(),
    prisma.project.findMany(),
    prisma.event.findMany({ where: { published: true } }),
  ]);

  const featuredSpaces = spaces.filter(
    (space) => space.bookable && featuredSpacePricing[space.id],
  );
  const nextEvent = events.find((item) => item.featured);

  return (
    <>
      <section className="relative overflow-hidden bg-primary-blue text-white">
        <HeroCarousel />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">
            {siteConfig.lema}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-100/80">
            Asociación de Desarrollo Integral Quebradas-Calle Vargas —
            espacios, proyectos y oportunidades para el desarrollo de la
            comunidad.
          </p>
          <div className="mt-8">
            {/* border/shadow extra: sobre el overlay oscuro del carrusel,
                el bg-primary-blue del botón "primary" casi no se distingue
                del fondo (mismo tono navy) — se agrega separación visual
                sin tocar el variant compartido de Button. */}
            <Button
              href="/reservaciones"
              variant="primary"
              size="lg"
              className="border-2 border-white/70 shadow-lg"
            >
              Reservar Espacios
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-heading text-2xl text-neutral-900">
          Acciones rápidas
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              icon={action.icon}
              title={action.title}
              cta={action.cta}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-heading text-2xl text-neutral-900">
          Instalaciones disponibles
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {featuredSpaces.map((space) => (
            <Card
              key={space.id}
              image={space.images[0]}
              title={space.name}
              excerpt={featuredSpacePricing[space.id]}
              status="available"
              cta={{ text: "Reservar", href: "/reservaciones" }}
            />
          ))}
        </div>
        <div className="mt-4">
          <Button href="/proyectos" variant="ghost" size="sm">
            Ver todas las instalaciones y tarifas
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-heading text-2xl text-neutral-900">
          Iniciativas actuales
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

      {nextEvent && (
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="flex flex-col items-start gap-4 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="rounded-full bg-primary-blue/10 px-2.5 py-0.5 text-xs font-medium text-primary-blue">
                Próximo evento
              </span>
              <p className="mt-2 font-heading text-xl text-neutral-900">
                {nextEvent.title}
              </p>
              <p className="text-sm text-neutral-600">
                {formatDateRange(nextEvent.startDate, nextEvent.endDate)}
                {nextEvent.location && ` · ${nextEvent.location}`}
              </p>
            </div>
            <Button
              href={`/noticias-eventos/${nextEvent.slug}`}
              variant="ghost"
              size="sm"
            >
              Ver más
            </Button>
          </div>
        </section>
      )}

      <section className="bg-neutral-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-heading text-2xl text-neutral-900">
            Nuestros Valores
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {valores.map((valor) => (
              <div key={valor.title} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-blue/10 text-primary-blue">
                  {valor.icon}
                </div>
                <p className="mt-3 font-heading text-base text-neutral-900">
                  {valor.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

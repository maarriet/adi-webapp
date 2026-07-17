import {
  UserGroupIcon,
  HandRaisedIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsappHref, siteConfig } from "@/lib/site-config";

const formasDeParticipar = [
  {
    title: "Asiste a la Asamblea General",
    description:
      "La Asamblea General es la máxima autoridad de la ADI. Participa, entérate de los informes de gestión y ayuda a decidir el rumbo de la comunidad.",
    icon: <UserGroupIcon className="h-8 w-8" />,
  },
  {
    title: "Sé voluntario en nuestros eventos",
    description:
      "Las Fiestas de Verano y otras actividades comunitarias se hacen posibles gracias a vecinos que dan su tiempo. Súmate como voluntario.",
    icon: <HandRaisedIcon className="h-8 w-8" />,
  },
  {
    title: "Reporta mantenimiento",
    description:
      "¿Notaste algo que necesita atención en el Salón, la Cocina/Comedor, la Plaza o las canchas? Avísanos para darle seguimiento.",
    icon: <WrenchScrewdriverIcon className="h-8 w-8" />,
  },
];

export default function InvolucratePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl text-neutral-900 sm:text-4xl">
        Involúcrate
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Quebradas y Calle Vargas se construye entre todos. Así puedes ser
        parte.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {formasDeParticipar.map((forma) => (
          <Card
            key={forma.title}
            icon={forma.icon}
            title={forma.title}
            excerpt={forma.description}
          />
        ))}
      </div>

      <section className="mt-16 rounded-lg bg-primary-blue px-6 py-10 text-center text-white sm:px-12">
        <h2 className="font-heading text-2xl">¿Cómo puedes ayudar?</h2>
        <p className="mx-auto mt-3 max-w-xl text-neutral-100/80">
          Tu tiempo, habilidades y aporte pueden marcar la diferencia. Para
          donaciones o consultas, escríbenos por WhatsApp o envía tu aporte
          por SINPE Móvil al número:
        </p>
        <p className="mt-4 font-heading text-3xl">{siteConfig.sinpeNumber}</p>
        <div className="mt-6 flex justify-center">
          <Button
            href={getWhatsappHref(
              "Hola, quisiera saber cómo puedo colaborar con la ADI.",
            )}
            variant="secondary"
            size="lg"
            icon={<WhatsAppIcon />}
          >
            Escribir por WhatsApp
          </Button>
        </div>
      </section>
    </div>
  );
}

import { PhoneIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { ContactForm } from "@/components/contacto/ContactForm";
import { siteConfig } from "@/lib/site-config";

export default function ContactoPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    siteConfig.address,
  )}&output=embed`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl text-neutral-900 sm:text-4xl">
        Contacto
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Escríbenos, llámanos o visítanos. Con gusto te atendemos.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <PhoneIcon className="h-6 w-6 shrink-0 text-primary-blue" />
              <div>
                <p className="font-medium text-neutral-900">
                  Teléfono / SINPE Móvil
                </p>
                <p className="text-sm text-neutral-600">
                  {siteConfig.sinpeNumber}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-6 w-6 shrink-0 text-primary-blue" />
              <div>
                <p className="font-medium text-neutral-900">Ubicación</p>
                <p className="text-sm text-neutral-600">
                  {siteConfig.address}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="h-6 w-6 shrink-0 text-primary-blue" />
              <div>
                <p className="font-medium text-neutral-900">Horario</p>
                <p className="text-sm text-neutral-600">
                  {siteConfig.officeHours}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-100">
            <iframe
              title="Ubicación de LA ADI en el mapa"
              src={mapSrc}
              className="h-64 w-full sm:h-80"
              loading="lazy"
            />
          </div>
        </div>

        <div>
          <h2 className="font-heading text-xl text-neutral-900">
            Envíanos un mensaje
          </h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

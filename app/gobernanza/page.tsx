import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/lib/site-config";
import { valores } from "@/lib/valores";

export default function GobernanzaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl text-neutral-900 sm:text-4xl">
        Gobernanza
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Cómo administramos los bienes e instalaciones comunales de Quebradas
        y Calle Vargas, con transparencia y responsabilidad compartida.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="font-heading text-xl text-neutral-900">Misión</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Administrar con transparencia y responsabilidad los bienes e
            instalaciones comunales de Quebradas y Calle Vargas, generando
            recursos a través de su alquiler y gestión ordenada, para
            reinvertirlos en el desarrollo integral de la comunidad y el
            bienestar de quienes la habitan.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-xl text-neutral-900">Visión</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Ser una asociación de desarrollo reconocida por la comunidad de
            Tambor, Alajuela, como garante confiable del buen uso y
            mantenimiento de sus espacios comunes, y como motor organizado de
            proyectos que mejoren la calidad de vida de sus vecinos.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-xl text-neutral-900">
            Propósito
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Existimos para que Quebradas y Calle Vargas cuenten con espacios
            dignos, bien administrados y accesibles —el Salón Multiusos, el
            área de Cocina/Comedor, la Plaza de Deportes y las canchas— y
            para que su uso responsable financie el desarrollo continuo de
            la comunidad.
          </p>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-heading text-2xl text-neutral-900">Valores</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {valores.map((valor) => (
            <Card
              key={valor.title}
              icon={valor.icon}
              title={valor.title}
              excerpt={valor.description}
            />
          ))}
        </div>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-heading text-2xl text-neutral-900">
          Historia breve
        </h2>
        <p className="mt-4 text-neutral-600">
          La Asociación de Desarrollo Integral Quebradas-Calle Vargas (ADI)
          es una organización comunal con personería jurídica activa,
          encargada de administrar los bienes e instalaciones de uso público
          de la comunidad. Bajo la Asamblea General como máxima autoridad y
          con el Presidente actuando como Apoderado General, la ADI gestiona
          el alquiler ordenado de sus instalaciones y organiza actividades
          como las Fiestas de Verano, reinvirtiendo lo recaudado en el
          desarrollo de la comunidad.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-heading text-2xl text-neutral-900">
          Estructura de gobierno
        </h2>
        <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Máxima autoridad
            </p>
            <p className="mt-1 font-heading text-lg text-neutral-900">
              Asamblea General
            </p>
          </div>
          <div className="flex items-center justify-center text-2xl text-primary-blue sm:rotate-0">
            →
          </div>
          <div className="flex-1 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
              {siteConfig.legalInfo.presidenteCargo}
            </p>
            <p className="mt-1 font-heading text-lg text-neutral-900">
              {siteConfig.legalInfo.presidente}
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              Según nombramiento en {siteConfig.legalInfo.nombramiento}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-lg bg-neutral-50 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-neutral-900">
          Transparencia
        </h2>
        <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <dt className="text-neutral-600">Cédula de personería jurídica</dt>
          <dd className="text-neutral-900">
            {siteConfig.legalInfo.cedulaJuridica}
          </dd>
          <dt className="text-neutral-600">Folio real (matrícula)</dt>
          <dd className="text-neutral-900">
            {siteConfig.legalInfo.folioReal}
          </dd>
          <dt className="text-neutral-600">Ubicación</dt>
          <dd className="text-neutral-900">{siteConfig.address}</dd>
        </dl>
        <div className="mt-6 rounded-md border border-dashed border-neutral-100 bg-white p-4 text-sm text-neutral-600">
          Actas de Asamblea e informes financieros: próximamente disponibles
          para consulta pública en esta sección.
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-900 text-neutral-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Image
            src="/images/logo.png"
            alt="ADI Quebradas y Calle Vargas"
            width={110}
            height={50}
            className="rounded bg-white p-1"
          />
          <p className="mt-3 text-sm text-neutral-100/80">
            {siteConfig.address}
          </p>
          <p className="mt-1 text-sm text-neutral-100/80">
            {siteConfig.officeHours}
          </p>
          <p className="mt-1 text-sm text-neutral-100/80">{siteConfig.email}</p>
          <p className="mt-3 text-xs text-neutral-100/60">
            Cédula jurídica: {siteConfig.legalInfo.cedulaJuridica}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-100/60">
            Redes sociales
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {siteConfig.socialLinks.map((social) => (
              <li key={social.label}>
                <Link
                  href={social.href}
                  className="text-sm text-neutral-100/80 hover:text-white"
                >
                  {social.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-100/60">
            Legal
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {siteConfig.legalLinks.map((legal) => (
              <li key={legal.label}>
                <Link
                  href={legal.href}
                  className="text-sm text-neutral-100/80 hover:text-white"
                >
                  {legal.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p className="flex-1 text-center text-xs text-neutral-100/60">
            © {new Date().getFullYear()} Asociación de Desarrollo Integral
            Quebradas-Calle Vargas. Todos los derechos reservados.
          </p>
          {/* Acceso discreto al panel interno — no es parte de la
              navegación pública. La ruta ya está protegida con Basic Auth
              vía middleware.ts, así que este link no necesita lógica propia. */}
          <Link
            href="/admin/agenda"
            aria-label="Acceso administrativo"
            title="Acceso administrativo"
            className="shrink-0 text-neutral-100/30 transition-colors hover:text-neutral-100/70"
          >
            <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

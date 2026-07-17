"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsappHref } from "@/lib/site-config";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Reservaciones", href: "/reservaciones" },
  { label: "Proyectos e Impacto", href: "/proyectos" },
  { label: "Gobernanza", href: "/gobernanza" },
  { label: "Involúcrate", href: "/involucrate" },
  { label: "Noticias y Eventos", href: "/noticias-eventos" },
  { label: "Contacto", href: "/contacto" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"ES" | "EN">("ES");

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="ADI Quebradas y Calle Vargas"
            width={88}
            height={40}
            priority
          />
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-neutral-800 hover:text-primary-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex lg:items-center lg:gap-4">
          <button
            type="button"
            onClick={() => setLanguage(language === "ES" ? "EN" : "ES")}
            aria-label="Cambiar idioma"
            className="text-sm font-medium text-neutral-600 hover:text-primary-blue"
          >
            {language === "ES" ? "ES / EN" : "EN / ES"}
          </button>
          <Button
            href={getWhatsappHref()}
            variant="secondary"
            size="sm"
            icon={<WhatsAppIcon />}
          >
            WhatsApp
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <XMarkIcon className="h-7 w-7 text-neutral-900" />
          ) : (
            <Bars3Icon className="h-7 w-7 text-neutral-900" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-neutral-100 bg-white px-4 py-4 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-neutral-800 hover:bg-neutral-50 hover:text-primary-blue"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "ES" ? "EN" : "ES")}
              aria-label="Cambiar idioma"
              className="text-sm font-medium text-neutral-600 hover:text-primary-blue"
            >
              {language === "ES" ? "ES / EN" : "EN / ES"}
            </button>
            <Button
              href={getWhatsappHref()}
              variant="secondary"
              size="sm"
              icon={<WhatsAppIcon />}
            >
              WhatsApp
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

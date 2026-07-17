"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const heroImages = [
  { src: "/images/hero/hero-1.jpg" },
  { src: "/images/hero/hero-2.jpg" },
  { src: "/images/hero/hero-3.jpg" },
];

const ROTATION_MS = 5000;

// Fondo del Hero de Home: fotos reales de la comunidad rotando en
// crossfade, con overlay de degradado azul marino de marca encima para
// que el texto blanco del Hero (título/subtítulo/botón, fuera de este
// componente) siga siendo legible sobre cualquiera de las 3. Puramente
// ambiental — aria-hidden, sin controles de navegación.
export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);
    }, ROTATION_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {heroImages.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image.src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}
      {/* Degradado con el azul marino de marca (--primary-blue: #152a4e →
          rgb(21,42,78)) sobre las fotos. Se usan valores rgba() arbitrarios
          en vez de bg-primary-blue/90: el modificador de opacidad de
          Tailwind no puede combinarse con --primary-blue porque la
          variable CSS guarda un string hex plano, no canales RGB — con
          bg-primary-blue/90 el overlay se renderizaba invisible (opacidad
          0), comprobado en vivo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(21,42,78,0.95)] via-[rgba(21,42,78,0.88)] to-[rgba(21,42,78,0.8)]" />
    </div>
  );
}

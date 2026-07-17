// Constantes de contacto/redes/legales de LA ADI (Asociación de Desarrollo
// Integral Quebradas-Calle Vargas). Redes y links legales siguen siendo
// placeholders hasta tener esas cuentas/páginas reales.

export const siteConfig = {
  name: "ADI Quebradas y Calle Vargas",
  lema: "Una comunidad diferente.",
  whatsappNumber: "50683304351", // SINPE Móvil / teléfono: 8330-4351
  whatsappMessage: "Hola, quisiera más información sobre la asociación.",
  sinpeNumber: "8330-4351",
  email: "contacto@adiquebradascallevargas.org",
  address: "Calle Vargas, Tambor, Alajuela, Costa Rica",
  officeHours: "Lunes a viernes, 8:00 a.m. – 4:00 p.m.",
  socialLinks: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
  ],
  legalLinks: [
    { label: "Aviso de privacidad", href: "#" },
    { label: "Términos y condiciones", href: "#" },
  ],
  legalInfo: {
    cedulaJuridica: "3-002-0566754",
    folioReal: "2-402380-000",
    presidente: "Henry Vargas Arias",
    presidenteCargo: "Presidente y Apoderado General",
    nombramiento:
      "Asamblea General Ordinaria N.° CVIII (28 de junio de 2014)",
  },
};

export function getWhatsappHref(message: string = siteConfig.whatsappMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

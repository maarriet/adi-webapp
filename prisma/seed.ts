// Seed de datos reales de LA ADI. Re-ejecutable: usa upsert por id (Space,
// Project) o por slug (Event), así que correrlo de nuevo no duplica filas.
// Uso: npx prisma db seed

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const spaces = [
  {
    id: "salon-multiusos",
    name: "Salón Multiusos",
    description:
      "Espacio amplio para actividades sociales y comunitarias. Monto fijo de ¢45.000 por evento (sin mobiliario), con mobiliario base y extras opcionales.",
    rules: [] as string[],
    capacity: 100,
    baseRate: 45000,
    bookable: true,
    images: ["/images/spaces/Area_Salon.jpg"] as string[],
    availability: {},
  },
  {
    id: "cocina-comedor",
    name: "Área de Cocina y Comedor",
    description:
      "Espacio equipado para eventos con servicio de alimentación. Precio por paquete según cantidad de personas, mobiliario incluido.",
    rules: [] as string[],
    capacity: 75,
    baseRate: null,
    bookable: true,
    images: ["/images/spaces/Area_Comedor.jpg"] as string[],
    availability: {},
  },
  {
    id: "cancha-futbol-11",
    name: "Cancha de Fútbol 11",
    description:
      "Cancha reglamentaria de fútbol 11. ¢25.000 en horario diurno (antes de las 6:00 p.m.), ¢35.000 en horario nocturno. Máximo 2 horas por reserva.",
    rules: [] as string[],
    capacity: 200,
    baseRate: 25000, // diurno
    nightRate: 35000, // nocturno (18:00+)
    bookable: true,
    maxDurationMinutes: 120,
    images: ["/images/spaces/Plaza_fut11.jpg"] as string[],
    availability: {},
  },
  {
    id: "cancha-futsal",
    name: "Cancha de Futsal",
    description:
      "Cancha techada de futsal, también habilitada para básquetbol y vóleibol. ¢10.000 por hora, mismo precio día o noche.",
    rules: [] as string[],
    capacity: 80,
    baseRate: 10000,
    nightRate: null, // ya no aplica tarifa nocturna
    bookable: true,
    maxDurationMinutes: 60,
    images: ["/images/spaces/Cancha_Futsal.jpg"] as string[],
    availability: {},
  },
];

// "Plaza de Deportes" se eliminó (era el mismo lugar físico que Cancha de
// Fútbol 11, que ya tiene su propia tarjeta con precio real) — confirmado
// sin reservas asociadas antes de borrar la fila. Ver CLAUDE.md.

const projects = [
  {
    id: "comite-lote-adi",
    title:
      "Creación de comité para el aprovechamiento del lote adyacente a la Iglesia",
    summary:
      "Nuevo comité formado para planificar el desarrollo del lote junto a la iglesia: anfiteatro, área de juegos infantiles, cancha multiusos y parqueo.",
    description:
      "Nuevo comité formado para planificar el desarrollo del lote junto a la iglesia: anfiteatro, área de juegos infantiles, cancha multiusos y parqueo. El proyecto contempla un anfiteatro, área de juegos infantiles, cancha multiusos y zona de parqueo, según el render aprobado.",
    status: "ACTIVE" as const,
    // TODO: ajustar con el avance real — el comité recién se está formando.
    progress: 10,
    showProgress: true,
    contactName: "Marco Arrieta",
    contactPhone: "6022-4167",
    impact: {},
    images: [
      "/images/initiatives/Iniciativa_LoteADI_1.jpg",
      "/images/initiatives/Iniciativa_LoteADI_2.jpg",
    ] as string[],
  },
  {
    id: "taekwondo-13-anos",
    title: "13 años formando campeones — Academia de Taekwondo INCA",
    summary:
      "La Academia INCA Quebradas celebra 13 años regalando 13 mensualidades gratis a personas de la comunidad que quieran iniciarse en el Taekwondo.",
    description:
      "¡13 AÑOS FORMANDO CAMPEONES! La Academia de Taekwondo INCA está de aniversario, y quiere celebrarlo con toda la comunidad. Por sus 13 años de trayectoria formando campeones dentro y fuera del dojang, estarán regalando 13 mensualidades gratis (un mes de clases sin costo) a 13 personas de Quebradas y Calle Vargas que quieran iniciarse en el mundo del Taekwondo.\n\nValores de la academia: Disciplina, Respeto, Perseverancia, Pasión.\n\nSi querés vos o alguien de tu familia formar parte de esta gran familia del Taekwondo, ¡esta es tu oportunidad! Escribí al coach Brian Alvarado, Cinturón Negro 5to Dan, al 8708-0816 para participar.\n\n¡Gracias por 13 años de historia, y mil razones para seguir creciendo juntos!",
    status: "ACTIVE" as const,
    progress: 0,
    showProgress: false, // es una promoción, no tiene avance %
    contactName: "Coach Brian Alvarado (Cinturón Negro 5to Dan)",
    contactPhone: "8708-0816",
    impact: {},
    images: ["/images/initiatives/Iniciativa_Taekwondo.jpg"] as string[],
  },
  {
    id: "concurso-mantenimiento-salon",
    title:
      "Concurso abierto: cotizaciones de mantenimiento del Salón Comunal y Cocina",
    summary:
      "La ADI abre convocatoria para recibir cotizaciones de remodelación y mantenimiento del salón comunal: baños de cocina, pintura, cambio de piso y más.",
    description:
      "La Asociación de Desarrollo Integral Quebradas-Calle Vargas abre un concurso para recibir cotizaciones de trabajos de remodelación y mantenimiento del salón comunal.\n\nLos trabajos incluyen: cielo raso e instalación de PVC en baños de cocina, forrado y enchape de paredes, cambio de servicios sanitarios/orinales/lavamanos, cambio de piso, ventilación, luz de emergencia en el gimnasio, pintura de cocina y comedor, y remodelación de la cocina interior (pila, fogón, mueble grande).\n\nProveedores interesados pueden contactar a la ADI para solicitar el documento completo con medidas y especificaciones técnicas.",
    status: "ACTIVE" as const,
    progress: 0,
    showProgress: false, // es una convocatoria, no un avance %
    contactPhone: "8330-4351", // número de la ADI (SINPE, ya usado en Contacto)
    impact: {},
    images: ["/images/initiatives/Iniciativa_Mantenimiento.jpg"] as string[],
  },
];

// Las 3 iniciativas mock del blueprint original (parque-central,
// capacitacion-laboral, agua-potable-norte) se reemplazaron por las
// reales de arriba — ver limpieza explícita en la ejecución del seed.

const events = [
  {
    slug: "fiestas-de-verano-2026",
    type: "EVENT" as const,
    title: "Fiestas de Verano 2026",
    description:
      "Nuestra celebración comunitaria anual, con actividades para toda la familia. Lo recaudado se reinvierte directamente en el mantenimiento y mejora de las instalaciones de Quebradas y Calle Vargas.",
    startDate: new Date("2026-04-10"),
    endDate: new Date("2026-04-20"),
    location: "Plaza de Deportes",
    category: "Celebración comunitaria",
    featured: true,
    published: true,
    imageUrl: "/images/news/Noticia_FiestasVerano.jpeg",
  },
  {
    slug: "mantenimiento-salon-multiusos",
    type: "NEWS" as const,
    title: "Mantenimiento preventivo del Salón Multiusos",
    description:
      "La ADI realizó labores de mantenimiento preventivo en el Salón Multiusos para asegurar que siga disponible en las mejores condiciones para la comunidad.",
    startDate: new Date("2026-05-10"),
    location: null,
    category: "Instalaciones",
    featured: false,
    published: true,
    imageUrl: "/images/news/Noticias_mantenimientos.jpg",
  },
  {
    slug: "asamblea-general-ordinaria",
    type: "NEWS" as const,
    title: "Resumen: Asamblea General Ordinaria 2026",
    summary:
      "La ADI celebró su Asamblea General Ordinaria el 19 de junio, con informes de Presidencia, Tesorería y Fiscalía, elección de nueva Junta Directiva, y aprobación del Plan de Trabajo Bienal 2025-2026.",
    description:
      "El sábado 19 de junio de 2026 se realizó la Asamblea General Ordinaria de la ADI Quebradas y Calle Vargas en el Salón Comunal, con la participación de los afiliados y la presencia de representantes de DINADECO, la Municipalidad de Alajuela y la Unión Cantonal.\n\nDurante la asamblea se presentaron los informes de Presidencia (Henry Vargas Arias), Tesorería (Yajaira Picado Paniagua) y Fiscalía (Vanessa Ávila Núñez), y se realizó la elección de la nueva Junta Directiva y Fiscalía para el nuevo período.\n\nSe discutió y aprobó el Plan de Trabajo Bienal 2025-2026, que contempla mejoras en la infraestructura comunal, mantenimiento de caminos y acueductos, programas de desarrollo social, construcción de aceras, cordón y caño, y desarrollo de proyectos productivos, financiado con apoyo de DINADECO, la Municipalidad de Alajuela y fondos propios de la ADI.\n\nComo proyecto socio-productivo destacado, se aprobó la adquisición de mobiliario y equipo de cocina para el Salón Comunal (420 sillas plegables, 71 mesas, y equipo de cocina industrial), con el apoyo de DINADECO, la Municipalidad, la Unión Cantonal y fondos propios.\n\nTambién se presentó la iniciativa de crear un comité para el aprovechamiento del lote adyacente a la Iglesia, que ya está en marcha (ver sección de Proyectos e Impacto).\n\nLa ADI agradece a todos los afiliados por su asistencia, participación y aportes durante la asamblea.",
    startDate: new Date("2026-06-19"),
    location: "Salón Comunal",
    category: "Gobernanza",
    featured: false,
    published: true,
    imageUrl: "/images/news/Noticia_Asamblea.jpeg",
  },
];

async function main() {
  for (const space of spaces) {
    await prisma.space.upsert({
      where: { id: space.id },
      update: space,
      create: space,
    });
  }
  console.log(`Seeded ${spaces.length} spaces.`);

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: project,
      create: project,
    });
  }
  console.log(`Seeded ${projects.length} projects.`);

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }
  console.log(`Seeded ${events.length} events.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

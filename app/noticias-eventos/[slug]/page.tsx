import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NoticiaEventoDetallePage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await prisma.event.findUnique({
    where: { slug: params.slug },
  });

  if (!item || !item.published) {
    notFound();
  }

  const paragraphs = item.description.split("\n\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/noticias-eventos"
        className="text-sm text-primary-blue hover:underline"
      >
        ← Volver a Noticias y Eventos
      </Link>

      <span className="mt-6 block w-fit rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
        {item.type === "NEWS" ? "Noticia" : "Evento"} · {item.category}
      </span>

      <h1 className="mt-3 font-heading text-3xl text-neutral-900 sm:text-4xl">
        {item.title}
      </h1>

      <p className="mt-3 text-sm text-neutral-600">
        {formatDateRange(item.startDate, item.endDate)}
        {item.location && ` · ${item.location}`}
      </p>

      {item.imageUrl ? (
        <div className="relative mt-6 h-64 w-full overflow-hidden rounded-lg">
          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
        </div>
      ) : (
        <div className="mt-6 h-64 w-full rounded-lg bg-neutral-100" aria-hidden="true" />
      )}

      <div className="mt-6 flex flex-col gap-4 text-neutral-800">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

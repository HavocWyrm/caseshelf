import { notFound } from "next/navigation";
import { getShowById } from "@/actions/pages/showDetails";
import { getFormats } from "@/actions/attributes/format";
import { getMediaGenres } from "@/actions/attributes/genre";
import ShowDetailClient from "@/components/detail/ShowDetailClient";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ShowDetailPage({ params }: Props) {
    const { id } = await params;
    const [item, formats, genres] = await Promise.all([
        getShowById(Number(id)),
        getFormats(),
        getMediaGenres(),
    ]);

    if (!item) notFound();

    return <ShowDetailClient item={item} formats={formats} genres={genres} />;
}
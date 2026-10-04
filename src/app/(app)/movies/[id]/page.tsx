import { notFound } from "next/navigation";
import { getMovieById } from "@/actions/pages/movieDetails";
import { getFormats } from "@/actions/attributes/format";
import MovieDetailClient from "@/components/detail/MovieDetailClient";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function MovieDetailPage({ params }: Props) {
    const { id } = await params;
    const [item, formats] = await Promise.all([
        getMovieById(Number(id)),
        getFormats(),
    ]);

    if (!item) notFound();

    return <MovieDetailClient item={item} formats={formats} />;
}
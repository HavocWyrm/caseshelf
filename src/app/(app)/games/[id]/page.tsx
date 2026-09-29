import { notFound } from "next/navigation";
import { getGameById } from "@/actions/pages/gameDetails";
import { getPlatforms } from "@/actions/attributes/platform";
import { getGameGenres } from "@/actions/attributes/genre";
import GameDetailClient from "@/components/detail/GameDetailClient";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function GameDetailPage({ params }: Props) {
    const { id } = await params;
    const [item, platforms, genres] = await Promise.all([
        getGameById(Number(id)),
        getPlatforms(),
        getGameGenres(),
    ]);

    if (!item) notFound();

    return <GameDetailClient item={item} platforms={platforms} genres={genres} />
}
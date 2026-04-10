import { notFound } from "next/navigation";
import { getGameById } from "@/actions/pages/gameDetails";
import { getPlatforms } from "@/actions/attributes/platform";
import GameDetailClient from "@/components/detail/GameDetailClient";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function GameDetailPage({ params }: Props) {
    const { id } = await params;
    const [item, platforms] = await Promise.all([
        getGameById(Number(id)),
        getPlatforms(),
    ]);

    if (!item) notFound();

    return <GameDetailClient item={item} platforms={platforms} />;
}
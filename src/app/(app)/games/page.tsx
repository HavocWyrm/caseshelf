import { getGames } from "@/actions/pages/game";
import { getPlatforms } from "@/actions/attributes/platform";
import { getFranchisesForType } from "@/actions/attributes/franchise";
import GamesClient from "@/components/collection/GamesClient";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
    const [games, platforms, franchises] = await Promise.all([
        getGames(),
        getPlatforms(),
        getFranchisesForType("game"),
    ]);

    return <GamesClient games={games} platforms={platforms} franchises={franchises} />;
}
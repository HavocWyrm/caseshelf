import { getGames } from "@/actions/game";
import { getPlatforms } from "@/actions/platform";
import { getFranchisesForType } from "@/actions/franchise";
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
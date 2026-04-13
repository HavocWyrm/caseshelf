import { getWantedGames, getWantedMovies, getWantedShows } from "@/actions/pages/wanted";
import { getPlatforms } from "@/actions/attributes/platform";
import { getFormats } from "@/actions/attributes/format";
import WantedClient from "@/components/wanted/WantedClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function WantedPage() {
    const [games, movies, shows, platforms, formats] = await Promise.all([
        getWantedGames(),
        getWantedMovies(),
        getWantedShows(),
        getPlatforms(),
        getFormats(),
    ]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WantedClient
                games={games}
                movies={movies}
                shows={shows}
                platforms={platforms}
                formats={formats}
            />
        </Suspense>
    );
}
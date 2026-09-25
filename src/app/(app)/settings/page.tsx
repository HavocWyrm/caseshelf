import { Suspense } from "react";
import {
    getPlatformsWithStatus,
    getFormatsWithStatus,
    getGameGenresByPriority,
    getMediaGenresByPriority,
} from "@/actions/pages/settings";
import SettingsClient from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const [platforms, formats, gameGenres, mediaGenres] = await Promise.all([
        getPlatformsWithStatus(),
        getFormatsWithStatus(),
        getGameGenresByPriority(),
        getMediaGenresByPriority(),
    ]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SettingsClient
                platforms={platforms}
                formats={formats}
                gameGenres={gameGenres}
                mediaGenres={mediaGenres}
            />
        </Suspense>
    );
}

import { Suspense } from "react";
import {
    getPlatformsWithStatus,
    getFormatsWithStatus,
    getGenresByPriority,
} from "@/actions/pages/settings";
import { getProviderStatuses } from "@/lib/providerSetting";
import { getJobOverviews } from "@/actions/pages/job";
import SettingsClient from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const [platforms, formats, gameGenres, movieGenres, showGenres, providerStatuses, jobOverview] = await Promise.all([
        getPlatformsWithStatus(),
        getFormatsWithStatus(),
        getGenresByPriority("game"),
        getGenresByPriority("movie"),
        getGenresByPriority("show"),
        getProviderStatuses(),
        getJobOverviews(),
    ]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SettingsClient
                platforms={platforms}
                formats={formats}
                gameGenres={gameGenres}
                movieGenres={movieGenres}
                showGenres={showGenres}
                providerStatuses={providerStatuses}
                jobs={jobOverview.jobs}
                staleDays={jobOverview.staleDays}
            />
        </Suspense>
    );
}

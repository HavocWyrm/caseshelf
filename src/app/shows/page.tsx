import { getShows } from "@/actions/show";
import { getFormats } from "@/actions/format";
import { getFranchisesForType } from "@/actions/franchise";
import ShowsClient from "@/components/collection/ShowsClient";

export const dynamic = "force-dynamic";

export default async function ShowsPage() {
    const [shows, formats, franchises] = await Promise.all([
        getShows(),
        getFormats(),
        getFranchisesForType("show"),
    ]);

    return <ShowsClient shows={shows} formats={formats} franchises={franchises} />;
}
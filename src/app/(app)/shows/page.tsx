import { getShows } from "@/actions/pages/show";
import { getFormats } from "@/actions/attributes/format";
import { getFranchisesForType } from "@/actions/attributes/franchise";
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
import { getMovies } from "@/actions/pages/movie";
import { getFormats } from "@/actions/attributes/format";
import { getFranchisesForType } from "@/actions/attributes/franchise";
import MoviesClient from "@/components/collection/MoviesClient";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
    const [movies, formats, franchises] = await Promise.all([
        getMovies(),
        getFormats(),
        getFranchisesForType("movie"),
    ]);

    return <MoviesClient movies={movies} formats={formats} franchises={franchises} />;
}
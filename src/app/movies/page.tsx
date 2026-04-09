import { getMovies } from "@/actions/movie";
import { getFormats } from "@/actions/format";
import { getFranchisesForType } from "@/actions/franchise";
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
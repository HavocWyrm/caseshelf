import { GenreSelection, ItemGenre } from "@/types/item";

export const NO_GENRES: GenreSelection = { ids: [], primaryId: null };

export function selectionFromGenres(genres: ItemGenre[]): GenreSelection {
    return {
        ids: genres.map((genre) => genre.id),
        primaryId: genres.find((genre) => genre.is_primary)?.id ?? null,
    };
}

export function addGenre(selection: GenreSelection, id: number): GenreSelection {
    if (selection.ids.includes(id)) return selection;
    return { ids: [...selection.ids, id], primaryId: selection.primaryId ?? id };
}

export function removeGenre(selection: GenreSelection, id: number): GenreSelection {
    const ids = selection.ids.filter((selected) => selected !== id);
    return { ids, primaryId: selection.primaryId === id ? ids[0] ?? null : selection.primaryId };
}

export function makePrimary(selection: GenreSelection, id: number): GenreSelection {
    return selection.ids.includes(id) ? { ...selection, primaryId: id } : selection;
}

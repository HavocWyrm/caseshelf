"use client";
import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { getGenres } from "@/actions/attributes/genre";
import { addGenre, makePrimary, removeGenre } from "@/lib/helpers/genreSelection";
import { Genre, GenreSelection, ItemType } from "@/types/item";
import formStyles from "@/styles/form.module.css";

type Props = {
    id?: string;
    mediaType: ItemType;
    value: GenreSelection;
    onChange: (value: GenreSelection) => void;
};

export default function GenreSelect({ id, mediaType, value, onChange }: Props) {
    const [options, setOptions] = useState<Genre[]>([]);
    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        getGenres(mediaType).then(setOptions);
    }, [mediaType]);

    const names = new Map(options.map((genre) => [genre.id, genre.name]));
    const search = query.trim().toLowerCase();
    const matches = options.filter(
        (genre) => !value.ids.includes(genre.id) && genre.name.toLowerCase().includes(search)
    );

    const handleSelect = (id: number) => {
        onChange(addGenre(value, id));
        setQuery("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // Keep Enter from submitting the surrounding form.
            e.preventDefault();
            if (matches.length > 0) handleSelect(matches[0].id);
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    return (
        <div className={formStyles.genreSelect}>
            {value.ids.length > 0 && (
                <ul className={formStyles.chips}>
                    {value.ids.map((id) => {
                        const name = names.get(id) ?? "…";
                        const isPrimary = id === value.primaryId;
                        return (
                            <li key={id} className={`${formStyles.chip} ${isPrimary ? formStyles.chipPrimary : ""}`}>
                                <button
                                    type="button"
                                    className={formStyles.chipButton}
                                    onClick={() => onChange(makePrimary(value, id))}
                                    aria-pressed={isPrimary}
                                    title={isPrimary ? "Primary genre" : "Make primary"}
                                >
                                    <Star size={12} fill={isPrimary ? "currentColor" : "none"} />
                                </button>
                                {name}
                                <button
                                    type="button"
                                    className={formStyles.chipButton}
                                    onClick={() => onChange(removeGenre(value, id))}
                                    aria-label={`Remove ${name}`}
                                >
                                    <X size={12} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
            <div className={formStyles.wrapper}>
                <input
                    id={id}
                    className={formStyles.input}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setShowSuggestions(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.ids.length > 0 ? "Add another genre..." : "Search genres..."}
                    autoComplete="off"
                />
                {showSuggestions && matches.length > 0 && (
                    <ul className={formStyles.suggestions}>
                        {matches.map((genre) => (
                            <li
                                key={genre.id}
                                className={formStyles.suggestion}
                                // Prevent the blur so the list stays open for picking several genres.
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(genre.id);
                                }}
                            >
                                {genre.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { searchFranchises } from "@/actions/franchise";
import formStyles from "@/styles/form.module.css";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function FranchiseInput({ value, onChange }: Props) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!value.trim()) {
            setSuggestions([]);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            const results = await searchFranchises(value);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [value]);

    const handleSelect = (name: string) => {
        onChange(name);
        setShowSuggestions(false);
    };

    return (
        <div className={formStyles.wrapper}>
            <input
                className={formStyles.input}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. Star Wars"
                autoComplete="off"
            />
            {showSuggestions && (
                <ul className={formStyles.suggestions}>
                    {suggestions.map((name) => (
                        <li
                            key={name}
                            className={formStyles.suggestion}
                            onMouseDown={() => handleSelect(name)}
                        >
                            {name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
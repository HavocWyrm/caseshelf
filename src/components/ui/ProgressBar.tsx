"use client";

import { useEffect, useState } from "react";

type ProgressBarProps = {
    itemType: string;
};

export default function ProgressBar({ itemType }: ProgressBarProps) {
    const [percentComplete, setPercentComplete] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPercent() {
            setLoading(true);
            try {
                const res = await fetch(`/api/owned-percentage?itemType=${itemType}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setPercentComplete(data.percentComplete);
            } catch {
                setPercentComplete(0);
            } finally {
                setLoading(false);
            }
        }

        fetchPercent();
    }, [itemType]);

    if (loading) return <div>Loading progress...</div>;

    return (
        <div className="progress-bar group">
            <div className="progress-bar-fill" style={{ width: `${percentComplete}%` }} />
            <div className="progress-bar-text">{percentComplete}%</div>
        </div>
    );
}
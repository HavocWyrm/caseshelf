"use client";
import { MetadataPreview } from "@/types/metadata";
import styles from "@/styles/metadata.module.css";

const PROVIDER_NAME = { tmdb: "TMDB", igdb: "IGDB" } as const;

type Props = {
    preview: MetadataPreview | null;
    isLoading: boolean;
    onChangeMatch: () => void;
    onManual: () => void;
};

export default function MatchBanner({ preview, isLoading, onChangeMatch, onManual }: Props) {
    return (
        <div className={styles.banner}>
            <span>
                {isLoading || !preview
                    ? "Loading details…"
                    : <>Filled from {PROVIDER_NAME[preview.provider]}. Fields you change are locked against refreshes.</>}
            </span>
            <span className={styles.bannerActions}>
                <button type="button" className={styles.linkButton} onClick={onChangeMatch}>Change match</button>
                <button type="button" className={styles.linkButton} onClick={onManual}>Enter manually</button>
            </span>
        </div>
    );
}

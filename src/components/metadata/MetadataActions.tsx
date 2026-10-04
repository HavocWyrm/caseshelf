"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Link2 } from "lucide-react";
import { refreshMetadata, rematchItem } from "@/actions/pages/metadata";
import ProviderSearch from "@/components/metadata/ProviderSearch";
import { ItemType } from "@/types/item";
import { ItemMetadataState, MetadataSearchResult } from "@/types/metadata";
import modalStyles from "@/styles/modal.module.css";
import styles from "@/styles/metadata.module.css";

type Props = {
    itemId: number;
    mediaType: ItemType;
    title: string;
    platformId?: number;
    metadata: ItemMetadataState;
};

export default function MetadataActions({ itemId, mediaType, title, platformId, metadata }: Props) {
    const router = useRouter();
    const [isBusy, setIsBusy] = useState(false);
    const [isRematching, setIsRematching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async (action: () => ReturnType<typeof refreshMetadata>) => {
        setIsBusy(true);
        setError(null);
        const result = await action();
        setIsBusy(false);
        if (result.ok) {
            setIsRematching(false);
            router.refresh();
        } else {
            setError(result.message);
        }
    };

    return (
        <>
            <div className={styles.metadataActions}>
                {metadata.provider_id && (
                    <button type="button" className="btn-outline" onClick={() => run(() => refreshMetadata(itemId))} disabled={isBusy}>
                        <RefreshCw size={14} aria-hidden /> Refresh metadata
                    </button>
                )}
                <button type="button" className="btn-outline" onClick={() => setIsRematching(true)} disabled={isBusy}>
                    <Link2 size={14} aria-hidden /> {metadata.provider_id ? "Re-match" : "Match"}
                </button>
            </div>
            {error && !isRematching && <p className={styles.actionError} role="alert">{error}</p>}

            {isRematching && (
                <div className={modalStyles.overlay} onClick={() => setIsRematching(false)}>
                    <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={modalStyles.modalHeader}>
                            <h2 className={modalStyles.modalTitle}>{metadata.provider_id ? "Re-match" : "Match"} “{title}”</h2>
                            <button className={modalStyles.closeButton} onClick={() => setIsRematching(false)}>✕</button>
                        </div>
                        <p className={styles.searchStatus}>
                            Choose the correct record. Locked fields keep their values.
                        </p>
                        <ProviderSearch
                            mediaType={mediaType}
                            platformId={platformId}
                            initialQuery={title}
                            onSelect={(result: MetadataSearchResult) => run(() => rematchItem(itemId, result.provider_id))}
                        />
                        {isBusy && <p className={styles.searchStatus}>Applying…</p>}
                        {error && <p className={styles.searchError} role="alert">{error}</p>}
                    </div>
                </div>
            )}
        </>
    );
}

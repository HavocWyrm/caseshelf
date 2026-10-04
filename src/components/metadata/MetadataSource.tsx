import { ItemMetadataState } from "@/types/metadata";
import styles from "@/styles/metadata.module.css";

const PROVIDER_NAME = { tmdb: "TMDB", igdb: "IGDB" } as const;

export default function MetadataSource({ metadata }: { metadata: ItemMetadataState }) {
    if (!metadata.provider) return null;
    const updated = metadata.metadata_fetched_at?.slice(0, 10);
    return (
        <p className={styles.metadataSource}>
            Metadata from {PROVIDER_NAME[metadata.provider]}
            {updated && <> · updated {updated}</>}
        </p>
    );
}

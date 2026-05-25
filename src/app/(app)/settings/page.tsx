import { getPlatformsWithStatus, getFormatsWithStatus, togglePlatform, toggleFormat } from "@/actions/pages/settings";
import ToggleList from "@/components/settings/ToggleList";
import styles from "@/styles/settings.module.css";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const [platforms, formats] = await Promise.all([
        getPlatformsWithStatus(),
        getFormatsWithStatus(),
    ]);

    return (
        <div className={styles.page}>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Platforms</h2>
                <p className={styles.sectionDescription}>
                    Select the platforms you want to track. Disabled platforms will not appear in the game form dropdown.
                </p>
                <ToggleList
                    items={platforms}
                    onToggle={togglePlatform}
                    warning="Disabling a platform will not remove existing games — it only prevents new games from using it."
                />
            </section>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Formats</h2>
                <p className={styles.sectionDescription}>
                    Select the formats you want to track. Disabled formats will not appear in the movie or show form dropdown.
                </p>
                <ToggleList
                    items={formats}
                    onToggle={toggleFormat}
                    warning="Disabling a format will not remove existing items — it only prevents new items from using it."
                />
            </section>
        </div>
    );
}
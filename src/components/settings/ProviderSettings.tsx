"use client";
import { useState } from "react";
import Image from "next/image";
import { clearProviderSettings, saveProviderSettings, testProviderConnection } from "@/actions/pages/settings";
import { ConnectionTestResult, Provider, ProviderSettingKey, ProviderStatuses } from "@/types/setting";
import styles from "@/styles/settings.module.css";
import formStyles from "@/styles/form.module.css";

type ProviderConfig = {
    provider: Provider;
    title: string;
    description: string;
    fields: { key: ProviderSettingKey; label: string }[];
};

const PROVIDERS: ProviderConfig[] = [
    {
        provider: "tmdb",
        title: "TMDB",
        description: "Movie and TV metadata. Use the API Read Access Token from your TMDB account's API settings.",
        fields: [{ key: "tmdb_read_access_token", label: "API Read Access Token" }],
    },
    {
        provider: "igdb",
        title: "IGDB (Twitch)",
        description: "Game metadata. Use the Client ID and Client Secret of an application registered in the Twitch developer console.",
        fields: [
            { key: "igdb_client_id", label: "Client ID" },
            { key: "igdb_client_secret", label: "Client Secret" },
        ],
    },
];

type Props = {
    statuses: ProviderStatuses;
};

export default function ProviderSettings({ statuses: initialStatuses }: Props) {
    const [statuses, setStatuses] = useState(initialStatuses);

    return (
        <>
            {PROVIDERS.map((config) => (
                <ProviderCard
                    key={config.provider}
                    config={config}
                    status={statuses[config.provider]}
                    onStatusesChange={setStatuses}
                />
            ))}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Attribution</h2>
                <div className={styles.attribution}>
                    <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className={styles.attributionLogo}>
                        <Image src="/providerLogos/tmdbLogo.svg" alt="The Movie Database (TMDB)" width={120} height={16} />
                    </a>
                    <p className={styles.sectionDescription}>
                        This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </p>
                </div>
                <div className={styles.attribution}>
                    <a href="https://www.igdb.com" target="_blank" rel="noopener noreferrer" className={`${styles.attributionLogo} ${styles.igdbLogo}`}>
                        <Image src="/providerLogos/igdbLogo.svg" alt="IGDB" width={57} height={28} />
                    </a>
                    <p className={styles.sectionDescription}>
                        Game data provided by <a href="https://www.igdb.com" target="_blank" rel="noopener noreferrer" className={styles.attributionLink}>IGDB.com</a>.
                    </p>
                </div>
            </section>
        </>
    );
}

type CardProps = {
    config: ProviderConfig;
    status: ProviderStatuses[Provider];
    onStatusesChange: (statuses: ProviderStatuses) => void;
};

function ProviderCard({ config, status, onStatusesChange }: CardProps) {
    const emptyValues = () => Object.fromEntries(config.fields.map((field) => [field.key, ""]));
    const [values, setValues] = useState<Record<string, string>>(emptyValues);
    const [isBusy, setIsBusy] = useState(false);
    const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

    const hasInput = Object.values(values).some((value) => value.trim());
    const canTest = config.fields.every((field) => values[field.key].trim() || status.masked[field.key]);

    const handleSave = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsBusy(true);
        try {
            onStatusesChange(await saveProviderSettings(config.provider, values));
            setValues(emptyValues());
            setTestResult(null);
        } finally {
            setIsBusy(false);
        }
    };

    const handleClear = async () => {
        if (!window.confirm(`Remove the saved ${config.title} credentials?`)) return;
        setIsBusy(true);
        try {
            onStatusesChange(await clearProviderSettings(config.provider));
            setTestResult(null);
        } finally {
            setIsBusy(false);
        }
    };

    const handleTest = async () => {
        setIsBusy(true);
        try {
            setTestResult(await testProviderConnection(config.provider, values));
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.providerHeader}>
                <h2 className={styles.sectionTitle}>{config.title}</h2>
                <span className={`${styles.statusBadge} ${status.configured ? styles.statusConfigured : styles.statusMissing}`}>
                    {status.configured ? "Configured" : "Not configured"}
                </span>
            </div>
            <p className={styles.sectionDescription}>{config.description}</p>

            <form className={styles.credentialForm} onSubmit={handleSave}>
                {config.fields.map((field) => {
                    const masked = status.masked[field.key];
                    const inputId = `${config.provider}-${field.key}`;
                    return (
                        <div key={field.key} className={styles.credentialField}>
                            <label className={styles.credentialLabel} htmlFor={inputId}>{field.label}</label>
                            {masked && <span className={styles.maskedValue}>Saved: {masked}</span>}
                            <input
                                id={inputId}
                                className={formStyles.input}
                                type="password"
                                autoComplete="off"
                                placeholder={masked ? "Leave blank to keep the saved value" : `Paste your ${field.label}`}
                                value={values[field.key]}
                                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            />
                        </div>
                    );
                })}

                <div className={styles.providerActions}>
                    <button type="submit" className="btn" disabled={isBusy || !hasInput}>Save</button>
                    <button type="button" className="btn-outline" onClick={handleTest} disabled={isBusy || !canTest}>
                        Test connection
                    </button>
                    {Object.keys(status.masked).length > 0 && (
                        <button type="button" className="btn-outline" onClick={handleClear} disabled={isBusy}>
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {testResult && (
                <p className={`${styles.testResult} ${testResult.ok ? styles.testResultOk : styles.testResultFailed}`} role="status">
                    {testResult.message}
                </p>
            )}
        </section>
    );
}

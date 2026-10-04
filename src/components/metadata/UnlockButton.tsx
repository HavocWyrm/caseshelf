"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { unlockField } from "@/actions/pages/metadata";
import styles from "@/styles/metadata.module.css";

type Props = {
    itemId: number;
    lockableField: string;
    label: string;
};

export default function UnlockButton({ itemId, lockableField, label }: Props) {
    const router = useRouter();
    const [isBusy, setIsBusy] = useState(false);

    const handleUnlock = async () => {
        setIsBusy(true);
        try {
            await unlockField(itemId, lockableField);
            router.refresh();
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <button
            type="button"
            className={styles.lockButton}
            onClick={handleUnlock}
            disabled={isBusy}
            title={`${label} is locked. Click to unlock so a refresh can update it.`}
            aria-label={`Unlock ${label}`}
        >
            <Lock size={12} aria-hidden />
        </button>
    );
}

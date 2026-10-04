import UnlockButton from "@/components/metadata/UnlockButton";
import styles from "@/styles/detail.module.css";

type Props = {
    label: string;
    itemId: number;
    lockableField: string;
    lockedFields: string[];
};

export default function FieldLabel({ label, itemId, lockableField, lockedFields }: Props) {
    return (
        <span className={styles.fieldLabel}>
            {label}
            {lockedFields.includes(lockableField) && <UnlockButton itemId={itemId} lockableField={lockableField} label={label} />}
        </span>
    );
}

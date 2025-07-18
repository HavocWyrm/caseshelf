import ImportButton from '@component/ImportButton';
import ExportButton from '@component/ExportButton';

export default function SettingsPage() {
    const handleData = async (data: any[]) => {
        const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: data }),
        });

        const result = await res.json();
        alert(`Successfully imported ${result.successCount} items`);
    };

    return (
        <section className="mb-8" style={{ color: "black" }}>
            <h2 className="text-lg">Data</h2>
            <div>
                <ImportButton />
                <ExportButton fileName="caseshelf_export.csv" />
            </div>
        </section >
    )
}
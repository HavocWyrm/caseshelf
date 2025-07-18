"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { parseCsvFile } from "@lib/helpers/parseCsvFile";
import { BiImport } from 'react-icons/bi';

interface ImportButtonProps {
    onImportComplete?: (result: { success: boolean; message: string }) => void;
}

export default function ImportButton({ onImportComplete }: ImportButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        try {
            const data = await parseCsvFile(file);
            const response = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: data }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`Import successful: ${result.importedCount} items imported.`);
            } else {
                toast.error(`Import failed: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            toast.error("Failed to parse or upload CSV file.");
            console.error(error);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                Import
                <BiImport className="w-5 h-5 ml-2" />
            </button>
        </>
    );
}
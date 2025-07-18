"use client";

import React from 'react';
import { BiExport } from 'react-icons/bi';

const ExportCSV = ({ fileName }: { fileName: string }) => {
    const downloadCSV = async () => {
        const res = await fetch("/api/export");

        if (!res.ok) {
            console.error("Failed to fetch data for CSV export");
            return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button className='flex items-center p-1 bg-blue-600 text-white rounded hover:bg-blue-700' onClick={downloadCSV}>
            Export
            <BiExport className='w-5 h-5 ml-2' />
        </button>
    );
};

export default ExportCSV;
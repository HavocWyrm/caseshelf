import { NextResponse } from "next/server";
import prisma from "@lib/db";

export async function GET() {
    const items = await prisma.collectionItem.findMany({
        include: {
            franchise: true,
            genres: true
        }
    })

    const headers = [
        "Name",
        "Status",
        "Type",
        "Franchise",
        "Released",
        "Notes"
    ];

    const rows = items.map(item => [
        item.name,
        item.status,
        item.type,
        item.franchise ? item.franchise.name : "",
        item.releaseYear ? item.releaseYear.toString() : "",
        item.notes || ""
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    return new NextResponse(csvContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=collection.csv'
        }
    });
}
import { NextRequest, NextResponse } from "next/server";
import { processRow } from "@lib/helpers/processRow";

export async function POST(request: NextRequest) {
    try {
        const { rows } = await request.json();

        if (!Array.isArray(rows)) {
            return NextResponse.json(
                { error: "Missing or invalid 'rows' array" },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            rows.map((row, index) => processRow(row, index))
        );

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;
        const failures = results.filter(r => !r.success);

        return NextResponse.json({
            total: rows.length,
            successCount,
            failureCount,
            failures,
        });
    } catch (error) {
        console.error("Import API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
import { NextResponse } from "next/server";
import { getItemOwnedPercentage } from "@lib/helpers/getItemOwnedPercentage";
import { CollectionItemType } from "@/generated/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType");

    if (!itemType) {
        return NextResponse.json({ error: "Missing itemType" }, { status: 400 });
    }

    try {
        const percentComplete = await getItemOwnedPercentage(itemType as CollectionItemType);
        return NextResponse.json({ percentComplete });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch percentage" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import prisma from "@lib/db";
import { CollectionItemType } from "@/generated/prisma"

export async function POST(request: Request) {
  const url = new URL(request.url);
  const typeRaw = url.searchParams.get("type");

  if (!typeRaw || !Object.values(CollectionItemType).includes(typeRaw as CollectionItemType)) {
    return NextResponse.json(
      { error: "Invalid or missing collection item type" },
      { status: 400 }
    );
  }
  const type = typeRaw as CollectionItemType;

  const formData = await request.formData();
  const name = formData.get("name");

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const newItem = await prisma.collectionItem.create({
      data: {
        type,
        name: name.trim(),
      },
    });

    return NextResponse.json({ message: "Item updated", item: newItem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
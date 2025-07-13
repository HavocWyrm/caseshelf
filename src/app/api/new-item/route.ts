import { NextResponse } from "next/server";
import prisma from "@lib/db";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = formData.get("name");
  const type = "temp"

  if (typeof name !== "string") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const newItem = await prisma.collectionItem.create({
      data: { name, type },
    });

    return NextResponse.json({ message: "Item updated", item: newItem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@lib/db";

export async function POST(request: Request) {
  const formData = await request.formData();
  const id = formData.get("id");
  const name = formData.get("name");

  if (typeof id !== "string" || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const updatedItem = await prisma.collectionItem.update({
      where: { id: Number(id) },
      data: { name },
    });

    return NextResponse.json({ message: "Item updated", item: updatedItem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

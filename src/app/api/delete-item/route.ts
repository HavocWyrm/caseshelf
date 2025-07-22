import { NextResponse } from "next/server";
import prisma from "@lib/db";

export async function POST(request: Request) {
  const { id } = await request.json();

  try {
    const deleteItem = await prisma.collectionItem.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Item deleted", item: deleteItem });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@lib/db";
import { Status } from "@/generated/prisma"

export async function POST(request: Request) {
  const formData = await request.formData();

  const id = formData.get("id");
  const statusRaw = formData.get("status");
  const name = formData.get("name");
  const description = formData.get("description");
  const releaseYear = formData.get("releaseYear");
  const franchiseName = formData.get("franchise");
  const notes = formData.get("notes");

  if (
    typeof id !== "string" ||
    typeof statusRaw !== "string" ||
    typeof name !== "string"
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (!Object.values(Status).includes(statusRaw as Status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const status = statusRaw as Status;
  let franchiseConnect = undefined;
  if (typeof franchiseName === "string" && franchiseName.trim() !== "") {
    const franchise = await prisma.franchise.findUnique({
      where: { name: franchiseName.trim() }
    });

    if (!franchise) {
      return NextResponse.json({ error: "Franchise not found" },
        { status: 404 });
    }

    franchiseConnect = { connect: { id: franchise.id } }
  }

  try {
    const updatedItem = await prisma.collectionItem.update({
      where: { id: Number(id) },
      data: {
        status,
        name,
        description: typeof description == "string" && description.trim() !== "" ? description : null,
        releaseYear: typeof releaseYear === "number" ? Number(releaseYear) : null,
        franchise: franchiseConnect,
        notes: typeof notes == "string" && notes.trim() !== "" ? notes : null
      },
    });

    return NextResponse.json({ message: "Item updated", item: updatedItem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

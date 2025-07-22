import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import prisma from "@lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded or invalid file" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const itemIdRaw = formData.get("itemId");
    const itemId = itemIdRaw ? parseInt(itemIdRaw as string, 10) : null;
    if (!itemId || isNaN(itemId)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing item ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/cover-art");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    const arrayBuffer = await file.arrayBuffer();
    await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));

    const imageRecord = await prisma.image.create({
      data: {
        itemId: itemId,
        url: `/uploads/cover-art/${uniqueName}`,
        filename: file.name,
        mimetype: file.type,
        size: file.size,
      },
    });

    return new Response(JSON.stringify(imageRecord), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error during file upload" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

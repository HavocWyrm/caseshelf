import { NextResponse } from "next/server";
import prisma from "@lib/db";

export async function GET() {
  const genres = await prisma.genre.findMany();
  return NextResponse.json(genres);
}

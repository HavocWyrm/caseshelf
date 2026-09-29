"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { GameGenre, MediaGenre } from "@/types/item";

export async function getGameGenres(): Promise<GameGenre[]> {
    await startup();
    const result = await pool.query(
        `SELECT id, name FROM game_genre ORDER BY name`
    );
    return result.rows;
}

export async function getMediaGenres(): Promise<MediaGenre[]> {
    await startup();
    const result = await pool.query(
        `SELECT id, name FROM media_genre ORDER BY name`
    );
    return result.rows;
}
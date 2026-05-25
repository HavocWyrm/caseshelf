"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { requireAdmin, requireSession } from "@/lib/session";

export async function assignAdminRole(userId: string) {
    await requireAdmin();
    await startup();
    await pool.query(
        `UPDATE "user" SET role = 'admin' WHERE id = $1`,
        [userId]
    );
}

export async function reassignOrphanedItems(userId: string) {
    await requireAdmin();
    await startup();
    await pool.query(
        `UPDATE collection_item SET user_id = $1 WHERE user_id = '-1'`,
        [userId]
    );
}

export async function onFirstUserCreated(userId: string) {
    await startup();
    await pool.query(
        `UPDATE "user" SET role = 'admin' WHERE id = $1`,
        [userId]
    );
    await pool.query(
        `UPDATE collection_item SET user_id = $1 WHERE user_id = '-1'`,
        [userId]
    );
}
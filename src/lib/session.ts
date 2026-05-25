import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

export async function getSession() {
    return auth.api.getSession({
        headers: await headers(),
    });
}

export async function getSessionFromRequest(request: NextRequest) {
    return auth.api.getSession({
        headers: request.headers,
    });
}

export async function hasUsers(): Promise<boolean> {
    await startup();
    const result = await pool.query(`SELECT COUNT(*) FROM "user"`);
    return Number(result.rows[0].count) > 0;
}

export async function requireSession() {
    const session = await getSession();
    if (!session) throw new Error("Unauthorised");
    return session;
}

export async function requireAdmin() {
    const session = await requireSession();
    if (session.user.role !== "admin") throw new Error("Forbidden");
    return session;
}
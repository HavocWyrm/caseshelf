import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/api/auth")) return NextResponse.next();

    const session = await getSessionFromRequest(request);

    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
        if (session) return NextResponse.redirect(new URL("/", request.url));
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    runtime: "nodejs",
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
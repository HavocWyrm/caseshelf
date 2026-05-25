import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

const oidcEnabled = !!(
    process.env.OIDC_CLIENT_ID &&
    process.env.OIDC_CLIENT_SECRET &&
    process.env.OIDC_ISSUER_URL
);

export const auth = betterAuth({
    database: pool,

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                required: true,
            },
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24,
    },

    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await startup();
                    const result = await pool.query(`SELECT COUNT(*) FROM "user"`);
                    const count = Number(result.rows[0].count);
                    if (count === 1) {
                        await pool.query(
                            `UPDATE "user" SET role = 'admin' WHERE id = $1`,
                            [user.id]
                        );
                        await pool.query(
                            `UPDATE collection_item SET user_id = $1 WHERE user_id = '-1'`,
                            [user.id]
                        );
                    }
                },
            },
        },
    },

    plugins: [
        genericOAuth({
            config: oidcEnabled ? [
                {
                    providerId: "oidc",
                    clientId: process.env.OIDC_CLIENT_ID!,
                    clientSecret: process.env.OIDC_CLIENT_SECRET!,
                    discoveryUrl: `${process.env.OIDC_ISSUER_URL}/.well-known/openid-configuration`,
                    scopes: ["openid", "email", "profile"],
                },
            ] : [],
        }),
    ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
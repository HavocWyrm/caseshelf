"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import formStyles from "@/styles/form.module.css";
import authStyles from "@/styles/auth.module.css";

export default function LoginForm({ oidcEnabled }: { oidcEnabled: boolean }) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signIn.email({ email, password });

        if (error) {
            setError(error.message ?? "Failed to sign in");
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    };

    const handleOidc = async () => {
        await signIn.oauth2({ providerId: "oidc", callbackURL: "/" });
    };

    return (
        <form className={formStyles.form} onSubmit={handleSubmit}>
            {error && <p className={authStyles.error}>{error}</p>}

            <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="email">Email</label>
                <input
                    className={formStyles.input}
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="password">Password</label>
                <input
                    className={formStyles.input}
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <button className="btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
            </button>

            {oidcEnabled && (
                <button className="btn-outline" type="button" onClick={handleOidc}>
                    Sign in with SSO
                </button>
            )}
        </form>
    );
}
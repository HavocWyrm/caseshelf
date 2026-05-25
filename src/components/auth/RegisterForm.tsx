"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { onFirstUserCreated } from "@/actions/user";
import formStyles from "@/styles/form.module.css";
import authStyles from "@/styles/auth.module.css";

export default function RegisterForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await signUp.email({ name, email, password });

        if (error || !data?.user) {
            setError(error?.message ?? "Failed to create account");
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    };

    return (
        <form className={formStyles.form} onSubmit={handleSubmit}>
            {error && <p className={authStyles.error}>{error}</p>}

            <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="name">Name</label>
                <input
                    className={formStyles.input}
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

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
                {loading ? "Creating account..." : "Create account"}
            </button>
        </form>
    );
}
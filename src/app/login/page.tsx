import { hasUsers } from "@/lib/session";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import authStyles from "@/styles/auth.module.css";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
    const usersExist = await hasUsers();
    if (!usersExist) redirect("/register");

    const oidcEnabled = !!(
        process.env.OIDC_CLIENT_ID &&
        process.env.OIDC_CLIENT_SECRET &&
        process.env.OIDC_ISSUER_URL
    );

    return (
        <div className={authStyles.authPage}>
            <div className={authStyles.authCard}>
                <h1 className={authStyles.authTitle}>Sign in to CaseShelf</h1>
                <LoginForm oidcEnabled={oidcEnabled} />
            </div>
        </div>
    );
}
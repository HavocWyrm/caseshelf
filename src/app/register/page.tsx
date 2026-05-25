import { hasUsers } from "@/lib/session";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import authStyles from "@/styles/auth.module.css";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
    const usersExist = await hasUsers();
    if (usersExist) redirect("/login");

    return (
        <div className={authStyles.authPage}>
            <div className={authStyles.authCard}>
                <h1 className={authStyles.authTitle}>Create your CaseShelf account</h1>
                <p className={authStyles.authSubtitle}>You are creating the admin account.</p>
                <RegisterForm />
            </div>
        </div>
    );
}
"use client";
import { usePathname } from "next/navigation";
import styles from "@/styles/header.module.css";

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/games": "Games",
    "/movies": "Movies",
    "/shows": "Shows",
    "/settings": "Settings",
};

export default function Header() {
    const pathname = usePathname();
    const title = pageTitles[pathname] ?? "CaseShelf";

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <h1 className={styles.headerTitle}>{title}</h1>
            </div>
        </header>
    );
}
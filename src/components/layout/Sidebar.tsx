"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Gamepad2, Film, TvMinimal, Settings } from "lucide-react";
import styles from "@/styles/sidebar.module.css";

const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={24} />, href: "/" },
    { name: "Games", icon: <Gamepad2 size={24} />, href: "/games" },
    { name: "Movies", icon: <Film size={24} />, href: "/movies" },
    { name: "Shows", icon: <TvMinimal size={24} />, href: "/shows" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Link href="/" title="Home" aria-label="Home">
                    <img src="/favicon.ico" alt="CaseShelf" className={styles.favicon} />
                </Link>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {menuItems.map(({ name, icon, href }) => (
                        <li key={name}>
                            <Link
                                href={href}
                                title={name}
                                aria-label={name}
                                className={`${styles.navItem} ${pathname === href ? styles.navItemActive : ""}`}
                            >
                                {icon}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className={styles.settingsLink}>
                <Link href="/settings" title="Settings" aria-label="Settings">
                    <Settings size={24} />
                </Link>
            </div>
        </aside>
    );
}
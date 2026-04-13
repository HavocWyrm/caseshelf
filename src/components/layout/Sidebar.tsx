"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Film, Tv, Bookmark, Settings } from "lucide-react";
import styles from "@/styles/sidebar.module.css";

const typePages = [
    { name: "Games", icon: <Gamepad2 size={18} />, href: "/games" },
    { name: "Movies", icon: <Film size={18} />, href: "/movies" },
    { name: "Shows", icon: <Tv size={18} />, href: "/shows" },
];

const mainPages = [
    { name: "Wanted", icon: <Bookmark size={20} />, href: "/wanted" },
    { name: "Settings", icon: <Settings size={20} />, href: "/settings" },
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
                <div className={styles.subGroup}>
                    <span className={styles.subGroupLabel}>Collections</span>
                    <ul className={styles.navList}>
                        {typePages.map(({ name, icon, href }) => (
                            <li key={name}>
                                <Link
                                    href={href}
                                    aria-label={name}
                                    className={`${styles.subNavItem} ${pathname.startsWith(href) ? styles.subNavItemActive : ""}`}
                                >
                                    <span className={styles.navIcon}>{icon}</span>
                                    <span className={styles.navLabel}>{name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <ul className={styles.navList}>
                    {mainPages.map(({ name, icon, href }) => (
                        <li key={name}>
                            <Link
                                href={href}
                                aria-label={name}
                                className={`${styles.navItem} ${pathname.startsWith(href) ? styles.navItemActive : ""}`}
                            >
                                <span className={styles.navIcon}>{icon}</span>
                                <span className={styles.navLabel}>{name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
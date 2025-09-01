"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoAlbumsOutline,
  IoGameControllerOutline,
  IoFilmOutline,
  IoTvOutline,
  IoSettingsSharp,
} from "react-icons/io5";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: <IoAlbumsOutline />, href: "/" },
    { name: "Games", icon: <IoGameControllerOutline />, href: "/collection/game" },
    { name: "Movies", icon: <IoFilmOutline />, href: "/collection/movie" },
    { name: "Shows", icon: <IoTvOutline />, href: "/collection/show" },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar w-24 h-screen sticky top-0 flex flex-col z-40">
        {/* Home / Favicon button */}
        <div className="p-4 border-b border-[theme(colors.accent)] flex justify-center items-center">
          <Link href="/" title="Home" aria-label="Home">
            <img
              src="/favicon.ico"
              alt="CaseShelf Home"
              className="w-8 h-8"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col justify-start flex-1 p-2 space-y-8">
          <ul className="flex flex-col space-y-2 items-center">
            {menuItems.map(({ name, icon, href }) => {
              const isActive = pathname === href;
              return (
                <li key={name}>
                  <Link
                    href={href}
                    className={`nav-item flex items-center justify-center  rounded transition cursor-pointer    ${isActive ? "bg-[theme(colors.secondary)] text-[theme(colors.primary)]"
                      : "hover:bg-[theme(colors.secondary)]"
                      }  `}
                    title={name}                  >
                    <span className="text-4xl">{icon}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings */}
        <div
          className="p-4 border-t border-[theme(colors.accent)] flex items-center justify-center hover:bg-[theme(colors.secondary)] cursor-pointer transition"
          title="Settings"
        >
          <Link href="/settings" title="Settings" aria-label="Settings">
            <IoSettingsSharp className="text-xl" />
          </Link>
        </div>
      </aside >
    </>
  );
}

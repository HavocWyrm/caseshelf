"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IoAlbumsOutline,
  IoGameControllerOutline,
  IoFilmOutline,
  IoTvOutline,
  IoSettingsSharp,
  IoMenuOutline,
  IoChevronBackOutline,
} from "react-icons/io5";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <IoAlbumsOutline />, href: "/" },
    { name: "Games", icon: <IoGameControllerOutline />, href: "/games" },
    { name: "Movies", icon: <IoFilmOutline />, href: "/movies" },
    { name: "Shows", icon: <IoTvOutline />, href: "/shows" },
  ];

  return (
    <aside
      className={`bg-gray-900 text-white flex flex-col h-screen ${collapsed ? "w-16" : "w-64"} transition-width duration-300 ease-in-out`}
    >
      {/* Collapse Toggle at the top */}
      <div className="p-4 border-b border-gray-700 flex justify-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-800 transition"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <IoMenuOutline size={24} />
          ) : (
            <IoChevronBackOutline size={24} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(({ name, icon, href }) => (
            <li key={name}>
              <Link
                href={href}
                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-800 transition"
                title={collapsed ? name : undefined}
              >
                <span className="text-lg">{icon}</span>
                <span className={collapsed ? "hidden" : "block"}>{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings at the bottom */}
      <div
        className="p-4 border-t border-gray-700 flex items-center space-x-3 rounded hover:bg-gray-800 cursor-pointer transition"
        title={collapsed ? "Settings" : undefined}
      >
        <IoSettingsSharp className="text-lg" />
        <span className={collapsed ? "hidden" : "block"}>Settings</span>
      </div>
    </aside>
  );
}

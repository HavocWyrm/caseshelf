"use client";

import { useRouter } from "next/navigation";

export default function DashboardButton() {
  const router = useRouter();

  function handleClick() {
    router.push("/");
  }

  return (
    <button
      onClick={handleClick}
      className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
    >
      ← Return to Dashboard
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";

export default function AddItemButton() {
    const router = useRouter();

    function handleClick() {
        router.push("/item/new");
    }

    return (
        <button onClick={handleClick} className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
            Add New Item
        </button>
  );
}
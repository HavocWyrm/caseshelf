"use client";

import { useRouter } from "next/navigation";

export default function AddItemButton() {
    const router = useRouter();

    function handleClick() {
        router.push("/item/new");
    }
    
    return <button onClick={handleClick}>
        Add Item
    </button>;
}
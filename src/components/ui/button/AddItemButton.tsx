"use client";

import { useState } from "react";
import AddItemModal from "@component/features/items/AddItemModal";
import { useRouter } from "next/navigation";

type AddItemButtonProps = {
  itemType: string;
};

export default function AddItemButton({ itemType }: AddItemButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleAddItem = async (name: string) => {
    if (!name) {
      alert("Item name is required");
      return;
    }

    try {
      const res = await fetch(`/api/new-item?type=${itemType.toUpperCase()}`, {
        method: "POST",
        body: new URLSearchParams({ name }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        router.refresh(); // refresh data on page
      } else {
        alert(data.error || "Failed to add item");
      }
    } catch {
      alert("An unexpected error occurred");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
      >
        Add New{" "}
        {itemType.charAt(0).toUpperCase() + itemType.slice(1).toLowerCase()}
      </button>

      <AddItemModal
        showModal={showModal}
        onOKAction={handleAddItem}
        onCloseAction={() => setShowModal(false)}
      />
    </>
  );
}

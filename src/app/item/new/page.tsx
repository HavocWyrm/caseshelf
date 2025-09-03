"use client";

import { useState } from "react";

import DashboardButton from "@component/ui/button/DashboardReturnButton";
import AddItemModal from "@component/features/items/AddItemModal";

export default function NewItem() {
  const [showModal, setShowModal] = useState(false);

  const handleAddItem = async (name: string) => {
    if (!name) {
      alert("Item name is required");
      return;
    }

    try {
      const res = await fetch(`/api/new-item?type=ITEM`, {
        method: "POST",
        body: new URLSearchParams({ name }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Item created successfully");
        setShowModal(false);
        // You can redirect or refresh here if needed
      } else {
        alert(data.error || "Failed to add item");
      }
    } catch {
      alert("An unexpected error occurred");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <DashboardButton />

      <h1 className="text-3xl font-bold mb-4">Create New Item</h1>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Add New Item
      </button>

      <AddItemModal
        showModal={showModal}
        onOKAction={handleAddItem}
        onCloseAction={() => setShowModal(false)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { IoAdd } from "react-icons/io5";

import AddItemModal from "@component/AddItemModal";

type ItemCardProps = {
  itemCount: number;
  itemType: string;
};

export default function ItemCard({ itemCount, itemType }: ItemCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const handleClick = (e: React.MouseEvent) => {
    if (showModal) {
      e.stopPropagation();
      return;
    }
    router.push(`/${itemType.toLowerCase()}s`);
  };

  const formattedTitle =
    itemType.charAt(0).toUpperCase() + itemType.slice(1).toLowerCase() + "s";

  return (
    <div
      onClick={handleClick}
      className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white cursor-pointer"
    >
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-black">{formattedTitle}</h3>
          <p className="text-gray-700">Count: {itemCount}</p>
        </div>

        <div className="h-12 border-l border-gray-300 mx-4" />

        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={`Add new ${formattedTitle}`}
          >
            <IoAdd size={24} />
          </button>
          <AddItemModal
            showModal={showModal}
            onOKAction={async (name) => {
              if (!name) {
                alert("Item name is required");
                return;
              }

              try {
                const res = await fetch(
                  `/api/new-item?type=${itemType.toUpperCase()}`,
                  { method: "POST", body: new URLSearchParams({ name }) },
                );
                const data = await res.json();

                if (res.ok) {
                  setShowModal(false);
                  router.refresh();
                } else {
                  alert(data.error || "Failed to add item");
                }
              } catch {
                alert("An unexpected error occurred");
              }
            }}
            onCloseAction={() => setShowModal(false)}
          />
        </div>
      </div>
    </div>
  );
}

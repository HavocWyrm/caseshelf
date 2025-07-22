"use client";

import { useState } from "react";
import Modal from "react-modal";
import ItemForm from "@component/ItemForm";
import { useRouter } from "next/navigation";
import { CollectionItem } from "@/app/types/collectionItem";

type Item = CollectionItem;

export default function EditItemModal({ item }: { item: Item }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleUpdate = async (formData: FormData): Promise<string | null> => {
    try {
      const res = await fetch("/api/edit-item", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        router.refresh();
        return null;
      }

      return data.error || "Failed to update item";
    } catch {
      return "An unexpected error occurred";
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-yellow-600 text-white px-4 py-2 rounded"
      >
        Edit
      </button>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        ariaHideApp={false}
      >
        <h2 className="text-black text-xl font-semibold mb-4">Edit Item</h2>

        <ItemForm
          onSubmitAction={handleUpdate}
          itemId={item.id}
          initialStatus={item.status}
          initialName={item.name}
          initialDescription={item.description ?? ""}
          initialReleaseYear={item.releaseYear ?? null}
          initialGenres={item.genres.map((g) => g.id)}
          initialFranchise={item.franchise?.name ?? ""}
          initialNotes={item.notes ?? ""}
          submitLabel="Save Changes"
        />

        <div className="mt-4">
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}

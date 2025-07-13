"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation';

import DeleteButton from "@component/DeleteButton"
import DeleteModal from "@component/DeleteModal"

type Item = {
  id: number;
};

type DeleteSectionProps = {
  item: Item
}

export default function DeleteSection({item}: DeleteSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter();

  const handleDelete = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/delete-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({id: item.id}),
      });

      const data = await res.json();
      
      if (res.ok) {
        setShowModal(false);
        router.push("/");
        return "Item deleted successfully";
      }
      return data.error || "Failed to delete item";
    } catch {
      return "An unexpected error occurred";
    }
  };

  return (
    <> 
        <DeleteButton onClickAction={() => setShowModal(true)} />
        <DeleteModal showModal={showModal} onOKAction={handleDelete} onCloseAction={() => setShowModal(false)} />
    </>
  )
}
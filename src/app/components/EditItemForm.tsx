"use client";

import React, {useState} from "react";
import ItemForm from "@component/ItemForm";

type Item = {
  id: number;
  name: string;
  type?: string;
};

type EditItemFormProps = {
  item: Item;
};

export default function EditItemForm({ item }: EditItemFormProps) {
  const handleEdit = async (formData: FormData): Promise<string | null> => {
    try {
      const res = await fetch("/api/edit-item", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return res.ok ? "Item updated successfully!" : data.error || "Failed to update item";
    } catch {
      return "An unexpected error occurred";
    }
  };

  return (
    <ItemForm onSubmitAction={handleEdit} itemId={item.id} initialName={item.name} submitLabel="Update Item" />
  );
}
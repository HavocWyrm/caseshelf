"use client";

import React, {useState} from "react";
import ItemForm from "@component/ItemForm";

export default function AddItemForm() {
  const handleAdd = async (formData: FormData): Promise<string | null> => {
    try {
      const res = await fetch("/api/new-item", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return res.ok ? "Item added successfully!" : data.error || "Failed to add item";
    } catch {
      return "An unexpected error occurred";
    }
  };

  return (
    <ItemForm
      onSubmitAction={handleAdd}
      submitLabel="Add Item"
    />
  );
}
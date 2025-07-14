"use client";

import React, { useState, useEffect } from "react";

type ItemFormProps = {
  onSubmitAction: (formData: FormData) => Promise<string | null>;
  itemId?: number;
  initialStatus?: string;
  initialName?: string;
  initialDescription?: string;
  initialReleaseYear?: number | null;
  initialFranchise?: string;
  initialNotes?: string;
  submitLabel?: string;
};

export default function ItemForm({
  onSubmitAction,
  itemId,
  initialStatus = "",
  initialName = "",
  initialDescription = "",
  initialReleaseYear = null,
  initialFranchise = "",
  initialNotes = "",
  submitLabel = "Submit",
}: ItemFormProps) {
  const [itemStatus, setItemStatus] = useState(initialStatus);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [releaseYear, setReleaseYear] = useState<number | null>(initialReleaseYear);
  const [franchise, setFranchise] = useState(initialFranchise);
  const [notes, setNotes] = useState(initialNotes);

  const [status, setStatus] = useState<string | null>(null);
  const statusOptions = ["Owned", "Wanted"];

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const formData = new FormData();
    if (itemId !== undefined) {
      formData.append("id", itemId.toString());
    }
    formData.append("name", name);

    const result = await onSubmitAction(formData);
    setStatus(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      {itemId !== undefined && (
        <input type="hidden" name="id" value={itemId} />
      )}

      <label className="block mb-2">
        Status:
        <select
          name="status"
          value={itemStatus}
          onChange={(e) => setItemStatus(e.target.value)}
          className="border px-2 py-1">
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="block mb-2">
        Name:
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1"
        />
      </label>
      <label className="block mb-2">
        Description:
        <input
          type="text"
          name="description"
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-2 py-1"
        />
      </label>
      <label className="block mb-2">
        Release Year:
        <input
          type="number"
          name="releaseYear"
          value={releaseYear !== null && releaseYear !== undefined ? releaseYear : ""}
          onChange={(e) => setReleaseYear(e.target.valueAsNumber)}
          className="border px-2 py-1"
        />
      </label>
      {/* Add genre multiselect here */}
      <label className="block mb-2">
        Franchise:
        <input
          type="text"
          name="franchise"
          value={franchise || ""}
          onChange={(e) => setFranchise(e.target.value)}
          className="border px-2 py-1"
        />
      </label>
      <label className="block mb-2">
        Notes:
        <input
          type="text"
          name="notes"
          value={notes || ""}
          onChange={(e) => setNotes(e.target.value)}
          className="border px-2 py-1"
        />
      </label>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        {submitLabel}
      </button>

      {status && <p className="mt-2">{status}</p>}
    </form>
  );
}
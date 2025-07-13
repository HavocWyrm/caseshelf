"use client";

import React, {useState, useEffect} from "react";

type ItemFormProps = {
    onSubmitAction: (formData: FormData) => Promise<string | null>;
    itemId?: number;
    initialName?: string;
    submitLabel?: string;
};

export default function ItemForm({ onSubmitAction, itemId, initialName = "", submitLabel = "Submit", }: ItemFormProps) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<string | null>(null);

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
        Name:
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
"use client";

import React, { useState, useEffect } from "react";
import { Status } from "@/generated/prisma";

type ItemFormProps = {
  onSubmitAction: (formData: FormData) => Promise<string | null>;
  itemId?: number;
  initialStatus?: string;
  initialName?: string;
  initialDescription?: string;
  initialReleaseYear?: number | null;
  initialGenres?: number[];
  initialFranchise?: string;
  initialNotes?: string;
  submitLabel?: string;
};

export default function ItemForm({
  onSubmitAction,
  itemId,
  initialStatus = Status.OWNED,
  initialName = "",
  initialDescription = "",
  initialReleaseYear = null,
  initialGenres = [],
  initialFranchise = "",
  initialNotes = "",
  submitLabel = "Submit",
}: ItemFormProps) {
  const [itemStatus, setItemStatus] = useState(initialStatus);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [releaseYear, setReleaseYear] = useState<number | null>(
    initialReleaseYear,
  );
  const [selectedGenres, setSelectedGenres] = useState<number[]>(initialGenres);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [franchise, setFranchise] = useState(initialFranchise);
  const [notes, setNotes] = useState(initialNotes);

  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setItemStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    async function fetchGenres() {
      const res = await fetch("/api/genres");
      if (res.ok) {
        const data = await res.json();
        setGenres(data);
      }
    }
    fetchGenres();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    let imageUploadResult = null;

    if (selectedFile) {
      const formDataForImage = new FormData();
      formDataForImage.append("image", selectedFile);
      if (itemId !== undefined) {
        formDataForImage.append("itemId", itemId.toString());
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataForImage,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Image upload failed");
      }

      imageUploadResult = await res.json();
    }

    const formData = new FormData();
    if (itemId !== undefined) {
      formData.append("id", itemId.toString());
    }
    formData.append("status", itemStatus);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("releaseYear", String(releaseYear));
    selectedGenres.forEach((genreId) => {
      formData.append("genres", genreId.toString());
    });
    formData.append("franchise", franchise);
    formData.append("notes", notes);

    // Append uploaded image info if available
    if (imageUploadResult) {
      // Example: you could append the image url or image DB id depending on what your backend expects
      formData.append("imageUrl", imageUploadResult.url);
      formData.append("imageId", imageUploadResult.itemId?.toString() || "");
    }

    const result = await onSubmitAction(formData);
    setStatus(result);
  };

  return (
    <form onSubmit={handleSubmit} className="text-black">
      {itemId !== undefined && <input type="hidden" name="id" value={itemId} />}

      <label className="block mb-2">
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
      <label className="block mb-2">
        Status:
        <select
          name="status"
          value={itemStatus}
          onChange={(e) => setItemStatus(e.target.value)}
          className="border px-2 py-1"
        >
          {Object.values(Status).map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
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
          value={
            releaseYear !== null && releaseYear !== undefined ? releaseYear : ""
          }
          onChange={(e) => setReleaseYear(e.target.valueAsNumber)}
          className="border px-2 py-1"
        />
      </label>
      <label className="block mb-2">
        Genres:
        <select
          multiple
          value={selectedGenres.map(String)}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map(
              (option) => Number(option.value),
            );
            setSelectedGenres(selectedOptions);
          }}
          className="border px-2 py-1"
          size={4}
        >
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </label>
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

      <button
        type="submit"
        className="bg-blue-500 text-black px-4 py-2 rounded mt-2"
      >
        {submitLabel}
      </button>

      {status && <p className="mt-2">{status}</p>}
    </form>
  );
}
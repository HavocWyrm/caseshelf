"use client";

type DeleteButtonProps = {
  onClickAction: () => void;
};

export default function AddItemButton({ onClickAction }: DeleteButtonProps) {
  return (
    <button
      onClick={onClickAction}
      className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
    >
      Delete
    </button>
  );
}

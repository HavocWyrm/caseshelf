"use client";

import { useRouter } from "next/navigation";

type Item = {
  id: number;
  name: string;
  type: string;
};

export default function ItemCard({ item }: { item: Item }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/item/${item.id}/edit`);
  };

  return (
    <div
      onClick={handleClick}
      className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white cursor-pointer"
    >
      <h3 className="text-xl font-semibold">{item.name}</h3>
      <p className="text-gray-600 mt-1">{item.type}</p>
    </div>
  );
}
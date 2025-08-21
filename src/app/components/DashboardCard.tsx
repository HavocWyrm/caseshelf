"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AddItemModal from "@component/AddItemModal";
import ProgressBar from "@component/ProgressBar";

import {
  IoGameControllerOutline,
  IoFilmOutline,
  IoTvOutline,
  IoAdd,
  IoEyeOutline
} from "react-icons/io5";

type ItemCardProps = {
  itemCount: number;
  itemType: string;
};

export default function DashboardCard({ itemCount, itemType }: ItemCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const iconMap: Record<string, React.JSX.Element> = {
    GAME: <IoGameControllerOutline size={64} />,
    MOVIE: <IoFilmOutline size={64} />,
    SHOW: <IoTvOutline size={64} />,
  };

  const formattedTitle =
    itemType.charAt(0).toUpperCase() + itemType.slice(1).toLowerCase() + "s";

  return (
    <div className="card flex flex-col justify-between p-6 h-full cursor-default">
      {/* Title and progress bar*/}
      <div className="mx-auto w-2/3 text-center">
        <ProgressBar itemType={itemType} />
        <h2 className="text-2xl font-bold mb-4">{formattedTitle}</h2>
      </div>

      {/* Icon centered */}
      <div className="flex justify-center my-8 text-[theme(colors.foreground)]">
        {iconMap[itemType.toUpperCase()] || null}
      </div>

      {/* Footer with two halves */}
      <footer className="flex justify-between items-center text-center text-[theme(colors.accent)]">
        {/* View All */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("Navigating to", `/${itemType.toLowerCase()}s`);
            router.push(`/collection/${itemType.toLowerCase()}`);
          }}
          className="flex flex-col items-center text-lg hover:text-[theme(colors.secondary)] transition"
          title={`View all ${formattedTitle}`}
          aria-label={`View all ${formattedTitle}`}
          type="button"
        >
          <IoEyeOutline size={28} />
          <span>View All</span>
        </button>

        {/* Quick Add */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="flex flex-col items-center text-sm hover:text-[theme(colors.secondary)] transition"
          title={`Quick add new ${formattedTitle}`}
          aria-label={`Quick add new ${formattedTitle}`}
          type="button"
        >
          <IoAdd size={28} />
          <span>Add</span>
        </button>
      </footer>

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
  );
}

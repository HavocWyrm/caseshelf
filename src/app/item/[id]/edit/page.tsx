import prisma from "@lib/db";

import DashboardButton from "@component/DashboardButton";
import EditItemForm from "@component/EditItemForm";
import DeleteSection from "@component/DeleteSection";

type EditItemProps = {
  params: { id: string };
};

export default async function EditItem({ params }: EditItemProps) {
  const { id } = await params;
  const item = await prisma.collectionItem.findUnique({
    where: { id: Number(id) },
    include: {
      franchise: true,
    },
  });

  if (!item) {
    return <div>Item not found</div>;
  }

  const normalisedItem = {
    ...item,
    description: item.description ?? undefined,
    notes: item.notes ?? undefined,
    releaseYear: item.releaseYear ?? undefined,
    franchiseName: item.franchise?.name ?? undefined,
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <DashboardButton />
      <DeleteSection item={item} />
      <h1 className="text-3xl font-bold mb-4">Editing Item</h1>
      <EditItemForm item={normalisedItem} />
      <p>{item.lastUpdated.toDateString()}</p>
    </div>
  );
}
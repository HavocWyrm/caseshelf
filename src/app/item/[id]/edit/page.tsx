import prisma from "@lib/db";
import DashboardButton from "@component/DashboardButton";
import EditItemForm from "@component/EditItemForm";

type EditItemProps = {
  params: { id: string };
};

export default async function EditItem({ params }: EditItemProps) {
  const { id } = await params;
  const item = await prisma.collectionItem.findUnique({
    where: { id: Number(id) },
  });

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <DashboardButton />
      <h1 className="text-3xl font-bold mb-4">Editing Item</h1>
      <EditItemForm item={item} />
    </div>
  );
}
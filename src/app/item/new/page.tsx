import DashboardButton from "@component/DashboardButton";
import AddItemForm from "@component/AddItemForm";

export default function NewItem() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <DashboardButton />

      <h1 className="text-3xl font-bold mb-4">Create New Item</h1>
      <AddItemForm />
    </div>
  );
}

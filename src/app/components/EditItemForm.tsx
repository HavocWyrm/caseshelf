"use client";

type Item = {
  id: number;
  name: string;
  type: string;
};

type EditItemFormProps = {
  item: Item;
};

export default function EditItemForm({ item }: EditItemFormProps) {
  return (
    <form action="/api/edit-item" method="POST">
      <input type="hidden" name="id" value={item.id} />
      <label className="block mb-2">
        Name:
        <input
          type="text"
          name="name"
          defaultValue={item.name}
          className="border px-2 py-1"
        />
      </label>
      <label className="block mb-2">
        Type:
        <input
          type="text"
          name="type"
          defaultValue={item.type}
          className="border px-2 py-1"
        />
      </label>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        Submit
      </button>
    </form>
  );
}
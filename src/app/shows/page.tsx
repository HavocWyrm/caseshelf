import prisma from "@lib/db";
import AddItemButton from "@component/AddItemButton";
import ItemCard from "@component/ItemCard";

export default async function ShowsPage() {
    const items = await prisma.collectionItem.findMany({
        where: { type: "SHOW" },
    });

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold">Shows</h1>
            <AddItemButton itemType="SHOW" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {items.map((item) => (
                    <ItemCard
                        key={item.id}
                        item={{
                            ...item,
                            description: item.description ?? "",
                        }}
                    />
                ))}
            </div>
        </main>
    );
}

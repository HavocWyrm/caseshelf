import prisma from "@lib/db";
import EditItemModal from "@component/EditItemModal";
import { notFound } from "next/navigation";

type Params = {
    params: {
        id: string;
    };
};

export default async function ItemDetailPage({ params }: Params) {
    const item = await prisma.collectionItem.findUnique({
        where: { id: Number(params.id) },
        include: {
            genres: true,
            franchise: true,
        },
    });

    if (!item) return notFound();

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-4">{item.name}</h1>

            <div className="space-y-2 text-black">
                <p><strong>Status:</strong> {item.status}</p>

                {item.description && (
                    <p><strong>Description:</strong> {item.description}</p>
                )}

                {item.releaseYear && (
                    <p><strong>Release Year:</strong> {item.releaseYear}</p>
                )}

                {item.genres.length > 0 && (
                    <p><strong>Genres:</strong> {item.genres.map((g) => g.name).join(", ")}</p>
                )}

                {item.franchise && (
                    <p><strong>Franchise:</strong> {item.franchise.name}</p>
                )}

                {item.notes && (
                    <p><strong>Notes:</strong> {item.notes}</p>
                )}
            </div>

            <div className="mt-6">
                <EditItemModal item={item} />
            </div>
        </main>
    );
}
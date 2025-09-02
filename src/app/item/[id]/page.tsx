import { notFound } from "next/navigation";
import prisma from "@lib/db";
import EditItemModal from "@component/features/items/EditItemModal";

interface ItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const itemParams = await params;
  const id = parseInt(itemParams.id);

  if (isNaN(id)) return notFound();

  const item = await prisma.collectionItem.findUnique({
    where: { id },
    include: {
      coverArt: true,
      genres: true,
      franchise: true,

      gameDetails: {
        include: {
          platform: true,
        },
      },
      movieDetails: {
        include: {
          format: true,
        }
      },
      showDetails: {
        include: {
          format: true,
        }
      },
    },
  });

  if (!item) return notFound();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">{item.name}</h1>

      <div className="space-y-2 text-black">
        {item.coverArt?.url && (
          <img
            src={item.coverArt.url}
            alt={item.name}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}
        <p>
          <strong>Status:</strong> {item.status}
        </p>

        {item.gameDetails?.platform.name && (
          <p>
            <strong>Platform:</strong> {item.gameDetails.platform.name}
          </p>
        )}

        {item.description && (
          <p>
            <strong>Description:</strong> {item.description}
          </p>
        )}

        {item.releaseYear && (
          <p>
            <strong>Release Year:</strong> {item.releaseYear}
          </p>
        )}

        {item.genres.length > 0 && (
          <p>
            <strong>Genres:</strong> {item.genres.map((g) => g.name).join(", ")}
          </p>
        )}

        {item.franchise && (
          <p>
            <strong>Franchise:</strong> {item.franchise.name}
          </p>
        )}

        {item.notes && (
          <p>
            <strong>Notes:</strong> {item.notes}
          </p>
        )}
      </div>

      <div className="mt-6">
        <EditItemModal item={item} />
      </div>
    </main>
  );
}

// export const dynamic = "force-dynamic";

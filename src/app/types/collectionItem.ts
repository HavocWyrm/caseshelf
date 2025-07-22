import { Prisma } from "@/generated/prisma";

export type CollectionItem = Prisma.CollectionItemGetPayload<{
  include: {
    coverArt: true;
    genres: true;
    franchise: true;
  };
}>;

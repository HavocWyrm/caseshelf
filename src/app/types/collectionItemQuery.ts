import { Prisma } from "@/generated/prisma";

const sharedIncludes = {
    coverArt: true,
    genres: true,
    franchise: true,
} as const;

export const gameItemInclude = {
    ...sharedIncludes,
    gameDetails: {
        include: {
            platform: true,
        },
    },
} as const;

type PrismaGameItem = Prisma.CollectionItemGetPayload<{
    include: typeof gameItemInclude;
}>;

export type GameItem = PrismaGameItem & { type: "GAME" };

export const movieItemInclude = {
    ...sharedIncludes,
    movieDetails: true,
} as const;

type PrismaMovieItem = Prisma.CollectionItemGetPayload<{
    include: typeof movieItemInclude;
}>;

export type MovieItem = PrismaMovieItem & { type: "MOVIE" };

export const showItemInclude = {
    ...sharedIncludes,
    showDetails: true,
} as const;

type PrismaShowItem = Prisma.CollectionItemGetPayload<{
    include: typeof showItemInclude;
}>;

export type ShowItem = PrismaShowItem & { type: "SHOW" };
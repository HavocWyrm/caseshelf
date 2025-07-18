import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isDuplicate } from '@lib/helpers/duplicateRow';
import prisma from '@lib/db';
import { CollectionItemType } from '@/generated/prisma';

vi.mock('@lib/db', () => ({
    default: {
        collectionItem: {
            findFirst: vi.fn(),
        },
    },
}));

describe('isDuplicate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns true if duplicate GAME with matching platform (case-insensitive)', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue({ id: 1 });

        const result = await isDuplicate('Test Game', CollectionItemType.GAME, 'ps4');

        expect(prisma.collectionItem.findFirst).toHaveBeenCalledWith({
            where: {
                name: { equals: 'Test Game', mode: 'insensitive' },
                type: CollectionItemType.GAME,
                gameDetails: {
                    platform: {
                        name: { equals: 'ps4', mode: 'insensitive' },
                    },
                },
            },
        });

        expect(result).toBe(true);
    });

    it('returns false if no duplicate GAME found', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);

        const result = await isDuplicate('Test Game', CollectionItemType.GAME, 'PS4');

        expect(result).toBe(false);
    });

    it('returns true if duplicate MOVIE with matching discFormat (case-insensitive)', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue({ id: 2 });

        const result = await isDuplicate('Test Movie', CollectionItemType.MOVIE, undefined, 'bluray');

        expect(prisma.collectionItem.findFirst).toHaveBeenCalledWith({
            where: {
                name: { equals: 'Test Movie', mode: 'insensitive' },
                type: CollectionItemType.MOVIE,
                movieDetails: {
                    discFormat: { equals: 'bluray', mode: 'insensitive' },
                },
            },
        });

        expect(result).toBe(true);
    });

    it('returns true if duplicate SHOW with matching discFormat (case-insensitive)', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue({ id: 3 });

        const result = await isDuplicate('Test Show', CollectionItemType.SHOW, undefined, 'dvd');

        expect(prisma.collectionItem.findFirst).toHaveBeenCalledWith({
            where: {
                name: { equals: 'Test Show', mode: 'insensitive' },
                type: CollectionItemType.SHOW,
                showDetails: {
                    discFormat: { equals: 'dvd', mode: 'insensitive' },
                },
            },
        });

        expect(result).toBe(true);
    });

    it('returns false if no duplicate MOVIE or SHOW found', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);

        const movieResult = await isDuplicate('Test Movie', CollectionItemType.MOVIE, undefined, 'bluray');
        const showResult = await isDuplicate('Test Show', CollectionItemType.SHOW, undefined, 'dvd');

        expect(movieResult).toBe(false);
        expect(showResult).toBe(false);
    });

    it('returns true if duplicate by name and type only', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue({ id: 4 });

        const result = await isDuplicate('Generic Item', CollectionItemType.MOVIE);

        expect(prisma.collectionItem.findFirst).toHaveBeenCalledWith({
            where: {
                name: { equals: 'Generic Item', mode: 'insensitive' },
                type: CollectionItemType.MOVIE,
            },
        });

        expect(result).toBe(true);
    });

    it('returns false if no duplicate by name and type only', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);

        const result = await isDuplicate('Generic Item', CollectionItemType.MOVIE);

        expect(result).toBe(false);
    });
});
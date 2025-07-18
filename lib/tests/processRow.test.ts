import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processRow } from '@lib/helpers/processRow';
import prisma from '@lib/db';

vi.mock('@lib/db', () => ({
    default: {
        collectionItem: {
            create: vi.fn(),
            findFirst: vi.fn(),
        },
        platform: {
            findUnique: vi.fn(),
        },
    },
}));

describe('processRow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully create a GAME item with valid data', async () => {
        (prisma.platform.findUnique as any).mockResolvedValue({ id: 123, name: 'PS4' });
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockResolvedValue({ id: 1 });

        const row = {
            name: 'Test Game',
            type: 'GAME',
            status: 'owned',
            platform: 'PS4',
            developer: 'Dev Studio',
            publisher: 'Pub Inc',
        };

        const result = await processRow(row, 0);

        expect(result.success).toBe(true);
        expect(prisma.platform.findUnique).toHaveBeenCalledWith({ where: { name: 'PS4' } });
        expect(prisma.collectionItem.create).toHaveBeenCalled();
    });

    it('should fail when platform is invalid for GAME', async () => {
        (prisma.platform.findUnique as any).mockResolvedValue(null);

        const row = {
            name: 'Test Game',
            type: 'GAME',
            platform: 'InvalidPlatform',
        };

        const result = await processRow(row, 1);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid or missing platform');
    });

    it('should successfully create a MOVIE with valid details', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockResolvedValue({ id: 2 });

        const row = {
            name: 'Test Movie',
            type: 'movie',
            discFormat: 'bluray',
            runtimeMinutes: '120',
            director: 'Director Name',
            writer: 'Writer Name',
        };

        const result = await processRow(row, 2);

        expect(result.success).toBe(true);
        expect(prisma.collectionItem.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    type: 'MOVIE',
                    movieDetails: {
                        create: expect.objectContaining({
                            discFormat: 'BLURAY',
                            runtimeMinutes: 120,
                            director: 'Director Name',
                            writer: 'Writer Name',
                        }),
                    },
                }),
            })
        );

    });

    it('should fail if MOVIE discFormat is invalid', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        const row = {
            name: 'Test Movie',
            type: 'movie',
            discFormat: 'invalidformat',
        };

        const result = await processRow(row, 3);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid or missing');
    });

    it('should successfully create a SHOW with valid details', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockResolvedValue({ id: 3 });

        const row = {
            name: 'Test Show',
            type: 'show',
            seasonCount: '5',
            discFormat: 'dvd',
        };

        const result = await processRow(row, 4);

        expect(result.success).toBe(true);
        expect(prisma.collectionItem.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    type: 'SHOW',
                    showDetails: {
                        create: expect.objectContaining({
                            seasonCount: 5,
                            discFormat: 'DVD',
                        }),
                    }
                }),
            }),
        );
    });

    it('should succeed with missing optional fields and default status to OWNED', async () => {
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockResolvedValue({ id: 4 });

        const row = {
            name: 'No Status Item',
            type: 'game',
            platform: 'PS4',
        };

        (prisma.platform.findUnique as any).mockResolvedValue({ id: 123, name: 'PS4' });

        const result = await processRow(row, 5);

        expect(result.success).toBe(true);
        expect(prisma.collectionItem.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: 'OWNED',
                }),
            }),
        );
    });

    it('should default invalid status to OWNED', async () => {
        (prisma.platform.findUnique as any).mockResolvedValue({ id: 123, name: 'PS4' });
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockResolvedValue({ id: 5 });

        const row = {
            name: 'Invalid Status Item',
            type: 'game',
            status: 'unknownstatus',
            platform: 'PS4',
        };

        const result = await processRow(row, 6);

        expect(result.success).toBe(true);
        expect(prisma.collectionItem.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: 'OWNED',
                }),
            }),
        );
    });

    it('should connect or create franchise when franchiseName provided', async () => {
        (prisma.platform.findUnique as any).mockResolvedValue({ id: 123, name: 'PS4' });
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockResolvedValue({ id: 6 });

        const row = {
            name: 'Franchise Item',
            type: 'game',
            platform: 'PS4',
            franchiseName: 'Cool Franchise',
        };

        const result = await processRow(row, 7);

        expect(result.success).toBe(true);
        expect(prisma.collectionItem.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    franchise: {
                        connectOrCreate: {
                            where: { name: 'Cool Franchise' },
                            create: { name: 'Cool Franchise' },
                        },
                    },
                }),
            }),
        );
    });

    it('should succeed if franchiseName is missing or empty', async () => {
        (prisma.platform.findUnique as any).mockResolvedValue({ id: 123, name: 'PS4' });
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockResolvedValue({ id: 7 });

        const row = {
            name: 'No Franchise Item',
            type: 'game',
            platform: 'PS4',
            franchiseName: '',
        };

        const result = await processRow(row, 8);

        expect(result.success).toBe(true);
        expect(prisma.collectionItem.create).toHaveBeenCalledWith(
            expect.not.objectContaining({
                franchise: expect.anything(),
            }),
        );
    });

    it('should trim whitespace and handle case-insensitivity and numeric strings', async () => {
        (prisma.platform.findUnique as any).mockResolvedValue({ id: 123, name: 'ps4' });
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockResolvedValue({ id: 8 });

        const row = {
            name: '  Trimmed Name  ',
            type: 'Game',
            status: 'OwNeD',
            platform: ' ps4 ',
            releaseYear: '2020',
            discFormat: 'dvd',
        };

        const result = await processRow(row, 9);

        expect(result.success).toBe(true);
        expect(prisma.collectionItem.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    name: 'Trimmed Name',
                    type: 'GAME',
                    status: 'OWNED',
                    releaseYear: 2020,
                }),
            }),
        );
    });

    it('should return error on database create failure', async () => {
        (prisma.platform.findUnique as any).mockResolvedValue({ id: 123, name: 'PS4' });
        (prisma.collectionItem.findFirst as any).mockResolvedValue(null);
        (prisma.collectionItem.create as any).mockRejectedValue(new Error('DB failure'));

        const row = {
            name: 'Fail DB',
            type: 'game',
            platform: 'PS4',
        };

        const result = await processRow(row, 10);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Database error');
    });

    it('should fail if platform missing from DB for game', async () => {
        (prisma.platform.findUnique as any).mockResolvedValue(null);

        const row = {
            name: 'Missing Platform',
            type: 'game',
            platform: 'PS4',
        };

        const result = await processRow(row, 11);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Platform not found in DB');
    });
});

import prisma from "@lib/db";
import { rawItemSchema } from "@lib/validation/collectionItem";
import { isDuplicate } from "@lib/helpers/duplicateRow";
import { MediaFormat, CollectionItemType, Status } from "@/generated/prisma";

const VALID_TYPES = Object.values(CollectionItemType);
const VALID_STATUSES = Object.values(Status);
const VALID_FORMATS = Object.values(MediaFormat);

const VALID_PLATFORMS = [
    "PS1", "PS2", "PS3", "PS4", "PS5", "PSP", "PS Vita", "Xbox", "Xbox 360", "Xbox One", "Xbox Series X|S", "Nintendo Entertainment System (NES)", "Super Nintendo (SNES)", "Nintendo 64", "GameCube", "Wii", "Wii U", "Nintendo Switch",
    "Nintendo Switch 2", "Game Boy", "Game Boy Color", "Game Boy Advance", "Nintendo DS", "Nintendo 3DS", "PC", "Sega Genesis", "Sega Saturn", "Sega Dreamcast", "Atari 2600", "Atari Jaguar", "Atari Lynx", "Commodore 64", "Neo Geo", "Mega Drive"
];

const cleanString = (value: unknown): string | undefined =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

export async function processRow(row: any, rowIndex: number): Promise<{
    success: boolean;
    rowIndex: number;
    itemName?: string;
    error?: string;
}> {
    const parsed = rawItemSchema.safeParse(row);
    if (!parsed.success) {
        return { success: false, rowIndex, error: "Invalid data shape" };
    }

    const cleanedRow = parsed.data;

    const name = cleanString(cleanedRow.name);
    const rawType = cleanString(cleanedRow.type);
    const type = rawType
        ? (VALID_TYPES.find(t => t.toLowerCase() === rawType.toLowerCase()) as CollectionItemType | undefined)
        : undefined;

    if (!name || !type) {
        return { success: false, rowIndex, error: "Missing or invalid name/type" };
    }

    const rawStatus = cleanString(cleanedRow.status);
    const status = VALID_STATUSES.find(s => s.toLowerCase() === rawStatus?.toLowerCase()) as Status || "OWNED";

    const description = cleanString(cleanedRow.description);
    const releaseYear = Number.isFinite(Number(cleanedRow.releaseYear)) ? Number(cleanedRow.releaseYear) : undefined;

    const itemData: any = {
        name,
        type,
        status,
        description,
        releaseYear,
    };

    const franchiseName = cleanString(cleanedRow.franchiseName);
    if (franchiseName) {
        itemData.franchise = {
            connectOrCreate: {
                where: { name: franchiseName },
                create: { name: franchiseName },
            },
        };
    }

    try {
        if (type === "GAME") {
            const platformName = cleanString(cleanedRow.platform);
            const platform = VALID_PLATFORMS.find(p => p.toLowerCase() === platformName?.toLowerCase());

            if (!platform) {
                return { success: false, rowIndex, error: `Invalid or missing platform for GAME item: ${name}` };
            }

            const platformRecord = await prisma.platform.findUnique({ where: { name: platform } });
            if (!platformRecord) {
                return { success: false, rowIndex, error: `Platform not found in DB: ${platform}` };
            }

            itemData.gameDetails = {
                create: {
                    platformId: platformRecord.id,
                    developer: cleanString(cleanedRow.developer),
                    publisher: cleanString(cleanedRow.publisher),
                },
            };
        }

        if (type === "MOVIE") {
            const runtimeMinutes = Number.isFinite(Number(cleanedRow.runtimeMinutes))
                ? Number(cleanedRow.runtimeMinutes)
                : undefined;

            const rawDiscFormat = cleanString(cleanedRow.discFormat);
            const discFormat = VALID_FORMATS.find(f => f.toLowerCase() === rawDiscFormat?.toLowerCase()) as MediaFormat | undefined;

            if (!discFormat) {
                return { success: false, rowIndex, error: `Invalid or missing disc format for MOVIE item: ${name}` };
            }

            itemData.movieDetails = {
                create: {
                    director: cleanString(cleanedRow.director),
                    writer: cleanString(cleanedRow.writer),
                    runtimeMinutes,
                    discFormat,
                },
            };
        }

        if (type === "SHOW") {
            const seasonCount = Number.isFinite(Number(cleanedRow.seasonCount))
                ? Number(cleanedRow.seasonCount)
                : undefined;

            const rawDiscFormat = cleanString(cleanedRow.discFormat);
            const discFormat = VALID_FORMATS.find(f => f.toLowerCase() === rawDiscFormat?.toLowerCase()) as MediaFormat | undefined;

            if (!discFormat) {
                return { success: false, rowIndex, error: `Invalid or missing disc format for SHOW item: ${name}` };
            }

            itemData.showDetails = {
                create: {
                    seasonCount,
                    discFormat,
                },
            };
        }

        const duplicate = await isDuplicate(
            name,
            type,
            type === "GAME" ? cleanedRow.platform : undefined,
            type === "MOVIE" || type === "SHOW" ? cleanedRow.discFormat : undefined
        );

        if (duplicate) {
            return {
                success: false,
                rowIndex,
                itemName: name,
                error: `Duplicate item: "${name}" (${type})`,
            };
        }

        await prisma.collectionItem.create({ data: itemData });
        return { success: true, rowIndex, itemName: name };
    } catch (error) {
        console.error(`Failed to import item "${name}"`, error);
        return {
            success: false,
            rowIndex,
            itemName: name,
            error: `Database error for item "${name}"`,
        };
    }
}
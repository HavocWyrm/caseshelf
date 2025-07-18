import { z } from "zod";

export const rawItemSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    releaseYear: z.union([z.string(), z.number()]).optional(),
    franchiseName: z.string().optional(),
    platform: z.string().optional(),
    developer: z.string().optional(),
    publisher: z.string().optional(),
    director: z.string().optional(),
    writer: z.string().optional(),
    runtimeMinutes: z.union([z.string(), z.number()]).optional(),
    discFormat: z.string().optional(),
    seasonCount: z.union([z.string(), z.number()]).optional(),
});

export type RawItem = z.infer<typeof rawItemSchema>;
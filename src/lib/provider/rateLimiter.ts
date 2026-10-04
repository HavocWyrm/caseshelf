import "server-only";
import { Provider } from "@/types/setting";

type Bucket = {
    capacity: number;
    refillPerSecond: number;
    tokens: number;
    updatedAt: number;
};

const LIMIT: Record<Provider, { capacity: number; refillPerSecond: number }> = {
    tmdb: { capacity: 20, refillPerSecond: 20 },
    igdb: { capacity: 4, refillPerSecond: 4 },
};

const buckets = new Map<Provider, Bucket>();

function bucketFor(provider: Provider): Bucket {
    let bucket = buckets.get(provider);
    if (!bucket) {
        bucket = { ...LIMIT[provider], tokens: LIMIT[provider].capacity, updatedAt: Date.now() };
        buckets.set(provider, bucket);
    }
    return bucket;
}

export async function acquireToken(provider: Provider): Promise<void> {
    const bucket = bucketFor(provider);
    for (; ;) {
        const now = Date.now();
        const elapsedSeconds = (now - bucket.updatedAt) / 1000;
        bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsedSeconds * bucket.refillPerSecond);
        bucket.updatedAt = now;
        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            return;
        }
        const waitMs = Math.ceil(((1 - bucket.tokens) / bucket.refillPerSecond) * 1000);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
}

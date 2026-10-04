// Must use ISO 3166-1
import "server-only";
export const METADATA_REGION = (process.env.METADATA_REGION || "GB").toUpperCase();

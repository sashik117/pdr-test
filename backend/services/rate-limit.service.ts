import { Collection } from "mongodb";
import { connectToDatabase } from "../utils/connection";
import config from "../config";
import logger from "../utils/logger";

interface RateLimitEntry {
    _id?: string;
    key: string;
    points: number;
    expireAt: Date;
}

export class RateLimitService {
    private collectionName = "rate_limits";

    private async getCollection(): Promise<Collection<RateLimitEntry>> {
        const db = await connectToDatabase();
        return db.collection<RateLimitEntry>(this.collectionName);
    }

    async consume(
        key: string,
        pointsToConsume: number = 1,
    ): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
        const collection = await this.getCollection();
        const now = new Date();
        const windowMs = config.RATE_LIMIT_WINDOW_MS;
        const maxPoints = config.RATE_LIMIT_MAX_REQUESTS;

        const existing = await collection.findOne({ key });

        if (!existing || existing.expireAt < now) {
            const expireAt = new Date(now.getTime() + windowMs);
            await collection.updateOne(
                { key },
                {
                    $set: {
                        points: maxPoints - pointsToConsume,
                        expireAt,
                    },
                },
                { upsert: true },
            );
            return { allowed: true, remaining: maxPoints - pointsToConsume };
        }

        if (existing.points < pointsToConsume) {
            const retryAfter = Math.ceil(
                (existing.expireAt.getTime() - now.getTime()) / 1000,
            );
            return { allowed: false, remaining: 0, retryAfter };
        }

        await collection.updateOne(
            { key },
            { $inc: { points: -pointsToConsume } },
        );

        return { allowed: true, remaining: existing.points - pointsToConsume };
    }

    async createIndex() {
        try {
            const collection = await this.getCollection();
            await collection.createIndex(
                { expireAt: 1 },
                { expireAfterSeconds: 0 },
            );
            logger.info("Rate limit TTL index created");
        } catch (error) {
            logger.error("Failed to create rate limit index", { error });
        }
    }
}

export const rateLimitService = new RateLimitService();

import {
    EventHandler,
    H3Event,
    getRequestHeader,
    readBody,
    createError,
} from "h3";
import { getIdempotencyKeysCollection } from "../models/idempotency.model";
import logger from "../utils/logger";

export const defineIdempotentEventHandler = (handler: EventHandler) => {
    return defineEventHandler(async (event: H3Event) => {
        const key = getRequestHeader(event, "idempotency-key");

        if (!key) {
            return handler(event);
        }

        const collection = await getIdempotencyKeysCollection();
        const existing = await collection.findOne({ key });

        if (existing) {
            if (existing.status === "processing") {
                throw createError({
                    statusCode: 409,
                    message: "Request is currently being processed",
                });
            }

            if (existing.status === "completed") {
                logger.info(`Idempotency hit for key: ${key}`);
                return existing.response;
            }

            if (existing.status === "failed") {
                throw createError({
                    statusCode: existing.statusCode || 500,
                    message:
                        existing.response?.message || "Previous request failed",
                });
            }
        }

        await collection.insertOne({
            key,
            path: event.path,
            method: event.method,
            status: "processing",
            createdAt: new Date(),
            expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        try {
            const response = await handler(event);

            await collection.updateOne(
                { key },
                {
                    $set: {
                        status: "completed",
                        response,
                        statusCode: 200,
                    },
                },
            );

            return response;
        } catch (error: any) {
            await collection.updateOne(
                { key },
                {
                    $set: {
                        status: "failed",
                        response: { message: error.message },
                        statusCode: error.statusCode || 500,
                    },
                },
            );
            throw error;
        }
    });
};

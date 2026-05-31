import { defineEventHandler, getRequestHeader, createError } from "h3";
import { rateLimitService } from "../services/rate-limit.service";
import logger from "../utils/logger";

export default defineEventHandler(async (event) => {
    if (!event.path.startsWith("/api")) {
        return;
    }

    const ip =
        getRequestHeader(event, "x-forwarded-for") ||
        event.node.req.socket.remoteAddress ||
        "unknown";
    const key = `ip:${ip}`;

    try {
        const result = await rateLimitService.consume(key);

        if (!result.allowed) {
            logger.warn(`Rate limit exceeded for IP: ${ip}`);
            event.node.res.setHeader("Retry-After", result.retryAfter || 60);
            throw createError({
                statusCode: 429,
                message: "Too Many Requests",
            });
        }

        event.node.res.setHeader("X-RateLimit-Remaining", result.remaining);
    } catch (error: any) {
        if (error.statusCode === 429) throw error;
        logger.error("Rate limiter error", { error });
    }
});

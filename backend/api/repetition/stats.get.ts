import { repetitionService } from "../../services/repetition.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;
    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Authorization required",
        });
    }

    try {
        const stats = await repetitionService.getStats(auth.userId);
        return {
            success: true,
            stats
        };
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || "Failed to fetch repetition stats",
        });
    }
});

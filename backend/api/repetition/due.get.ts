import { z } from "zod";
import { repetitionService } from "../../services/repetition.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;
    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Authorization required",
        });
    }

    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 20;

    try {
        const questions = await repetitionService.getDueQuestions(auth.userId, limit);
        return {
            success: true,
            questions
        };
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || "Failed to fetch due questions",
        });
    }
});

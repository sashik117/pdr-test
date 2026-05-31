import { z } from "zod";
import { repetitionService } from "../../services/repetition.service";

const reviewSchema = z.object({
    questionId: z.string(),
    grade: z.number().int().min(0).max(5),
});

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;
    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Authorization required",
        });
    }

    const body = await readBody(event);
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    try {
        const reviewResult = await repetitionService.processReview(
            auth.userId,
            result.data.questionId,
            result.data.grade
        );

        return {
            success: true,
            result: reviewResult
        };
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || "Failed to process review",
        });
    }
});

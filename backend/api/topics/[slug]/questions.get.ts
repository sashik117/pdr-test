import { topicsService } from "../../../services/topics.service";
import { getUserFromEvent } from "../../../utils/auth";
import { slugParamSchema, paginationSchema } from "../../../utils/schemas";

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, "slug");

    const slugResult = slugParamSchema.safeParse({ slug });
    if (!slugResult.success) {
        throw createError({
            statusCode: 400,
            message: slugResult.error.errors[0].message,
        });
    }

    const query = getQuery(event);
    const paginationResult = paginationSchema.safeParse(query);
    if (!paginationResult.success) {
        throw createError({
            statusCode: 400,
            message: paginationResult.error.errors[0].message,
        });
    }

    const user = await getUserFromEvent(event);
    const { page, limit } = paginationResult.data;

    const result = await topicsService.getTopicQuestions(slugResult.data.slug, page, limit, user?.id);

    if (!result.topic) {
        throw createError({
            statusCode: 404,
            message: "Тему не знайдено",
        });
    }

    return result;
});

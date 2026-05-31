import { topicsService } from "../../services/topics.service";
import { getUserFromEvent } from "../../utils/auth";
import { paginationSchema } from "../../utils/schemas";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const result = paginationSchema.safeParse(query);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    const user = await getUserFromEvent(event);
    const topics = await topicsService.getAllTopics(user?.id);
    return { topics };
});

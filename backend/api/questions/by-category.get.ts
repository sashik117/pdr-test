import { questionsService } from "../../services/questions.service";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const category = query.category as string;
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);

    if (!category) {
        throw createError({
            statusCode: 400,
            message: "Категорія обов'язкова",
        });
    }

    const result = await questionsService.getQuestionsByCategory(category, page, limit);

    return {
        questions: result.items,
        pagination: result.pagination,
    };
});

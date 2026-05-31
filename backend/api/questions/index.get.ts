import { questionsService } from "../../services/questions.service";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);
    const category = query.category as string | undefined;
    const ticketNumber = query.ticket ? parseInt(query.ticket as string) : undefined;

    const result = await questionsService.getQuestions(page, limit, category, ticketNumber);

    return {
        questions: result.items,
        pagination: result.pagination,
    };
});

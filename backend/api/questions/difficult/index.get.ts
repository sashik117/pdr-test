import { questionsService } from "../../../services/questions.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;

    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Необхідна авторизація",
        });
    }

    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 20;

    const questions = await questionsService.getDifficultQuestions(auth.userId, limit);
    return { questions };
});

import { questionsService } from "../../../services/questions.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;

    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Необхідна авторизація",
        });
    }

    const questions = await questionsService.getSavedQuestions(auth.userId);
    return { questions };
});

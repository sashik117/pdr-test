import { questionsService } from "../../../services/questions.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;

    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Необхідна авторизація",
        });
    }

    const body = await readBody(event);

    if (!body.questionId) {
        throw createError({
            statusCode: 400,
            message: "ID питання обов'язковий",
        });
    }

    return await questionsService.saveQuestion(auth.userId, body.questionId);
});

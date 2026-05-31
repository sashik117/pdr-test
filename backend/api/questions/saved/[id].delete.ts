import { questionsService } from "../../../services/questions.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;

    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Необхідна авторизація",
        });
    }

    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID питання обов'язковий",
        });
    }

    return await questionsService.unsaveQuestion(auth.userId, id);
});

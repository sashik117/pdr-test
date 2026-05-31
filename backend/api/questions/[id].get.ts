import { questionsService } from "../../services/questions.service";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID питання обов'язковий",
        });
    }

    const question = await questionsService.getQuestionById(id);

    if (!question) {
        throw createError({
            statusCode: 404,
            message: "Питання не знайдено",
        });
    }

    return { question };
});

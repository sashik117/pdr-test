import { adminService } from "../../../services/admin.service";
import { idParamSchema, adminUpdateQuestionSchema } from "../../../utils/schemas";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const idResult = idParamSchema.safeParse({ id });
    if (!idResult.success) {
        throw createError({
            statusCode: 400,
            message: idResult.error.errors[0].message,
        });
    }

    const bodyResult = adminUpdateQuestionSchema.safeParse(body);
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            message: bodyResult.error.errors[0].message,
        });
    }

    const question = await adminService.updateQuestion(idResult.data.id, bodyResult.data);

    if (!question) {
        throw createError({ statusCode: 404, message: "Питання не знайдено" });
    }

    return question;
});

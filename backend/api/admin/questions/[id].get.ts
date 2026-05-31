import { adminService } from "../../../services/admin.service";
import { idParamSchema } from "../../../utils/schemas";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    const result = idParamSchema.safeParse({ id });
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    const question = await adminService.getQuestionById(result.data.id);

    if (!question) {
        throw createError({ statusCode: 404, message: "Питання не знайдено" });
    }

    return question;
});

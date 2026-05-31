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

    const deleted = await adminService.deleteQuestion(result.data.id);

    if (!deleted) {
        throw createError({ statusCode: 404, message: "Питання не знайдено" });
    }

    return { success: true };
});

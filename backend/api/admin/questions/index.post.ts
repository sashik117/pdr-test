import { adminService } from "../../../services/admin.service";
import { adminCreateQuestionSchema } from "../../../utils/schemas";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const result = adminCreateQuestionSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    return await adminService.createQuestion(result.data);
});

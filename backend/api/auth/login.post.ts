import { authService } from "../../services/auth.service";
import { loginSchema } from "../../utils/schemas";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const result = loginSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    try {
        return await authService.login(result.data.email, result.data.password);
    } catch (error: any) {
        if (error.code === "EMAIL_NOT_VERIFIED") {
            throw createError({
                statusCode: 403,
                message: "Email не підтверджено. Перевірте вашу пошту для підтвердження облікового запису",
                data: error.data,
            });
        }
        throw createError({
            statusCode: 401,
            message: error.message,
        });
    }
});

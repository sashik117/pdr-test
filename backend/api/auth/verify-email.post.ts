import { authService } from "../../services/auth.service";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.token) {
        throw createError({
            statusCode: 400,
            message: "Токен підтвердження обов'язковий",
        });
    }

    try {
        return await authService.verifyEmail(body.token);
    } catch (error: any) {
        throw createError({
            statusCode: 400,
            message: error.message,
        });
    }
});

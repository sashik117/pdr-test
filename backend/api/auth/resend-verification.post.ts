import { authService } from "../../services/auth.service";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email) {
        throw createError({
            statusCode: 400,
            message: "Email обов'язковий",
        });
    }

    try {
        return await authService.resendVerification(body.email);
    } catch (error: any) {
        throw createError({
            statusCode: 400,
            message: error.message,
        });
    }
});

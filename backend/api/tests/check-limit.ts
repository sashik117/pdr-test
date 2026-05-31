import { testsService } from "../../services/tests.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;

    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Необхідна авторизація",
        });
    }

    try {
        const result = await testsService.checkDailyLimit(auth.userId);
        return result;
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            message: e.message,
        });
    }
});

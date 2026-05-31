import { testsService } from "../../services/tests.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;

    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Необхідна авторизація",
        });
    }

    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);

    return await testsService.getHistory(auth.userId, page, limit);
});

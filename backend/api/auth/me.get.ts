import { authService } from "../../services/auth.service";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;

    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Необхідна авторизація",
        });
    }

    const user = await authService.getUserById(auth.userId);

    if (!user) {
        throw createError({
            statusCode: 404,
            message: "Користувача не знайдено",
        });
    }

    return { user };
});

import { authService } from "../../services/auth.service";
import { registerSchema } from "../../utils/schemas";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const result = registerSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    try {
        return await authService.register(
            result.data.email,
            result.data.password,
            result.data.name
        );
    } catch (error: any) {
        throw createError({
            statusCode: 400,
            message: error.message,
        });
    }
});

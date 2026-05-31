import { testsService } from "../../services/tests.service";
import { submitTestSchema } from "../../utils/schemas";

export default defineEventHandler(async (event) => {
    const auth = event.context.auth;

    if (!auth) {
        throw createError({
            statusCode: 401,
            message: "Необхідна авторизація",
        });
    }

    const body = await readBody(event);

    const result = submitTestSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    const testResult = await testsService.submitTest(auth.userId, result.data);

    return {
        success: true,
        ...testResult,
    };
});

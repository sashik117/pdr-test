import { theoryService } from "../../services/theory.service";
import { slugParamSchema } from "../../utils/schemas";

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, "slug");

    const result = slugParamSchema.safeParse({ slug });
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    const theory = await theoryService.getTheoryBySlug(result.data.slug);

    if (!theory) {
        throw createError({
            statusCode: 404,
            message: "Контент не знайдено",
        });
    }

    return theory;
});

import { getUserFromEvent } from "../../../utils/auth";
import { parserService } from "../../../services/parser.service";

export default defineEventHandler(async (event) => {
    const user = await getUserFromEvent(event);

    if (!user || user.role !== "admin") {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden - Admin access required"
        });
    }

    const result = await parserService.startTheoryParse();

    if (!result.success) {
        throw createError({
            statusCode: 409,
            statusMessage: result.message
        });
    }

    return {
        success: true,
        message: result.message,
        startedAt: new Date(),
    };
});

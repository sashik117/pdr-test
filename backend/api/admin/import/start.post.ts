import { parserService } from "../../../services/parser.service";
import { getUserFromEvent } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
    const user = await getUserFromEvent(event);

    if (!user || user.role !== "admin") {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden - Admin access required"
        });
    }

    const jobId = await parserService.startImport();

    return {
        success: true,
        jobId,
        message: "Import started"
    };
});

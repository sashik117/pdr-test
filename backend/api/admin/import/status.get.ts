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

    const query = getQuery(event);
    const jobId = query.jobId as string;

    if (!jobId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Job ID is required"
        });
    }

    const status = await parserService.getImportStatus(jobId);

    if (!status) {
        throw createError({
            statusCode: 404,
            statusMessage: "Import job not found"
        });
    }

    return {
        id: status._id?.toString(),
        startedAt: status.startedAt,
        completedAt: status.completedAt,
        status: status.status,
        questionsImported: status.questionsImported,
        imagesDownloaded: status.imagesDownloaded,
        errorsCount: status.errors?.length || 0,
        logsCount: status.logs?.length || 0
    };
});

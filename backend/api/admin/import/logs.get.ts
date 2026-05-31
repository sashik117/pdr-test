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
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);

    const { logs, total } = await parserService.getImportLogs(page, limit);

    return {
        logs: logs.map(log => ({
            id: log._id?.toString(),
            startedAt: log.startedAt,
            completedAt: log.completedAt,
            status: log.status,
            questionsImported: log.questionsImported,
            imagesDownloaded: log.imagesDownloaded,
            errorsCount: log.errors?.length || 0
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
});

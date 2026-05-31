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

    const status = parserService.getTheoryParseStatus();

    return status;
});

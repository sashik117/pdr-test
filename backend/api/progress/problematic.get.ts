import { progressService } from "../../services/progress.service";
import { getUserFromEvent } from "../../utils/auth";

export default defineEventHandler(async (event) => {
    const user = await getUserFromEvent(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    return await progressService.getProblematicAreas(user.id);
});

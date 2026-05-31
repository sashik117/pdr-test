import { theoryService } from "../../services/theory.service";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const type = query.type as string | undefined;

    return await theoryService.getTheoryList(type);
});

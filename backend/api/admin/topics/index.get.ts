import { topicsService } from "../../../services/topics.service";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const topics = await topicsService.getAllTopics();

    setResponseHeader(event, "X-Total-Count", topics.length.toString());
    setResponseHeader(event, "Access-Control-Expose-Headers", "X-Total-Count");

    return topics.map((t: any) => ({
        id: t._id?.toString() || t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        difficulty: t.difficulty,
        questionCount: t.questionCount,
        order: t.order,
    }));
});

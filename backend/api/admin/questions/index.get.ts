import { getQuestionsCollection } from "../../../utils/db";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const page = parseInt(query._start as string) || 0;
    const limit = parseInt(query._end as string) || 10;
    const skip = page;
    const perPage = limit - page;

    const sortField = (query._sort as string) || "ticketNumber";
    const sortOrder = (query._order as string) === "DESC" ? -1 : 1;

    const filter: Record<string, unknown> = {};

    if (query.questionId) {
        filter.questionId = {
            $regex: query.questionId as string,
            $options: "i",
        };
    }

    if (query.ticketNumber) {
        filter.ticketNumber = parseInt(query.ticketNumber as string);
    }

    if (query.category) {
        filter.category = query.category as string;
    }

    if (query.text) {
        filter.text = { $regex: query.text as string, $options: "i" };
    }

    if (query.q) {
        filter.$or = [
            { questionId: { $regex: query.q as string, $options: "i" } },
            { text: { $regex: query.q as string, $options: "i" } },
            { explanation: { $regex: query.q as string, $options: "i" } },
        ];
    }

    const questions = await getQuestionsCollection();

    const [items, total] = await Promise.all([
        questions
            .find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(perPage)
            .toArray(),
        questions.countDocuments(filter),
    ]);

    setResponseHeader(event, "X-Total-Count", total.toString());
    setResponseHeader(event, "Access-Control-Expose-Headers", "X-Total-Count");

    return items.map((q) => ({
        id: q._id?.toString(),
        questionId: q.questionId,
        ticketNumber: q.ticketNumber,
        questionNumber: q.questionNumber,
        text: q.text,
        imageUrl: q.imageUrl,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        category: q.category,
    }));
});

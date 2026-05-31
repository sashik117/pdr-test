import { questionsService } from "../../services/questions.service";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const count = parseInt(query.count as string) || 20;

    const questions = await questionsService.getRandomQuestions(count);
    return { questions };
});

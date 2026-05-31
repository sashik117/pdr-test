import { questionsService } from "../../services/questions.service";

export default defineEventHandler(async () => {
    const categories = await questionsService.getCategories();
    return { categories };
});

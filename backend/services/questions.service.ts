import { getQuestionsCollection, Question } from "../models/question.model";
import { getUserSavedQuestionsCollection } from "../models/user_saved_question.model";
import { getTestResultsCollection } from "../models/test_result.model";
import logger from "../utils/logger";
import { ObjectId } from "mongodb";

export interface QuestionDTO {
    id: string;
    questionId: string;
    ticketNumber: number;
    questionNumber: number;
    text: string;
    imageUrl: string | null;
    options: { id: string; text: string }[];
    category: string;
    topic?: string;
    difficulty?: number;
    correctAnswer?: string;
    explanation?: string;
}

export interface PaginatedResult<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class QuestionsService {
    async getQuestions(
        page: number = 1,
        limit: number = 20,
        category?: string,
        ticketNumber?: number
    ): Promise<PaginatedResult<QuestionDTO>> {
        const questionsCollection = await getQuestionsCollection();
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (category) filter.category = category;
        if (ticketNumber) filter.ticketNumber = ticketNumber;

        const [items, total] = await Promise.all([
            questionsCollection.find(filter).skip(skip).limit(limit).toArray(),
            questionsCollection.countDocuments(filter),
        ]);

        return {
            items: items.map(q => ({
                id: q._id?.toString() || "",
                questionId: q.questionId,
                ticketNumber: q.ticketNumber,
                questionNumber: q.questionNumber,
                text: q.text,
                imageUrl: q.imageUrl,
                options: q.options,
                category: q.category,
                topic: q.topic,
                difficulty: q.difficulty,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getQuestionById(id: string): Promise<QuestionDTO | null> {
        const questionsCollection = await getQuestionsCollection();

        let question;
        try {
            question = await questionsCollection.findOne({ _id: new ObjectId(id) as any });
        } catch {
            question = await questionsCollection.findOne({ questionId: id });
        }

        if (!question) return null;

        return {
            id: question._id?.toString() || "",
            questionId: question.questionId,
            ticketNumber: question.ticketNumber,
            questionNumber: question.questionNumber,
            text: question.text,
            imageUrl: question.imageUrl,
            options: question.options,
            category: question.category,
            topic: question.topic,
            difficulty: question.difficulty,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
        };
    }

    async getCategories(): Promise<{ name: string; count: number }[]> {
        const questionsCollection = await getQuestionsCollection();

        const categories = await questionsCollection.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]).toArray();

        return categories.map(c => ({
            name: c._id as string,
            count: c.count as number,
        }));
    }

    async getQuestionsByCategory(category: string, page: number = 1, limit: number = 20): Promise<PaginatedResult<QuestionDTO>> {
        return this.getQuestions(page, limit, category);
    }

    async getRandomQuestions(count: number = 20): Promise<QuestionDTO[]> {
        const questionsCollection = await getQuestionsCollection();

        const questions = await questionsCollection
            .aggregate([{ $sample: { size: count } }])
            .toArray();

        return questions.map(q => ({
            id: q._id?.toString() || "",
            questionId: q.questionId,
            ticketNumber: q.ticketNumber,
            questionNumber: q.questionNumber,
            text: q.text,
            imageUrl: q.imageUrl,
            options: q.options,
            category: q.category,
            topic: q.topic,
            difficulty: q.difficulty,
        }));
    }

    async getDifficultQuestions(userId: string, limit: number = 20): Promise<QuestionDTO[]> {
        const questionsCollection = await getQuestionsCollection();

        const questions = await questionsCollection
            .find({ difficulty: { $gte: 4 } })
            .limit(limit)
            .toArray();

        return questions.map(q => ({
            id: q._id?.toString() || "",
            questionId: q.questionId,
            ticketNumber: q.ticketNumber,
            questionNumber: q.questionNumber,
            text: q.text,
            imageUrl: q.imageUrl,
            options: q.options,
            category: q.category,
            topic: q.topic,
            difficulty: q.difficulty,
        }));
    }

    async getMistakes(userId: string): Promise<QuestionDTO[]> {
        const testResultsCollection = await getTestResultsCollection();
        const questionsCollection = await getQuestionsCollection();

        const results = await testResultsCollection.find({ userId }).toArray();

        const mistakeIds = new Set<string>();
        for (const result of results) {
            if (result.answers) {
                for (const answer of result.answers) {
                    if (!answer.correct) {
                        mistakeIds.add(answer.questionId);
                    }
                }
            }
        }

        if (mistakeIds.size === 0) return [];

        const questions = await questionsCollection
            .find({ questionId: { $in: Array.from(mistakeIds) } })
            .toArray();

        return questions.map(q => ({
            id: q._id?.toString() || "",
            questionId: q.questionId,
            ticketNumber: q.ticketNumber,
            questionNumber: q.questionNumber,
            text: q.text,
            imageUrl: q.imageUrl,
            options: q.options,
            category: q.category,
            topic: q.topic,
            difficulty: q.difficulty,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
        }));
    }

    async getSavedQuestions(userId: string): Promise<QuestionDTO[]> {
        const savedCollection = await getUserSavedQuestionsCollection();
        const questionsCollection = await getQuestionsCollection();

        const saved = await savedCollection.find({ userId }).toArray();
        const questionIds = saved.map(s => s.questionId);

        if (questionIds.length === 0) return [];

        const questions = await questionsCollection
            .find({ questionId: { $in: questionIds } })
            .toArray();

        return questions.map(q => ({
            id: q._id?.toString() || "",
            questionId: q.questionId,
            ticketNumber: q.ticketNumber,
            questionNumber: q.questionNumber,
            text: q.text,
            imageUrl: q.imageUrl,
            options: q.options,
            category: q.category,
            topic: q.topic,
            difficulty: q.difficulty,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
        }));
    }

    async saveQuestion(userId: string, questionId: string): Promise<{ success: boolean }> {
        const savedCollection = await getUserSavedQuestionsCollection();

        const existing = await savedCollection.findOne({ userId, questionId });
        if (existing) {
            return { success: true };
        }

        await savedCollection.insertOne({
            userId,
            questionId,
            savedAt: new Date(),
        });

        logger.info(`User ${userId} saved question ${questionId}`);

        return { success: true };
    }

    async unsaveQuestion(userId: string, questionId: string): Promise<{ success: boolean }> {
        const savedCollection = await getUserSavedQuestionsCollection();
        await savedCollection.deleteOne({ userId, questionId });

        logger.info(`User ${userId} unsaved question ${questionId}`);

        return { success: true };
    }
}

export const questionsService = new QuestionsService();

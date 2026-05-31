import { getTopicsCollection } from "../models/topic.model";
import { getUserProgressCollection } from "../models/user_progress.model";
import { getQuestionsCollection } from "../models/question.model";

export interface TopicWithProgress {
    id: string;
    name: string;
    slug: string;
    description: string;
    difficulty: number;
    questionCount: number;
    order: number;
    userProgress: {
        answeredCorrectly: number;
        totalAttempts: number;
        percentage: number;
    };
}

export interface TopicDetails {
    id: string;
    name: string;
    slug: string;
    description: string;
    difficulty: number;
    questionCount: number;
    order: number;
}

export interface QuestionDTO {
    id: string;
    questionId: string;
    ticketNumber: number;
    questionNumber: number;
    text: string;
    imageUrl: string | null;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
    difficulty: number;
}

export class TopicsService {
    async getAllTopics(userId?: string): Promise<TopicWithProgress[]> {
        const topicsCollection = await getTopicsCollection();
        const progressCollection = await getUserProgressCollection();

        const topics = await topicsCollection.find({}).sort({ order: 1 }).toArray();

        let userProgressMap: Record<string, { answeredCorrectly: number; totalAttempts: number }> = {};

        if (userId) {
            const userProgress = await progressCollection
                .find({ userId })
                .toArray();

            userProgressMap = userProgress.reduce((acc, p) => {
                acc[p.topicSlug] = {
                    answeredCorrectly: p.answeredCorrectly,
                    totalAttempts: p.totalAttempts
                };
                return acc;
            }, {} as Record<string, { answeredCorrectly: number; totalAttempts: number }>);
        }

        return topics.map((topic) => ({
            id: topic._id?.toString() || "",
            name: topic.name,
            slug: topic.slug,
            description: topic.description,
            difficulty: topic.difficulty,
            questionCount: topic.questionCount,
            order: topic.order,
            userProgress: userProgressMap[topic.slug]
                ? {
                    answeredCorrectly: userProgressMap[topic.slug].answeredCorrectly,
                    totalAttempts: userProgressMap[topic.slug].totalAttempts,
                    percentage: topic.questionCount > 0
                        ? Math.round((userProgressMap[topic.slug].answeredCorrectly / topic.questionCount) * 100)
                        : 0
                }
                : {
                    answeredCorrectly: 0,
                    totalAttempts: 0,
                    percentage: 0
                }
        }));
    }

    async getTopicBySlug(slug: string): Promise<TopicDetails | null> {
        const topicsCollection = await getTopicsCollection();
        const topic = await topicsCollection.findOne({ slug });

        if (!topic) {
            return null;
        }

        return {
            id: topic._id?.toString() || "",
            name: topic.name,
            slug: topic.slug,
            description: topic.description,
            difficulty: topic.difficulty,
            questionCount: topic.questionCount,
            order: topic.order
        };
    }

    async getTopicQuestions(
        slug: string,
        page: number = 1,
        limit: number = 20,
        userId?: string
    ): Promise<{
        topic: TopicDetails | null;
        questions: QuestionDTO[];
        userProgress: { answeredCorrectly: number; totalAttempts: number; percentage: number } | null;
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }> {
        const topicsCollection = await getTopicsCollection();
        const questionsCollection = await getQuestionsCollection();
        const progressCollection = await getUserProgressCollection();

        const skip = (page - 1) * limit;

        const topic = await topicsCollection.findOne({ slug });

        if (!topic) {
            return {
                topic: null,
                questions: [],
                userProgress: null,
                pagination: { page, limit, total: 0, totalPages: 0 }
            };
        }

        const [questions, total] = await Promise.all([
            questionsCollection
                .find({ topic: slug })
                .sort({ difficulty: 1, questionNumber: 1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            questionsCollection.countDocuments({ topic: slug })
        ]);

        let userProgress = null;
        if (userId) {
            const progress = await progressCollection.findOne({
                userId,
                topicSlug: slug
            });

            if (progress) {
                userProgress = {
                    answeredCorrectly: progress.answeredCorrectly,
                    totalAttempts: progress.totalAttempts,
                    percentage: total > 0
                        ? Math.round((progress.answeredCorrectly / total) * 100)
                        : 0
                };
            }
        }

        return {
            topic: {
                id: topic._id?.toString() || "",
                name: topic.name,
                slug: topic.slug,
                description: topic.description,
                difficulty: topic.difficulty,
                questionCount: topic.questionCount,
                order: topic.order
            },
            questions: questions.map((q) => ({
                id: q._id?.toString() || "",
                questionId: q.questionId,
                ticketNumber: q.ticketNumber,
                questionNumber: q.questionNumber,
                text: q.text,
                imageUrl: q.imageUrl,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                difficulty: q.difficulty || 3
            })),
            userProgress,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

export const topicsService = new TopicsService();

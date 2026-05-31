import { ObjectId } from "mongodb";
import {
    getUserRepetitionsCollection,
    UserRepetition,
} from "../models/user_repetition.model";
import { getQuestionsCollection } from "../models/question.model";
import logger from "../utils/logger";

interface ReviewResult {
    questionId: string;
    interval: number;
    repetitions: number;
    easeFactor: number;
    nextReviewDate: Date;
}

export class RepetitionService {
    private readonly MIN_EASE_FACTOR = 1.3;
    private readonly INITIAL_EASE_FACTOR = 2.5;

    async processReview(
        userId: string,
        questionId: string,
        grade: number,
    ): Promise<ReviewResult> {
        if (grade < 0 || grade > 5) {
            throw new Error("Grade must be between 0 and 5");
        }

        const repetitionsCollection = await getUserRepetitionsCollection();

        let repetition = await repetitionsCollection.findOne({
            userId,
            questionId,
        });

        let interval = 0;
        let repetitions = 0;
        let easeFactor = this.INITIAL_EASE_FACTOR;
        let history = [];

        if (repetition) {
            interval = repetition.interval;
            repetitions = repetition.repetitions;
            easeFactor = repetition.easeFactor;
            history = repetition.history || [];
        }

        if (grade >= 3) {
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions++;
        } else {
            repetitions = 0;
            interval = 1;
        }

        easeFactor =
            easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        if (easeFactor < this.MIN_EASE_FACTOR) {
            easeFactor = this.MIN_EASE_FACTOR;
        }

        const now = new Date();
        const nextReviewDate = new Date();
        nextReviewDate.setDate(now.getDate() + interval);

        const updateData: Partial<UserRepetition> = {
            userId,
            questionId,
            interval,
            repetitions,
            easeFactor,
            nextReviewDate,
            lastReviewDate: now,
            updatedAt: now,
        };

        const historyItem = {
            date: now,
            grade,
            interval,
            easeFactor,
        };

        if (repetition) {
            await repetitionsCollection.updateOne(
                { _id: repetition._id },
                {
                    $set: updateData,
                    $push: { history: historyItem } as any,
                },
            );
        } else {
            updateData.createdAt = now;
            updateData.history = [historyItem];
            await repetitionsCollection.insertOne(updateData as UserRepetition);
        }

        return {
            questionId,
            interval,
            repetitions,
            easeFactor,
            nextReviewDate,
        };
    }

    async getDueQuestions(userId: string, limit: number = 20): Promise<any[]> {
        const repetitionsCollection = await getUserRepetitionsCollection();
        const questionsCollection = await getQuestionsCollection();

        const now = new Date();

        const dueRepetitions = await repetitionsCollection
            .find({
                userId,
                nextReviewDate: { $lte: now },
            })
            .sort({ nextReviewDate: 1 })
            .limit(limit)
            .toArray();

        if (dueRepetitions.length === 0) {
            return [];
        }

        const questionIds = dueRepetitions.map((r: any) => r.questionId);

        const questions = await questionsCollection
            .find({ questionId: { $in: questionIds } })
            .toArray();

        return dueRepetitions
            .map((rep: any) => {
                const question = questions.find(
                    (q) => q.questionId === rep.questionId,
                );
                return {
                    ...question,
                    repetition: {
                        interval: rep.interval,
                        repetitions: rep.repetitions,
                        nextReviewDate: rep.nextReviewDate,
                    },
                };
            })
            .filter((item: any) => item.questionId);
    }

    async getStats(userId: string) {
        const repetitionsCollection = await getUserRepetitionsCollection();

        const totalCards = await repetitionsCollection.countDocuments({
            userId,
        });

        const learningCount = await repetitionsCollection.countDocuments({
            userId,
            interval: { $lte: 1 },
        });

        const youngCount = await repetitionsCollection.countDocuments({
            userId,
            interval: { $gt: 1, $lte: 21 },
        });

        const matureCount = await repetitionsCollection.countDocuments({
            userId,
            interval: { $gt: 21 },
        });

        const nextReview = await repetitionsCollection.findOne(
            { userId },
            { sort: { nextReviewDate: 1 }, projection: { nextReviewDate: 1 } },
        );

        return {
            totalCards,
            learningCount,
            youngCount,
            matureCount,
            nextReviewDate: nextReview?.nextReviewDate || null,
        };
    }
}

export const repetitionService = new RepetitionService();

import { getQuestionsCollection } from "../models/question.model";
import {
    getTestResultsCollection,
    TestResult,
} from "../models/test_result.model";
import { getUsersCollection } from "../models/user.model";
import { repetitionService } from "./repetition.service";
import { ObjectId } from "mongodb";
import logger from "../utils/logger";

export interface SubmitTestInput {
    questions: string[];
    answers: { questionId: string; answer: string }[];
    startedAt: string;
}

export interface CheckedAnswer {
    questionId: string;
    answer: string;
    correct: boolean;
    correctAnswer: string;
}

export interface TestResultDTO {
    testId: string;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    answers: CheckedAnswer[];
}

export interface TestHistoryItem {
    id: string;
    startedAt: Date;
    completedAt: Date;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
}

export class TestsService {
    async submitTest(
        userId: string,
        input: SubmitTestInput,
    ): Promise<TestResultDTO> {
        const { questions: questionIds, answers, startedAt } = input;

        const questionsCollection = await getQuestionsCollection();
        const testResultsCollection = await getTestResultsCollection();

        const questions = await questionsCollection
            .find({ questionId: { $in: questionIds } })
            .toArray();

        const questionMap = new Map(questions.map((q) => [q.questionId, q]));

        const checkedAnswers: CheckedAnswer[] = answers.map((answer) => {
            const question = questionMap.get(answer.questionId);
            const correct = question
                ? question.correctAnswer === answer.answer
                : false;

            return {
                questionId: answer.questionId,
                answer: answer.answer,
                correct,
                correctAnswer: question?.correctAnswer || "",
            };
        });

        const correctAnswersCount = checkedAnswers.filter(
            (a) => a.correct,
        ).length;
        const totalQuestions = questionIds.length;
        const score = Math.round((correctAnswersCount / totalQuestions) * 100);
        const passed = correctAnswersCount >= Math.ceil(totalQuestions * 0.9);

        const testResult: TestResult = {
            userId,
            startedAt: new Date(startedAt),
            completedAt: new Date(),
            questions: questionIds,
            answers: checkedAnswers,
            score,
            passed,
            totalQuestions,
            correctAnswers: correctAnswersCount,
        };

        const insertResult = await testResultsCollection.insertOne(testResult);

        logger.info(
            `Test submitted by user ${userId}: Score ${score}, Passed ${passed}`,
        );

        try {
            const repetitionUpdates = checkedAnswers.map((ans) => {
                const grade = ans.correct ? 4 : 1;
                return repetitionService.processReview(
                    userId,
                    ans.questionId,
                    grade,
                );
            });

            await Promise.allSettled(repetitionUpdates);
        } catch (error) {
            logger.error(
                `Error updating repetition system for user ${userId}:`,
                error,
            );
        }

        return {
            testId: insertResult.insertedId.toString(),
            score,
            passed,
            totalQuestions,
            correctAnswers: correctAnswersCount,
            answers: checkedAnswers,
        };
    }

    async getHistory(
        userId: string,
        page: number = 1,
        limit: number = 20,
    ): Promise<{
        tests: TestHistoryItem[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const testResultsCollection = await getTestResultsCollection();
        const skip = (page - 1) * limit;

        const [results, total] = await Promise.all([
            testResultsCollection
                .find({ userId })
                .sort({ completedAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            testResultsCollection.countDocuments({ userId }),
        ]);

        return {
            tests: results.map((r) => ({
                id: r._id?.toString() || "",
                startedAt: r.startedAt,
                completedAt: r.completedAt,
                score: r.score,
                passed: r.passed,
                totalQuestions: r.totalQuestions,
                correctAnswers: r.correctAnswers,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async checkDailyLimit(
        userId: string,
    ): Promise<{ allowed: boolean; remaining: number; isPremium: boolean }> {
        const users = await getUsersCollection();
        const user = await users.findOne({ _id: new ObjectId(userId) as any });

        if (user?.isPremium) {
            return { allowed: true, remaining: Infinity, isPremium: true };
        }

        const testResultsCollection = await getTestResultsCollection();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await testResultsCollection.countDocuments({
            userId,
            startedAt: { $gte: startOfDay },
        });

        const limit = 3;
        return {
            allowed: count < limit,
            remaining: Math.max(0, limit - count),
            isPremium: false,
        };
    }
}

export const testsService = new TestsService();

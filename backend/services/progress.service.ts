import { getTopicsCollection } from "../models/topic.model";
import { getUserProgressCollection } from "../models/user_progress.model";
import { getTestResultsCollection } from "../models/test_result.model";
import { getQuestionsCollection } from "../models/question.model";
import logger from "../utils/logger";

export interface OverallProgress {
    totalAnswered: number;
    totalCorrect: number;
    percentage: number;
    testsCompleted: number;
}

export interface TopicProgress {
    topicId: string;
    topicSlug: string;
    name: string;
    difficulty: number;
    questionCount: number;
    answeredCorrectly: number;
    totalAttempts: number;
    percentage: number;
    lastAttemptAt: Date | null;
}

export interface DayStats {
    date: string;
    dayName: string;
    testsCompleted: number;
    questionsAnswered: number;
    correctAnswers: number;
    correctRate: number;
}

export interface WeekStats {
    week: number;
    label: string;
    startDate: string;
    endDate: string;
    testsCompleted: number;
    questionsAnswered: number;
    correctAnswers: number;
    correctRate: number;
}

export interface ProblematicTopic {
    topicSlug: string;
    topicName: string;
    totalAttempts: number;
    mistakes: number;
    errorRate: number;
}

export interface ProblematicQuestion {
    questionId: string;
    text: string;
    topicSlug: string;
    topicName: string;
    mistakeCount: number;
    difficulty: number;
}

export class ProgressService {
    async getUserProgress(userId: string): Promise<{
        overall: OverallProgress;
        byTopic: TopicProgress[];
    }> {
        const topicsCollection = await getTopicsCollection();
        const progressCollection = await getUserProgressCollection();
        const testResultsCollection = await getTestResultsCollection();

        const topics = await topicsCollection
            .find({})
            .sort({ order: 1 })
            .toArray();
        const userProgress = await progressCollection
            .find({ userId })
            .toArray();

        const progressMap = userProgress.reduce(
            (acc, p) => {
                acc[p.topicSlug] = p;
                return acc;
            },
            {} as Record<string, (typeof userProgress)[0]>,
        );

        const testResults = await testResultsCollection
            .find({ userId })
            .toArray();

        let totalAnswered = 0;
        let totalCorrect = 0;

        testResults.forEach((result) => {
            if (result.answers) {
                totalAnswered += result.answers.length;
                totalCorrect += result.answers.filter(
                    (a: any) => a.correct,
                ).length;
            }
        });

        const progressByTopic: TopicProgress[] = topics.map((topic) => {
            const progress = progressMap[topic.slug];
            return {
                topicId: topic._id?.toString() || "",
                topicSlug: topic.slug,
                name: topic.name,
                difficulty: topic.difficulty,
                questionCount: topic.questionCount,
                answeredCorrectly: progress?.answeredCorrectly || 0,
                totalAttempts: progress?.totalAttempts || 0,
                percentage:
                    topic.questionCount > 0 && progress
                        ? Math.round(
                              (progress.answeredCorrectly /
                                  topic.questionCount) *
                                  100,
                          )
                        : 0,
                lastAttemptAt: progress?.lastAttemptAt || null,
            };
        });

        return {
            overall: {
                totalAnswered,
                totalCorrect,
                percentage:
                    totalAnswered > 0
                        ? Math.round((totalCorrect / totalAnswered) * 100)
                        : 0,
                testsCompleted: testResults.length,
            },
            byTopic: progressByTopic,
        };
    }

    async getWeeklyProgress(userId: string): Promise<{
        days: DayStats[];
        totals: {
            testsCompleted: number;
            questionsAnswered: number;
            correctAnswers: number;
            correctRate: number;
        };
    }> {
        const testResultsCollection = await getTestResultsCollection();

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const testResults = await testResultsCollection
            .find({
                userId,
                completedAt: { $gte: weekAgo },
            })
            .sort({ completedAt: 1 })
            .toArray();

        const dayStats: Record<
            string,
            {
                testsCompleted: number;
                questionsAnswered: number;
                correctAnswers: number;
            }
        > = {};

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateKey = date.toISOString().split("T")[0];
            dayStats[dateKey] = {
                testsCompleted: 0,
                questionsAnswered: 0,
                correctAnswers: 0,
            };
        }

        testResults.forEach((result) => {
            const dateKey = new Date(result.completedAt)
                .toISOString()
                .split("T")[0];
            if (dayStats[dateKey]) {
                dayStats[dateKey].testsCompleted++;
                dayStats[dateKey].questionsAnswered +=
                    result.totalQuestions || 0;
                dayStats[dateKey].correctAnswers += result.correctAnswers || 0;
            }
        });

        const days: DayStats[] = Object.entries(dayStats).map(
            ([date, stats]) => ({
                date,
                dayName: new Date(date).toLocaleDateString("uk-UA", {
                    weekday: "short",
                }),
                testsCompleted: stats.testsCompleted,
                questionsAnswered: stats.questionsAnswered,
                correctAnswers: stats.correctAnswers,
                correctRate:
                    stats.questionsAnswered > 0
                        ? Math.round(
                              (stats.correctAnswers / stats.questionsAnswered) *
                                  100,
                          )
                        : 0,
            }),
        );

        const totals = days.reduce(
            (acc, day) => ({
                testsCompleted: acc.testsCompleted + day.testsCompleted,
                questionsAnswered:
                    acc.questionsAnswered + day.questionsAnswered,
                correctAnswers: acc.correctAnswers + day.correctAnswers,
            }),
            { testsCompleted: 0, questionsAnswered: 0, correctAnswers: 0 },
        );

        return {
            days,
            totals: {
                ...totals,
                correctRate:
                    totals.questionsAnswered > 0
                        ? Math.round(
                              (totals.correctAnswers /
                                  totals.questionsAnswered) *
                                  100,
                          )
                        : 0,
            },
        };
    }

    async getMonthlyProgress(userId: string): Promise<{
        weeks: WeekStats[];
        totals: {
            testsCompleted: number;
            questionsAnswered: number;
            correctAnswers: number;
            correctRate: number;
        };
    }> {
        const testResultsCollection = await getTestResultsCollection();

        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);

        const testResults = await testResultsCollection
            .find({
                userId,
                completedAt: { $gte: monthAgo },
            })
            .sort({ completedAt: 1 })
            .toArray();

        const weekStats: Record<
            number,
            {
                testsCompleted: number;
                questionsAnswered: number;
                correctAnswers: number;
                startDate: Date;
                endDate: Date;
            }
        > = {};

        for (let i = 0; i < 4; i++) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - i * 7);
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 6);
            weekStats[i] = {
                testsCompleted: 0,
                questionsAnswered: 0,
                correctAnswers: 0,
                startDate,
                endDate,
            };
        }

        testResults.forEach((result) => {
            const resultDate = new Date(result.completedAt);
            const now = new Date();
            const diffDays = Math.floor(
                (now.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24),
            );
            const weekIndex = Math.min(3, Math.floor(diffDays / 7));

            if (weekStats[weekIndex]) {
                weekStats[weekIndex].testsCompleted++;
                weekStats[weekIndex].questionsAnswered +=
                    result.totalQuestions || 0;
                weekStats[weekIndex].correctAnswers +=
                    result.correctAnswers || 0;
            }
        });

        const weeks: WeekStats[] = Object.entries(weekStats)
            .reverse()
            .map(([weekNum, stats]) => ({
                week: 4 - parseInt(weekNum),
                label: `Тиждень ${4 - parseInt(weekNum)}`,
                startDate: stats.startDate.toISOString().split("T")[0],
                endDate: stats.endDate.toISOString().split("T")[0],
                testsCompleted: stats.testsCompleted,
                questionsAnswered: stats.questionsAnswered,
                correctAnswers: stats.correctAnswers,
                correctRate:
                    stats.questionsAnswered > 0
                        ? Math.round(
                              (stats.correctAnswers / stats.questionsAnswered) *
                                  100,
                          )
                        : 0,
            }));

        const totals = weeks.reduce(
            (acc, week) => ({
                testsCompleted: acc.testsCompleted + week.testsCompleted,
                questionsAnswered:
                    acc.questionsAnswered + week.questionsAnswered,
                correctAnswers: acc.correctAnswers + week.correctAnswers,
            }),
            { testsCompleted: 0, questionsAnswered: 0, correctAnswers: 0 },
        );

        return {
            weeks,
            totals: {
                ...totals,
                correctRate:
                    totals.questionsAnswered > 0
                        ? Math.round(
                              (totals.correctAnswers /
                                  totals.questionsAnswered) *
                                  100,
                          )
                        : 0,
            },
        };
    }

    async getProblematicAreas(userId: string): Promise<{
        topics: ProblematicTopic[];
        questions: ProblematicQuestion[];
    }> {
        const testResultsCollection = await getTestResultsCollection();
        const questionsCollection = await getQuestionsCollection();
        const topicsCollection = await getTopicsCollection();

        const testResults = await testResultsCollection
            .find({ userId })
            .toArray();

        const mistakesMap = new Map<
            string,
            { count: number; topicSlug: string }
        >();
        const topicMistakesMap = new Map<
            string,
            { total: number; mistakes: number }
        >();

        const allQuestionIds = new Set<string>();
        for (const result of testResults) {
            if (result.answers) {
                for (const answer of result.answers) {
                    allQuestionIds.add(answer.questionId);
                }
            }
        }

        const allQuestions = await questionsCollection
            .find({ questionId: { $in: Array.from(allQuestionIds) } })
            .toArray();
        const questionMap = new Map(allQuestions.map((q) => [q.questionId, q]));

        for (const result of testResults) {
            if (result.answers && Array.isArray(result.answers)) {
                for (const answer of result.answers) {
                    const questionId = answer.questionId;
                    const question = questionMap.get(questionId);
                    const topicSlug = question?.topic || "general";

                    if (answer.correct === false) {
                        const existing = mistakesMap.get(questionId) || {
                            count: 0,
                            topicSlug,
                        };
                        mistakesMap.set(questionId, {
                            count: existing.count + 1,
                            topicSlug,
                        });
                    }

                    const topicStats = topicMistakesMap.get(topicSlug) || {
                        total: 0,
                        mistakes: 0,
                    };
                    topicStats.total++;
                    if (answer.correct === false) {
                        topicStats.mistakes++;
                    }
                    topicMistakesMap.set(topicSlug, topicStats);
                }
            }
        }

        const problematicQuestionIds = Array.from(mistakesMap.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([id]) => id);

        const problematicQuestions = allQuestions.filter((q) =>
            problematicQuestionIds.includes(q.questionId || ""),
        );

        const topics = await topicsCollection.find({}).toArray();
        const topicsMap = topics.reduce(
            (acc, t) => {
                acc[t.slug] = t.name;
                return acc;
            },
            {} as Record<string, string>,
        );

        const questionsWithStats: ProblematicQuestion[] = problematicQuestions
            .map((q) => {
                const stats = mistakesMap.get(q.questionId);
                return {
                    questionId: q.questionId,
                    text:
                        q.text.substring(0, 100) +
                        (q.text.length > 100 ? "..." : ""),
                    topicSlug: stats?.topicSlug || "general",
                    topicName:
                        topicsMap[stats?.topicSlug || "general"] || "Загальні",
                    mistakeCount: stats?.count || 0,
                    difficulty: q.difficulty || 3,
                };
            })
            .sort((a, b) => b.mistakeCount - a.mistakeCount);

        const problematicTopics: ProblematicTopic[] = Array.from(
            topicMistakesMap.entries(),
        )
            .map(([slug, stats]) => ({
                topicSlug: slug,
                topicName: topicsMap[slug] || slug,
                totalAttempts: stats.total,
                mistakes: stats.mistakes,
                errorRate:
                    stats.total > 0
                        ? Math.round((stats.mistakes / stats.total) * 100)
                        : 0,
            }))
            .filter((t) => t.totalAttempts >= 5)
            .sort((a, b) => b.errorRate - a.errorRate)
            .slice(0, 5);

        return {
            topics: problematicTopics,
            questions: questionsWithStats,
        };
    }
}

export const progressService = new ProgressService();

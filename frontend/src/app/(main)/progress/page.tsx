"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    Target,
    AlertTriangle,
    Calendar,
    ChevronRight,
    Loader,
    BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useProgress, useWeeklyProgress, useProblematicData } from "@/hooks";

export default function ProgressPage() {
    const {
        data: progress,
        isLoading: progressLoading,
        error: progressError,
    } = useProgress();
    const { data: weekly, isLoading: weeklyLoading } = useWeeklyProgress();
    const { data: problematic, isLoading: problematicLoading } =
        useProblematicData();

    const loading = progressLoading || weeklyLoading || problematicLoading;
    const error = progressError;

    const getDifficultyColor = (difficulty: number) => {
        const colors = [
            "bg-green-500",
            "bg-lime-500",
            "bg-yellow-500",
            "bg-orange-500",
            "bg-red-500",
        ];
        return colors[Math.min(difficulty - 1, 4)];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <div className="flex-1 flex items-center justify-center">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">
                            {(error as Error).message ||
                                "Помилка завантаження даних"}
                        </p>
                        <Link
                            href="/dashboard"
                            className="text-blue-600 hover:underline"
                        >
                            Повернутися до кабінету
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Мій прогрес
                        </h1>
                        <p className="text-gray-600">
                            Відстежуйте свої досягнення та покращуйте результати
                        </p>
                    </motion.div>

                    {progress && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                        >
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Target className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {progress.overall.percentage}%
                                </p>
                                <p className="text-sm text-gray-600">
                                    Загальний прогрес
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {progress.overall.totalCorrect}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Правильних відповідей
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {progress.overall.testsCompleted}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Тестів пройдено
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-orange-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {progress.overall.totalAnswered}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Всього відповідей
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        {weekly && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-xl p-6 shadow-md"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Динаміка за тиждень
                                </h2>

                                <div className="flex items-end justify-between h-32 mb-4">
                                    {weekly.days.map((day, idx) => {
                                        const maxQuestions = Math.max(
                                            ...weekly.days.map(
                                                (d) => d.questionsAnswered,
                                            ),
                                            1,
                                        );
                                        const height =
                                            (day.questionsAnswered /
                                                maxQuestions) *
                                            100;

                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-center flex-1"
                                            >
                                                <div
                                                    className="w-full max-w-[30px] bg-blue-500 rounded-t-md transition-all duration-300"
                                                    style={{
                                                        height: `${Math.max(height, 4)}%`,
                                                    }}
                                                />
                                                <span className="text-xs text-gray-500 mt-2">
                                                    {day.dayName}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between text-sm text-gray-600 border-t pt-4">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {weekly.totals.testsCompleted}
                                        </p>
                                        <p>Тестів</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {weekly.totals.questionsAnswered}
                                        </p>
                                        <p>Питань</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {weekly.totals.correctRate}%
                                        </p>
                                        <p>Успішність</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {problematic && problematic.topics.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-xl p-6 shadow-md"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    Найпроблемніші теми
                                </h2>

                                <div className="space-y-3">
                                    {problematic.topics
                                        .slice(0, 5)
                                        .map((topic, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/practice/by-topic/${topic.topicSlug}`}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {topic.topicName}
                                                    </p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-red-500 h-2 rounded-full"
                                                            style={{
                                                                width: `${topic.errorRate}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <span className="text-red-600 font-medium">
                                                        {topic.errorRate}%
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                                </div>
                                            </Link>
                                        ))}
                                </div>

                                <Link
                                    href="/practice/mistakes"
                                    className="block mt-4 text-center text-blue-600 hover:underline"
                                >
                                    Робота над помилками →
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    {progress && progress.byTopic.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 bg-white rounded-xl p-6 shadow-md"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Прогрес по темах
                            </h2>

                            <div className="space-y-4">
                                {progress.byTopic.map((topic, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/practice/by-topic/${topic.topicSlug}`}
                                        className="block"
                                    >
                                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div
                                                className={`w-2 h-2 rounded-full ${getDifficultyColor(topic.difficulty)}`}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium text-gray-900">
                                                        {topic.name}
                                                    </p>
                                                    <span className="text-sm text-gray-600">
                                                        {
                                                            topic.answeredCorrectly
                                                        }
                                                        /{topic.questionCount}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${topic.percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">
                                                {topic.percentage}%
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {problematic && problematic.questions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 bg-white rounded-xl p-6 shadow-md"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Найчастіші помилки
                            </h2>

                            <div className="space-y-3">
                                {problematic.questions
                                    .slice(0, 5)
                                    .map((q, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-red-50 rounded-lg border border-red-100"
                                        >
                                            <p className="text-gray-900 mb-2">
                                                {q.text}
                                            </p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {q.topicName}
                                                </span>
                                                <span className="text-red-600 font-medium">
                                                    {q.mistakeCount} помилок
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

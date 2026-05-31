"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Loader, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useTopics } from "@/hooks";

import Button from "@/components/ui/Button";

export default function ByTopicPage() {
    const { data, isLoading, error, refetch } = useTopics();
    const topics = data?.topics || [];

    const getDifficultyColor = (difficulty: number) => {
        const colors = [
            "text-green-500",
            "text-lime-500",
            "text-yellow-500",
            "text-orange-500",
            "text-red-500",
        ];
        return colors[Math.min(difficulty - 1, 4)];
    };

    const getDifficultyLabel = (difficulty: number) => {
        const labels = [
            "Легко",
            "Нижче середнього",
            "Середній",
            "Вище середнього",
            "Складно",
        ];
        return labels[Math.min(difficulty - 1, 4)];
    };

    const renderDifficultyStars = (difficulty: number) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                        star <= difficulty
                            ? getDifficultyColor(difficulty) + " fill-current"
                            : "text-gray-300"
                    }`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Вчити по темах
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Всі питання згруповані по темах. Проходьте тести без
                            обмежень часу та отримуйте пояснення до кожного
                            питання.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <Link
                            href="/progress"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Мій прогрес
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <p className="text-red-600 mb-4">
                                {(error as Error).message ||
                                    "Помилка завантаження тем"}
                            </p>
                            <Button onClick={() => refetch()}>
                                Спробувати знову
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && topics.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topics
                                .sort((a, b) => a.order - b.order)
                                .map((topic, index) => (
                                    <motion.div
                                        key={topic.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={`/practice/by-topic/${topic.slug}`}
                                            className="block"
                                        >
                                            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group h-full">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                            {topic.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {renderDifficultyStars(
                                                                topic.difficulty,
                                                            )}
                                                            <span
                                                                className={`text-xs ${getDifficultyColor(topic.difficulty)}`}
                                                            >
                                                                {getDifficultyLabel(
                                                                    topic.difficulty,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {
                                                                topic.questionCount
                                                            }{" "}
                                                            {topic.questionCount ===
                                                            1
                                                                ? "питання"
                                                                : topic.questionCount <
                                                                    5
                                                                  ? "питання"
                                                                  : "питань"}
                                                        </p>
                                                    </div>
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                                        <span className="text-blue-600 font-bold group-hover:text-white transition-colors">
                                                            {
                                                                topic
                                                                    .userProgress
                                                                    .percentage
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                </div>

                                                {topic.description && (
                                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                                        {topic.description}
                                                    </p>
                                                )}

                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full transition-all ${
                                                            topic.userProgress
                                                                .percentage ===
                                                            100
                                                                ? "bg-green-500"
                                                                : topic
                                                                        .userProgress
                                                                        .percentage >=
                                                                    50
                                                                  ? "bg-blue-600"
                                                                  : "bg-blue-400"
                                                        }`}
                                                        style={{
                                                            width: `${topic.userProgress.percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs text-gray-500">
                                                        {
                                                            topic.userProgress
                                                                .answeredCorrectly
                                                        }{" "}
                                                        з {topic.questionCount}{" "}
                                                        вивчено
                                                    </p>
                                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                        </div>
                    )}

                    {!isLoading && !error && topics.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 mb-4">
                                Теми поки що не доступні
                            </p>
                            <Button onClick={() => refetch()}>Оновити</Button>
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 bg-blue-50 rounded-2xl p-8 border-2 border-blue-200"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Особливості режиму "По темах"
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                                    ✓
                                </span>
                                <span className="text-gray-700">
                                    Навчання без обмежень за часом
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                                    ✓
                                </span>
                                <span className="text-gray-700">
                                    Детальні пояснення до кожної відповіді
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                                    ✓
                                </span>
                                <span className="text-gray-700">
                                    Складність питань позначена зірочками
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                                    ✓
                                </span>
                                <span className="text-gray-700">
                                    Відстеження прогресу по кожній темі
                                </span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

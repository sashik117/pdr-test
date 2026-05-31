"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader, TrendingDown, BarChart3 } from "lucide-react";
import { useMistakes } from "@/hooks";

import Button from "@/components/ui/Button";
import PremiumLock from "@/components/ui/PremiumLock";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MistakesPage() {
    const [page, setPage] = useState(1);

    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();

    const { data, isLoading, error, refetch } = useMistakes({
        page,
        limit: 20,
    });
    const questions = data?.questions || [];
    const totalPages = data?.pagination?.totalPages || 1;
    const totalMistakes = data?.pagination?.total || 0;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    const startPractice = () => {
        router.push("/practice/mistakes/test");
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PremiumLock
                        isPremium={user?.isPremium}
                        title="Аналіз помилок"
                        description="Доступ до детального аналізу помилок доступний лише для Premium користувачів."
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Мої помилки
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                У розділі "Мої помилки" можна переглянути
                                запитання, де були зроблені помилки та прочитати
                                пояснення для кращого засвоєння матеріалу.
                            </p>
                        </motion.div>

                        {!isLoading && !error && totalMistakes > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                            >
                                <div className="bg-white rounded-xl p-6 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Всього помилок
                                            </p>
                                            <p className="text-3xl font-bold text-red-600">
                                                {totalMistakes}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                            <TrendingDown className="w-6 h-6 text-red-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Унікальних питань
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {questions.length}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Середньо помилок
                                            </p>
                                            <p className="text-3xl font-bold text-orange-600">
                                                {questions.length > 0
                                                    ? (
                                                          totalMistakes /
                                                          questions.length
                                                      ).toFixed(1)
                                                    : 0}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {isLoading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader className="w-8 h-8 text-red-600 animate-spin" />
                            </div>
                        )}

                        {error && !isLoading && (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <p className="text-red-600 mb-4">
                                    {(error as Error).message ||
                                        "Помилка завантаження помилок"}
                                </p>
                                <Button onClick={() => refetch()}>
                                    Спробувати знову
                                </Button>
                            </div>
                        )}

                        {!isLoading && !error && questions.length > 0 && (
                            <>
                                <div className="mb-6 flex items-center justify-between">
                                    <p className="text-gray-600">
                                        Знайдено:{" "}
                                        <span className="font-semibold text-gray-900">
                                            {questions.length}
                                        </span>{" "}
                                        питань з помилками
                                    </p>
                                    <Button
                                        onClick={startPractice}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Повторити помилки
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {questions.map(
                                        (question: any, index: number) => (
                                            <motion.div
                                                key={question.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500"
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                            Білет{" "}
                                                            {
                                                                question.ticketNumber
                                                            }
                                                        </span>
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                            Питання{" "}
                                                            {
                                                                question.questionNumber
                                                            }
                                                        </span>
                                                        {question.category && (
                                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                                {
                                                                    question.category
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
                                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                                        <span className="text-sm font-semibold text-red-700">
                                                            {
                                                                question.mistakeCount
                                                            }{" "}
                                                            {question.mistakeCount ===
                                                            1
                                                                ? "помилка"
                                                                : question.mistakeCount <
                                                                    5
                                                                  ? "помилки"
                                                                  : "помилок"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-lg text-gray-900 mb-4 font-medium">
                                                    {question.text}
                                                </p>

                                                {question.imageUrl && (
                                                    <div className="mb-4">
                                                        <img
                                                            src={
                                                                question.imageUrl
                                                            }
                                                            alt="Question"
                                                            className="rounded-lg max-w-md"
                                                        />
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    {question.options.map(
                                                        (option: any) => (
                                                            <div
                                                                key={option.id}
                                                                className={`p-3 rounded-lg border-2 ${
                                                                    option.id ===
                                                                    question.correctAnswer
                                                                        ? "border-green-500 bg-green-50"
                                                                        : "border-gray-200 bg-gray-50"
                                                                }`}
                                                            >
                                                                <span className="font-medium text-gray-700">
                                                                    {option.id}.
                                                                </span>{" "}
                                                                <span className="text-gray-900">
                                                                    {
                                                                        option.text
                                                                    }
                                                                </span>
                                                                {option.id ===
                                                                    question.correctAnswer && (
                                                                    <span className="ml-2 text-green-600 font-semibold">
                                                                        ✓
                                                                        Правильна
                                                                        відповідь
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                {question.explanation && (
                                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                                        <p className="text-sm font-semibold text-blue-900 mb-1">
                                                            Пояснення:
                                                        </p>
                                                        <p className="text-sm text-blue-800">
                                                            {
                                                                question.explanation
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                    <p className="text-sm text-yellow-800">
                                                        💡{" "}
                                                        <strong>Порада:</strong>{" "}
                                                        Уважно прочитайте
                                                        пояснення та спробуйте
                                                        запам'ятати правильну
                                                        відповідь, щоб не
                                                        повторити помилку.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ),
                                    )}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                            disabled={page === 1}
                                        >
                                            Назад
                                        </Button>
                                        <span className="px-4 py-2 text-gray-700">
                                            Сторінка {page} з {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(totalPages, p + 1),
                                                )
                                            }
                                            disabled={page === totalPages}
                                        >
                                            Вперед
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {!isLoading && !error && questions.length === 0 && (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <span className="text-3xl">🎉</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Відмінно! Немає помилок
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Ви ще не зробили жодної помилки в тестах.
                                    Продовжуйте у тому ж дусі!
                                </p>
                                <Button onClick={() => router.push("/tickets")}>
                                    Продовжити навчання
                                </Button>
                            </div>
                        )}

                        {!isLoading && !error && questions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Як ефективно працювати з помилками?
                                </h2>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-sm">
                                            1
                                        </span>
                                        <span className="text-gray-700">
                                            Уважно прочитайте пояснення до
                                            кожного питання
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-sm">
                                            2
                                        </span>
                                        <span className="text-gray-700">
                                            Зверніть увагу на питання з
                                            найбільшою кількістю помилок
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-sm">
                                            3
                                        </span>
                                        <span className="text-gray-700">
                                            Повторіть тести за цими темами
                                            декілька разів
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-sm">
                                            4
                                        </span>
                                        <span className="text-gray-700">
                                            Перевірте засвоєння матеріалу через
                                            тиждень
                                        </span>
                                    </li>
                                </ul>
                            </motion.div>
                        )}
                    </PremiumLock>
                </div>
            </main>
        </div>
    );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader, AlertCircle, TrendingUp, Award } from "lucide-react";
import { useDifficultQuestions } from "@/hooks";

import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function DifficultQuestionsPage() {
    const [page, setPage] = useState(1);

    const router = useRouter();

    const { data, isLoading, error, refetch } = useDifficultQuestions({
        page,
        limit: 20,
    });
    const questions = data?.questions || [];
    const totalPages = data?.pagination?.totalPages || 1;

    const startPractice = () => {
        router.push("/practice/difficult/test");
    };

    const getDifficultyColor = (errorRate: number) => {
        if (errorRate >= 80) return "text-red-600 bg-red-100 border-red-300";
        if (errorRate >= 60)
            return "text-orange-600 bg-orange-100 border-orange-300";
        if (errorRate >= 40)
            return "text-yellow-600 bg-yellow-100 border-yellow-300";
        return "text-green-600 bg-green-100 border-green-300";
    };

    const getDifficultyLabel = (errorRate: number) => {
        if (errorRate >= 80) return "Дуже складне";
        if (errorRate >= 60) return "Складне";
        if (errorRate >= 40) return "Середнє";
        return "Легке";
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                            <Brain className="w-8 h-8 text-purple-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Найскладніші запитання
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Розділ "Найскладніші запитання" містить 100 найбільш
                            складних запитань, з якими найчастіше зустрічаються
                            на іспиті. Цей розділ допоможе звернути увагу на
                            "важкі" запитання та підготуватися до іспиту.
                        </p>
                    </motion.div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-red-600 mb-4">
                                {(error as Error).message ||
                                    "Помилка завантаження складних питань"}
                            </p>
                            <Button onClick={() => refetch()}>
                                Спробувати знову
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && questions.length > 0 && (
                        <>
                            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <p className="text-gray-600">
                                        Показано:{" "}
                                        <span className="font-semibold text-gray-900">
                                            {questions.length}
                                        </span>{" "}
                                        найскладніших питань
                                    </p>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
                                        <Award className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm font-semibold text-purple-700">
                                            ТОП-100
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    onClick={startPractice}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    Почати тренування
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {questions.map(
                                    (question: any, index: number) => (
                                        <motion.div
                                            key={question.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                        Білет{" "}
                                                        {question.ticketNumber}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                        Питання{" "}
                                                        {
                                                            question.questionNumber
                                                        }
                                                    </span>
                                                    {question.category && (
                                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                                            {question.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 ${getDifficultyColor(question.errorRate)}`}
                                                    >
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span className="text-sm font-semibold">
                                                            {question.errorRate}
                                                            % помилок
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        (
                                                        {question.totalAttempts}{" "}
                                                        спроб)
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-4 ${getDifficultyColor(question.errorRate)}`}
                                            >
                                                <span className="text-sm font-bold">
                                                    {getDifficultyLabel(
                                                        question.errorRate,
                                                    )}
                                                </span>
                                            </div>

                                            <p className="text-lg text-gray-900 mb-4 font-medium">
                                                {question.text}
                                            </p>

                                            {question.imageUrl && (
                                                <div className="mb-4">
                                                    <img
                                                        src={question.imageUrl}
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
                                                                {option.text}
                                                            </span>
                                                            {option.id ===
                                                                question.correctAnswer && (
                                                                <span className="ml-2 text-green-600 font-semibold">
                                                                    ✓ Правильна
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
                                                        {question.explanation}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <p className="text-sm text-purple-800">
                                                    🎯{" "}
                                                    <strong>Статистика:</strong>{" "}
                                                    {question.errorRate}%
                                                    користувачів помилилися на
                                                    цьому питанні. Будьте
                                                    уважні!
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
                                            setPage((p) => Math.max(1, p - 1))
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
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Brain className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Немає даних про складні питання
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Статистика ще не зібрана. Після проходження
                                тестів користувачами, тут з'являться
                                найскладніші питання.
                            </p>
                            <Button onClick={() => router.push("/tickets")}>
                                Перейти до білетів
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && questions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Чому варто вивчати найскладніші питання?
                            </h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                                        ✓
                                    </span>
                                    <span className="text-gray-700">
                                        Підготуйтесь до найважчих питань, які
                                        зустрічаються на іспиті
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                                        ✓
                                    </span>
                                    <span className="text-gray-700">
                                        Підвищте свою впевненість та знання
                                        найскладніших тем
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                                        ✓
                                    </span>
                                    <span className="text-gray-700">
                                        Уникніть типових помилок, які роблять
                                        інші учні
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                                        ✓
                                    </span>
                                    <span className="text-gray-700">
                                        Зверніть увагу на деталі, які важливі
                                        для безпечного водіння
                                    </span>
                                </li>
                            </ul>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

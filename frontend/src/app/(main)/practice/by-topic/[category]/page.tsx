"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen,
    Loader,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";
import { useCategoryQuestions } from "@/hooks";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/ui/Button";

export default function CategoryTestPage() {
    const params = useParams();
    const router = useRouter();
    const category = decodeURIComponent(params.category as string);

    const [page, setPage] = useState(1);
    const [selectedAnswers, setSelectedAnswers] = useState<
        Record<string, string>
    >({});
    const [showAnswers, setShowAnswers] = useState(false);

    const { data, isLoading, error, refetch } = useCategoryQuestions(category, {
        page,
        limit: 20,
    });
    const questions = data?.questions || [];
    const totalPages = data?.pagination?.totalPages || 1;
    const totalQuestions = data?.pagination?.total || 0;

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleCheckAnswers = () => {
        setShowAnswers(true);
    };

    const handleReset = () => {
        setSelectedAnswers({});
        setShowAnswers(false);
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q: any) => {
            if (selectedAnswers[q.questionId] === q.correctAnswer) {
                correct++;
            }
        });
        return {
            correct,
            total: questions.length,
            percentage:
                questions.length > 0
                    ? Math.round((correct / questions.length) * 100)
                    : 0,
        };
    };

    const score = showAnswers ? calculateScore() : null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link
                            href="/practice/by-topic"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Назад до категорій</span>
                        </Link>

                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {category}
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Всього питань:{" "}
                                    <span className="font-semibold text-gray-900">
                                        {totalQuestions}
                                    </span>
                                </p>
                            </div>

                            {!showAnswers && (
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleCheckAnswers}
                                        disabled={
                                            Object.keys(selectedAnswers)
                                                .length === 0
                                        }
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Перевірити відповіді
                                    </Button>
                                </div>
                            )}

                            {showAnswers && score && (
                                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-500">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">
                                            Ваш результат
                                        </p>
                                        <p className="text-4xl font-bold text-blue-600 mb-1">
                                            {score.percentage}%
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {score.correct} з {score.total}{" "}
                                            правильних
                                        </p>
                                        <Button
                                            onClick={handleReset}
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                        >
                                            Почати знову
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-red-600 mb-4">
                                {(error as Error).message ||
                                    "Помилка завантаження питань"}
                            </p>
                            <Button onClick={() => refetch()}>
                                Спробувати знову
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && questions.length > 0 && (
                        <div className="space-y-6">
                            {questions.map((question: any, index: number) => {
                                const userAnswer =
                                    selectedAnswers[question.questionId];
                                const isCorrect =
                                    userAnswer === question.correctAnswer;
                                const hasAnswered = !!userAnswer;

                                return (
                                    <motion.div
                                        key={question.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-white rounded-xl p-6 shadow-md transition-all ${
                                            showAnswers && hasAnswered
                                                ? isCorrect
                                                    ? "border-2 border-green-500"
                                                    : "border-2 border-red-500"
                                                : "border-2 border-gray-200"
                                        }`}
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
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
                                                </div>

                                                <p className="text-lg text-gray-900 font-medium mb-4">
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
                                                        (option: any) => {
                                                            const isSelected =
                                                                userAnswer ===
                                                                option.id;
                                                            const isCorrectOption =
                                                                option.id ===
                                                                question.correctAnswer;

                                                            let optionClass =
                                                                "p-4 rounded-lg border-2 cursor-pointer transition-all ";

                                                            if (showAnswers) {
                                                                if (
                                                                    isCorrectOption
                                                                ) {
                                                                    optionClass +=
                                                                        "border-green-500 bg-green-50 ";
                                                                } else if (
                                                                    isSelected &&
                                                                    !isCorrectOption
                                                                ) {
                                                                    optionClass +=
                                                                        "border-red-500 bg-red-50 ";
                                                                } else {
                                                                    optionClass +=
                                                                        "border-gray-200 bg-gray-50 ";
                                                                }
                                                            } else {
                                                                if (
                                                                    isSelected
                                                                ) {
                                                                    optionClass +=
                                                                        "border-blue-500 bg-blue-50 ";
                                                                } else {
                                                                    optionClass +=
                                                                        "border-gray-200 hover:border-blue-300 hover:bg-blue-50 ";
                                                                }
                                                            }

                                                            return (
                                                                <button
                                                                    key={
                                                                        option.id
                                                                    }
                                                                    onClick={() =>
                                                                        !showAnswers &&
                                                                        handleAnswerSelect(
                                                                            question.questionId,
                                                                            option.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        showAnswers
                                                                    }
                                                                    className={
                                                                        optionClass
                                                                    }
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="font-medium text-gray-700">
                                                                                {
                                                                                    option.id
                                                                                }
                                                                                .
                                                                            </span>
                                                                            <span className="text-gray-900">
                                                                                {
                                                                                    option.text
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        {showAnswers &&
                                                                            isCorrectOption && (
                                                                                <span className="text-green-600 font-semibold">
                                                                                    ✓
                                                                                    Правильна
                                                                                </span>
                                                                            )}
                                                                        {showAnswers &&
                                                                            isSelected &&
                                                                            !isCorrectOption && (
                                                                                <span className="text-red-600 font-semibold">
                                                                                    ✗
                                                                                    Неправильна
                                                                                </span>
                                                                            )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>

                                                {showAnswers &&
                                                    question.explanation && (
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

                                                {showAnswers && hasAnswered && (
                                                    <div
                                                        className={`mt-4 p-3 rounded-lg ${
                                                            isCorrect
                                                                ? "bg-green-50 border border-green-200"
                                                                : "bg-red-50 border border-red-200"
                                                        }`}
                                                    >
                                                        <p
                                                            className={`text-sm font-semibold ${
                                                                isCorrect
                                                                    ? "text-green-800"
                                                                    : "text-red-800"
                                                            }`}
                                                        >
                                                            {isCorrect
                                                                ? "✓ Правильно! Ви обрали вірну відповідь"
                                                                : "✗ Помилка. Перегляньте пояснення"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {!isLoading && !error && totalPages > 1 && (
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
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page === totalPages}
                            >
                                Вперед
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && questions.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Питань не знайдено
                            </h3>
                            <p className="text-gray-600 mb-6">
                                В цій категорії поки що немає питань
                            </p>
                            <Link href="/practice/by-topic">
                                <Button>Повернутися до категорій</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

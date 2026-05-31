"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, Loader, Trash2, AlertCircle } from "lucide-react";
import { useSavedQuestions, useUnsaveQuestion } from "@/hooks";

import Button from "@/components/ui/Button";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SavedQuestionsPage() {
    const [page, setPage] = useState(1);

    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    const { data, isLoading, error, refetch } = useSavedQuestions({
        page,
        limit: 20,
    });
    const unsaveMutation = useUnsaveQuestion();

    const questions = data?.questions || [];
    const totalPages = data?.pagination?.totalPages || 1;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    const handleRemove = async (questionId: string) => {
        if (!confirm("Видалити це питання зі збережених?")) return;
        unsaveMutation.mutate(questionId);
    };

    const startPractice = () => {
        router.push("/practice/saved/test");
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-2xl mb-4">
                            <Bookmark className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Збережені питання
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Питання, які ви зберегли для подальшого повторення.
                            Тренуйтесь та закріплюйте знання.
                        </p>
                    </motion.div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-yellow-600 animate-spin" />
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-red-600 mb-4">
                                {(error as Error).message ||
                                    "Помилка завантаження збережених питань"}
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
                                    збережених питань
                                </p>
                                <Button
                                    onClick={startPractice}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                    Почати тестування
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
                                            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
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
                                                                    key={
                                                                        option.id
                                                                    }
                                                                    className={`p-3 rounded-lg border-2 ${
                                                                        option.id ===
                                                                        question.correctAnswer
                                                                            ? "border-green-500 bg-green-50"
                                                                            : "border-gray-200 bg-gray-50"
                                                                    }`}
                                                                >
                                                                    <span className="font-medium text-gray-700">
                                                                        {
                                                                            option.id
                                                                        }
                                                                        .
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
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        handleRemove(
                                                            question.questionId,
                                                        )
                                                    }
                                                    disabled={
                                                        unsaveMutation.isPending
                                                    }
                                                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Видалити зі збережених"
                                                >
                                                    {unsaveMutation.isPending ? (
                                                        <Loader className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-5 h-5" />
                                                    )}
                                                </button>
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
                                <Bookmark className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Немає збережених питань
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Під час проходження тестів ви можете зберігати
                                питання для повторення
                            </p>
                            <Button onClick={() => router.push("/tickets")}>
                                Перейти до білетів
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

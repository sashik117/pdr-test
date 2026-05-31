"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { questionsApi } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { QuestionSkeleton } from "@/components/ui/Skeleton";
import type { Question } from "@/types";

export default function QuestionsPage() {
    const [page, setPage] = useState(1);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
        null,
    );
    const [showAnswer, setShowAnswer] = useState(false);
    const limit = 20;

    const { data, isLoading } = useQuery({
        queryKey: ["questions", page, limit],
        queryFn: () => questionsApi.getAll({ page, limit }),
    });

    const handleViewQuestion = async (questionId: string) => {
        try {
            const question = await questionsApi.getById(questionId);
            setSelectedQuestion(question);
            setShowAnswer(false);
        } catch (error) {
            console.error("Error fetching question:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Каталог питань
                </h1>
                <p className="text-gray-600">
                    Перегляньте всі питання з офіційних білетів ПДР України
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <Card className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Пошук питань..."
                                className="pl-12"
                                disabled
                            />
                        </div>
                        <Button variant="outline" disabled>
                            <Filter className="w-4 h-4 mr-2" />
                            Фільтри
                        </Button>
                    </div>
                </Card>
            </motion.div>

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 5 }, (_, i) => (
                        <QuestionSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {data?.questions && data.questions.length > 0 ? (
                        data.questions.map((question, index) => (
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                                                    Білет{" "}
                                                    {question.ticketNumber}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    Питання{" "}
                                                    {question.questionNumber}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                    {question.category}
                                                </span>
                                            </div>
                                            <p className="text-gray-900 line-clamp-2">
                                                {question.text}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleViewQuestion(
                                                    question.questionId,
                                                )
                                            }
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Переглянути
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500">Питань не знайдено</p>
                        </div>
                    )}
                </div>
            )}

            {data && data.pagination.totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-4 mt-8"
                >
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Назад
                    </Button>
                    <span className="text-gray-600">
                        Сторінка {page} з {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setPage((p) =>
                                Math.min(data.pagination.totalPages, p + 1),
                            )
                        }
                        disabled={page === data.pagination.totalPages}
                    >
                        Далі
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </motion.div>
            )}

            {data && (
                <div className="text-center text-gray-500 mt-4">
                    Всього {data.pagination.total} питань
                </div>
            )}

            <Modal
                isOpen={!!selectedQuestion}
                onClose={() => setSelectedQuestion(null)}
                title={`Білет ${selectedQuestion?.ticketNumber}, Питання ${selectedQuestion?.questionNumber}`}
                size="lg"
            >
                {selectedQuestion && (
                    <div className="space-y-4">
                        <p className="text-gray-900 font-medium">
                            {selectedQuestion.text}
                        </p>

                        <div className="space-y-2">
                            {selectedQuestion.options.map((option) => (
                                <div
                                    key={option.id}
                                    className={`p-3 rounded-lg border-2 ${
                                        showAnswer &&
                                        option.id ===
                                            selectedQuestion.correctAnswer
                                            ? "border-success-500 bg-success-50"
                                            : "border-gray-200"
                                    }`}
                                >
                                    <span className="font-medium mr-2">
                                        {option.id}.
                                    </span>
                                    {option.text}
                                </div>
                            ))}
                        </div>

                        <AnimatePresence>
                            {showAnswer && selectedQuestion.explanation && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                >
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">
                                            Пояснення:{" "}
                                        </span>
                                        {selectedQuestion.explanation}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-end">
                            <Button
                                variant={showAnswer ? "secondary" : "primary"}
                                onClick={() => setShowAnswer(!showAnswer)}
                            >
                                {showAnswer
                                    ? "Приховати відповідь"
                                    : "Показати відповідь"}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

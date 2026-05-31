"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Bookmark, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";
import { useAuthStore } from "@/lib/auth";
import { savedQuestionsApi } from "@/lib/api";

interface QuestionCardProps {
    question: Question;
    selectedAnswer: string | null;
    onSelectAnswer: (answerId: string) => void;
    showResult?: boolean;
    correctAnswer?: string;
    className?: string;
    showBookmark?: boolean;
}

export default function QuestionCard({
    question,
    selectedAnswer,
    onSelectAnswer,
    showResult = false,
    correctAnswer,
    className,
    showBookmark = true,
}: QuestionCardProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { isAuthenticated } = useAuthStore();

    const handleBookmark = async () => {
        if (!isAuthenticated) {
            alert("Будь ласка, увійдіть в акаунт для збереження питань");
            return;
        }

        try {
            setIsSaving(true);

            if (isSaved) {
                await savedQuestionsApi.unsave(question.questionId);
                setIsSaved(false);
            } else {
                await savedQuestionsApi.save(question.questionId);
                setIsSaved(true);
            }
        } catch (error: any) {
            console.error("Error saving question:", error);
            alert(
                error.response?.data?.message || "Помилка збереження питання",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            className={cn(
                "bg-white rounded-2xl shadow-lg overflow-hidden",
                className,
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="p-6 md:p-8">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                            Білет {question.ticketNumber}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            Питання {question.questionNumber}
                        </span>
                    </div>

                    {showBookmark && (
                        <button
                            onClick={handleBookmark}
                            disabled={isSaving}
                            className={cn(
                                "p-2 rounded-lg transition-all hover:bg-gray-100",
                                isSaved
                                    ? "text-yellow-500"
                                    : "text-gray-400 hover:text-yellow-500",
                            )}
                            title={
                                isSaved
                                    ? "Видалити зі збережених"
                                    : "Зберегти питання"
                            }
                        >
                            {isSaving ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <Bookmark
                                    className={cn(
                                        "w-5 h-5",
                                        isSaved && "fill-current",
                                    )}
                                />
                            )}
                        </button>
                    )}
                </div>

                <span className="text-xs text-gray-500">
                    {question.category}
                </span>

                <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-6">
                    {question.text}
                </h3>

                {question.imageUrl && (
                    <div className="relative w-full h-48 md:h-64 mb-6 rounded-xl overflow-hidden bg-gray-100">
                        <Image
                            src={question.imageUrl}
                            alt="Зображення до питання"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}

                <div className="space-y-3">
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === option.id;
                        const isCorrect = correctAnswer === option.id;
                        const isWrong = showResult && isSelected && !isCorrect;

                        return (
                            <motion.button
                                key={option.id}
                                onClick={() =>
                                    !showResult && onSelectAnswer(option.id)
                                }
                                className={cn(
                                    "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                                    !showResult &&
                                        "hover:border-primary-300 hover:bg-primary-50",
                                    isSelected &&
                                        !showResult &&
                                        "border-primary-500 bg-primary-50",
                                    !isSelected &&
                                        !showResult &&
                                        "border-gray-200",
                                    showResult &&
                                        isCorrect &&
                                        "border-success-500 bg-success-50",
                                    showResult &&
                                        isWrong &&
                                        "border-error-500 bg-error-50",
                                    showResult &&
                                        !isSelected &&
                                        !isCorrect &&
                                        "border-gray-200 opacity-50",
                                )}
                                disabled={showResult}
                                whileTap={{ scale: showResult ? 1 : 0.98 }}
                            >
                                <span
                                    className={cn(
                                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                                        isSelected &&
                                            !showResult &&
                                            "bg-primary-500 text-white",
                                        !isSelected &&
                                            !showResult &&
                                            "bg-gray-100 text-gray-600",
                                        showResult &&
                                            isCorrect &&
                                            "bg-success-500 text-white",
                                        showResult &&
                                            isWrong &&
                                            "bg-error-500 text-white",
                                        showResult &&
                                            !isSelected &&
                                            !isCorrect &&
                                            "bg-gray-100 text-gray-400",
                                    )}
                                >
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span
                                    className={cn(
                                        "flex-1 text-base",
                                        showResult &&
                                            isCorrect &&
                                            "text-success-700 font-medium",
                                        showResult &&
                                            isWrong &&
                                            "text-error-700",
                                        showResult &&
                                            !isSelected &&
                                            !isCorrect &&
                                            "text-gray-400",
                                    )}
                                >
                                    {option.text}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                {showResult && question.explanation && (
                    <motion.div
                        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                    >
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Пояснення: </span>
                            {question.explanation}
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

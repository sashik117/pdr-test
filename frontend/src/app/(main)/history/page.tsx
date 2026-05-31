"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    History,
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    Trophy,
    Target,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { testsApi } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
    cn,
    formatDate,
    formatDuration,
    getScoreColor,
    getScoreBgColor,
} from "@/lib/utils";

export default function HistoryPage() {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: rawData, isLoading } = useQuery({
        queryKey: ["test-history", page, limit],
        queryFn: () => testsApi.getHistory({ page, limit }),
    });

    // Map API response: backend returns { tests, pagination }, frontend expects { results, stats, pagination }
    const data = rawData
        ? {
              results: (rawData as any).tests || rawData.results || [],
              pagination: rawData.pagination,
              stats: rawData.stats,
          }
        : undefined;

    // Compute stats from results if stats not provided by API
    const stats = data?.stats || (data?.results && data.results.length > 0
        ? {
              totalTests: data.pagination.total || data.results.length,
              passed: data.results.filter((r: any) => r.passed).length,
              averageScore: Math.round(
                  data.results.reduce((sum: number, r: any) => sum + r.score, 0) /
                      data.results.length,
              ),
              totalCorrect: data.results.reduce(
                  (sum: number, r: any) => sum + r.correctAnswers,
                  0,
              ),
              totalQuestions: data.results.reduce(
                  (sum: number, r: any) => sum + r.totalQuestions,
                  0,
              ),
          }
        : undefined);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Історія тестів
                </h1>
                <p className="text-gray-600">
                    Переглядайте результати всіх пройдених тестів
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Загальна статистика
                    </h2>

                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : stats ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <Target className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.totalTests}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Тестів пройдено
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <Trophy className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.passed}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Успішних
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <XCircle className="w-8 h-8 text-error-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.totalTests - stats.passed}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Неуспішних
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                <div
                                    className={cn(
                                        "text-2xl font-bold",
                                        getScoreColor(stats.averageScore),
                                    )}
                                >
                                    {stats.averageScore}%
                                </div>
                                <div className="text-sm text-gray-600">
                                    Середній бал
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.totalCorrect}/{stats.totalQuestions}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Правильних
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Ви ще не проходили тести</p>
                        </div>
                    )}
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Результати тестів
                    </h2>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : data?.results && data.results.length > 0 ? (
                        <div className="space-y-4">
                            {data.results.map((result: any, index: number) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2",
                                        result.passed
                                            ? "border-success-200 bg-success-50"
                                            : "border-error-200 bg-error-50",
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center",
                                                result.passed
                                                    ? "bg-success-100"
                                                    : "bg-error-100",
                                            )}
                                        >
                                            {result.passed ? (
                                                <CheckCircle className="w-6 h-6 text-success-600" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-error-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {result.passed
                                                    ? "Тест складено"
                                                    : "Тест не складено"}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(
                                                        result.completedAt,
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDuration(
                                                        result.startedAt,
                                                        result.completedAt,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600">
                                                Правильних
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                {result.correctAnswers}/
                                                {result.totalQuestions}
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl",
                                                getScoreBgColor(result.score),
                                                getScoreColor(result.score),
                                            )}
                                        >
                                            {result.score}%
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Історія порожня</p>
                            <p className="text-sm mt-2">
                                Пройдіть перший тест, щоб побачити результати
                                тут
                            </p>
                        </div>
                    )}

                    {data && data.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
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
                                        Math.min(
                                            data.pagination.totalPages,
                                            p + 1,
                                        ),
                                    )
                                }
                                disabled={page === data.pagination.totalPages}
                            >
                                Далі
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}

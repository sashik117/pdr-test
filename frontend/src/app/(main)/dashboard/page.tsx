"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    Play,
    BookOpen,
    History,
    Trophy,
    Target,
    TrendingUp,
    CheckCircle,
    XCircle,
    Shuffle,
} from "lucide-react";
import { testsApi, ticketsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { cn, getScoreColor } from "@/lib/utils";

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ["test-history"],
        queryFn: () => testsApi.getHistory({ limit: 5 }),
    });

    const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
        queryKey: ["tickets"],
        queryFn: ticketsApi.getAll,
    });

    const stats = historyData?.stats;

    const quickActions = [
        {
            icon: Shuffle,
            title: "Випадковий тест",
            description: "20 випадкових питань",
            href: "/test/random",
            color: "bg-primary-500",
        },
        {
            icon: BookOpen,
            title: "По білетах",
            description: "Виберіть конкретний білет",
            href: "/tickets",
            color: "bg-emerald-500",
        },
        {
            icon: History,
            title: "Історія",
            description: "Переглянути результати",
            href: "/history",
            color: "bg-amber-500",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Привіт, {user?.name}!
                </h1>
                <p className="text-gray-600">
                    Готовий до підготовки? Обери один з варіантів нижче.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <Link key={index} href={action.href}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center",
                                            action.color,
                                        )}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Ваша статистика
                        </h2>

                        {historyLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        ) : stats ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                        {stats.totalCorrect}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Правильних
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Ви ще не проходили тести</p>
                                <Button
                                    onClick={() => router.push("/test/random")}
                                    className="mt-4"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Почати перший тест
                                </Button>
                            </div>
                        )}
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Останні тести
                            </h2>
                            <Link
                                href="/history"
                                className="text-sm text-primary-600 hover:underline"
                            >
                                Всі
                            </Link>
                        </div>

                        {historyLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        ) : historyData?.results &&
                          historyData.results.length > 0 ? (
                            <div className="space-y-3">
                                {historyData.results
                                    .slice(0, 5)
                                    .map((result) => (
                                        <div
                                            key={result.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                {result.passed ? (
                                                    <CheckCircle className="w-5 h-5 text-success-500" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-error-500" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {result.correctAnswers}/
                                                        {result.totalQuestions}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(
                                                            result.completedAt,
                                                        ).toLocaleDateString(
                                                            "uk-UA",
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={cn(
                                                    "font-bold",
                                                    getScoreColor(result.score),
                                                )}
                                            >
                                                {result.score}%
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Історія порожня</p>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
            >
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Білети
                        </h2>
                        <Link
                            href="/tickets"
                            className="text-sm text-primary-600 hover:underline"
                        >
                            Всі білети
                        </Link>
                    </div>

                    {ticketsLoading ? (
                        <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2">
                            {Array.from({ length: 20 }, (_, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {ticketsData?.tickets.slice(0, 20).map((ticket) => (
                                <Link
                                    key={ticket.ticketNumber}
                                    href={`/test/ticket/${ticket.ticketNumber}`}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {ticket.ticketNumber}
                                </Link>
                            ))}
                            {ticketsData && ticketsData.total > 20 && (
                                <Link
                                    href="/tickets"
                                    className="w-10 h-10 flex items-center justify-center bg-primary-100 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
                                >
                                    +{ticketsData.total - 20}
                                </Link>
                            )}
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}

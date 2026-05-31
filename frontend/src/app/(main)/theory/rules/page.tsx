"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    Loader,
    AlertCircle,
    ArrowLeft,
    ChevronRight,
} from "lucide-react";
import { useTheoryContent } from "@/hooks";
import Link from "next/link";

import Button from "@/components/ui/Button";

interface Chapter {
    id: string;
    chapterId: number;
    title: string;
    description: string;
    itemCount: number;
}

export default function RulesPage() {
    const { data, isLoading, error, refetch } = useTheoryContent("pdr-chapter");
    const chapters = (data?.content || []) as Chapter[];

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
                            href="/theory"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Назад до теорії</span>
                        </Link>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            📖 Правила дорожнього руху
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl">
                            Повний курс правил дорожнього руху України — 34
                            розділи з детальними поясненнями та ілюстраціями
                        </p>
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
                                    "Помилка завантаження правил дорожнього руху"}
                            </p>
                            <Button onClick={() => refetch()}>
                                Спробувати знову
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && chapters.length > 0 && (
                        <div className="space-y-3">
                            {chapters.map((chapter, index) => (
                                <motion.div
                                    key={chapter.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Link
                                        href={`/theory/rules/${chapter.chapterId}`}
                                        className="block"
                                    >
                                        <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 group">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                                    <span className="text-lg font-bold text-blue-600 group-hover:text-white transition-colors">
                                                        {chapter.chapterId}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                        {chapter.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {chapter.itemCount || 0}{" "}
                                                        пунктів
                                                    </p>
                                                </div>

                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!isLoading && !error && chapters.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Правила ще не завантажені
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Запустіть парсер для завантаження правил
                                дорожнього руху
                            </p>
                            <code className="bg-gray-100 px-4 py-2 rounded text-sm text-gray-800">
                                cd scripts && npx tsx parse-theory.ts
                            </code>
                        </div>
                    )}

                    {chapters.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center"
                        >
                            <h2 className="text-2xl font-bold mb-4">
                                Готові перевірити свої знання?
                            </h2>
                            <p className="text-blue-100 mb-6">
                                Після вивчення правил, пройдіть тестування для
                                закріплення матеріалу
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link href="/practice/by-topic">
                                    <Button
                                        size="lg"
                                        className="bg-white text-blue-600 hover:bg-blue-50"
                                    >
                                        Тести по темах
                                    </Button>
                                </Link>
                                <Link href="/tickets">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white text-white hover:bg-white/10"
                                    >
                                        Білети ПДР
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader, AlertCircle, ArrowLeft } from "lucide-react";
import { useTheoryContent } from "@/hooks";
import Link from "next/link";

import Button from "@/components/ui/Button";

interface MarkingItem {
    id: string;
    title: string;
    imageUrl: string;
}

interface MarkingCategory {
    id: string;
    type: string;
    slug: string;
    title: string;
    description?: string;
    imageUrl?: string;
    categoryId?: string;
    categoryName?: string;
    order?: number;
    itemCount: number;
    items: MarkingItem[];
}

export default function RoadMarkingsPage() {
    const { data, isLoading, error, refetch } =
        useTheoryContent("road-markings");
    const categories = (data?.content || []) as MarkingCategory[];
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (categories.length > 0 && !expandedId) {
            setExpandedId(categories[0].id);
        }
    }, [categories, expandedId]);

    const toggleCategory = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

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
                            Дорожня розмітка
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl">
                            Дорожня розмітка — це лінії, стрілки, написи та інші
                            позначення на дорожньому покритті, які встановлюють
                            певний режим і порядок руху.
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
                                    "Помилка завантаження дорожньої розмітки"}
                            </p>
                            <Button onClick={() => refetch()}>
                                Спробувати знову
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && categories.length > 0 && (
                        <div className="space-y-4">
                            {categories.map((category, index) => {
                                const isExpanded = expandedId === category.id;

                                return (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200 hover:border-green-500 transition-colors"
                                    >
                                        <button
                                            onClick={() =>
                                                toggleCategory(category.id)
                                            }
                                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                {category.imageUrl && (
                                                    <img
                                                        src={category.imageUrl}
                                                        alt={category.title}
                                                        className="w-12 h-12 object-contain"
                                                    />
                                                )}
                                                <div className="text-left">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {category.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {category.itemCount}{" "}
                                                        {(category.items || [])
                                                            .length === 1
                                                            ? "розмітка"
                                                            : (
                                                                    category.items ||
                                                                    []
                                                                ).length < 5
                                                              ? "розмітки"
                                                              : "розміток"}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.div
                                                animate={{
                                                    rotate: isExpanded
                                                        ? 180
                                                        : 0,
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-6 h-6 text-gray-400" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-6 border-t border-gray-200">
                                                        {category.description && (
                                                            <div className="py-4 text-gray-700 leading-relaxed">
                                                                {
                                                                    category.description
                                                                }
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                                                            {category.items.map(
                                                                (
                                                                    marking,
                                                                    idx,
                                                                ) => (
                                                                    <motion.div
                                                                        key={
                                                                            marking.id
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                            scale: 0.9,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            scale: 1,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                idx *
                                                                                0.02,
                                                                        }}
                                                                        className="group"
                                                                    >
                                                                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-green-50 hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500 cursor-pointer">
                                                                            <div className="aspect-square mb-2 flex items-center justify-center bg-white rounded">
                                                                                <img
                                                                                    src={
                                                                                        marking.imageUrl
                                                                                    }
                                                                                    alt={
                                                                                        marking.title
                                                                                    }
                                                                                    className="max-w-full max-h-full object-contain"
                                                                                />
                                                                            </div>
                                                                            <p className="text-center text-sm font-semibold text-gray-900 group-hover:text-green-600">
                                                                                {
                                                                                    marking.title
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </motion.div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {!isLoading && !error && categories.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <span className="text-3xl">🛣️</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Дорожня розмітка ще не завантажена
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Запустіть парсер для завантаження дорожньої
                                розмітки
                            </p>
                            <code className="bg-gray-100 px-4 py-2 rounded text-sm text-gray-800">
                                cd scripts && npm run parse-theory
                            </code>
                        </div>
                    )}

                    {!isLoading && !error && categories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                💡 Поради для вивчення дорожньої розмітки
                            </h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                                        1
                                    </span>
                                    <span className="text-gray-700">
                                        Розрізняйте горизонтальну та вертикальну
                                        розмітку
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                                        2
                                    </span>
                                    <span className="text-gray-700">
                                        Запам'ятайте значення суцільних та
                                        переривчастих ліній
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                                        3
                                    </span>
                                    <span className="text-gray-700">
                                        Особливу увагу приділіть розмітці на
                                        перехрестях
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                                        4
                                    </span>
                                    <span className="text-gray-700">
                                        Вивчіть стрілки та напрямки руху
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

"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    Loader,
    AlertCircle,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    MessageCircle,
} from "lucide-react";
import { useTheoryArticle } from "@/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import TheoryContent from "@/components/ui/TheoryContent";

interface Section {
    sectionId: string;
    number: string;
    content: string;
    comment?: string;
    images: string[];
}

interface ChapterData {
    id: string;
    chapterId: number;
    title: string;
    description: string;
    sections: Section[];
}

export default function ChapterPage() {
    const params = useParams();
    const chapterId = params.chapterId as string;
    const slug = `chapter-${chapterId}`;

    const { data, isLoading, error, refetch } = useTheoryArticle(slug);
    const chapter = data as ChapterData | null;

    const [expandedComments, setExpandedComments] = useState<
        Record<string, boolean>
    >({});

    const toggleComment = (sectionId: string) => {
        setExpandedComments((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link
                            href="/theory/rules"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Назад до списку розділів</span>
                        </Link>

                        {chapter && (
                            <>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">
                                            {chapter.chapterId}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                        {chapter.title}
                                    </h1>
                                </div>
                                <p className="text-lg text-gray-600">
                                    {chapter.sections?.length || 0} пунктів
                                </p>
                            </>
                        )}
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
                                    "Помилка завантаження розділу"}
                            </p>
                            <Button onClick={() => refetch()}>
                                Спробувати знову
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && chapter && (
                        <div className="space-y-6">
                            {chapter.sections?.map((section, index) => (
                                <motion.div
                                    key={section.sectionId}
                                    id={section.sectionId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-16 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <span className="font-bold text-blue-600">
                                                    {section.number}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <TheoryContent
                                                    html={section.content}
                                                    className="prose prose-sm max-w-none prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {section.comment && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    toggleComment(
                                                        section.sectionId,
                                                    )
                                                }
                                                className="w-full px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                <span>Коментар до пункту</span>
                                                {expandedComments[
                                                    section.sectionId
                                                ] ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>

                                            {expandedComments[
                                                section.sectionId
                                            ] && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: "auto",
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    className="px-6 py-4 bg-amber-50 border-t border-amber-200"
                                                >
                                                    <TheoryContent
                                                        html={section.comment}
                                                        className="prose prose-sm max-w-none prose-a:text-blue-600"
                                                    />
                                                </motion.div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!isLoading && !error && !chapter && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Розділ не знайдено
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Можливо, цей розділ ще не завантажено
                            </p>
                            <Link href="/theory/rules">
                                <Button>Повернутися до списку</Button>
                            </Link>
                        </div>
                    )}

                    {chapter && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 flex justify-between items-center"
                        >
                            {parseInt(chapterId) > 1 ? (
                                <Link
                                    href={`/theory/rules/${parseInt(chapterId) - 1}`}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Попередній розділ</span>
                                </Link>
                            ) : (
                                <div />
                            )}

                            {parseInt(chapterId) < 34 && (
                                <Link
                                    href={`/theory/rules/${parseInt(chapterId) + 1}`}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                >
                                    <span>Наступний розділ</span>
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

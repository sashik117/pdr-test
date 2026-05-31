"use client";

import { useParams, useRouter } from "next/navigation";
import { useTheoryContent } from "@/hooks";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Loader,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useEffect, useMemo } from "react";

interface SignItem {
    id: string;
    title: string;
    imageUrl: string;
    content?: string;
    shortDescription?: string;
    code: string;
}

interface SignCategory {
    id: string;
    type: string;
    slug: string;
    title: string;
    description?: string;
    imageUrl?: string;
    categoryId: string; // "1", "2", etc.
    categoryName?: string;
    order?: number;
    items: SignItem[];
    itemCount: number;
}

export default function SignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.categoryId as string;
    const signId = params.signId as string;

    const { data, isLoading, error } = useTheoryContent("road-signs");
    const categories = (data?.content || []) as SignCategory[];

    const { category, sign, prevSign, nextSign } = useMemo(() => {
        if (!categories.length)
            return {
                category: null,
                sign: null,
                prevSign: null,
                nextSign: null,
            };

        const foundCategory = categories.find(
            (c) => c.categoryId.toString() === categoryId.toString(),
        );

        if (!foundCategory)
            return {
                category: null,
                sign: null,
                prevSign: null,
                nextSign: null,
            };

        const items = foundCategory.items || [];
        const signIndex = items.findIndex((s) => s.code === signId);

        if (signIndex === -1)
            return {
                category: foundCategory,
                sign: null,
                prevSign: null,
                nextSign: null,
            };

        return {
            category: foundCategory,
            sign: items[signIndex],
            prevSign: signIndex > 0 ? items[signIndex - 1] : null,
            nextSign:
                signIndex < items.length - 1 ? items[signIndex + 1] : null,
        };
    }, [categories, categoryId, signId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || (!isLoading && !sign)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Знак не знайдено
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Можливо, ви перейшли за неправильним посиланням або знак
                        було видалено.
                    </p>
                    <Link href="/theory/road-signs">
                        <Button>Повернутися до знаків</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link
                            href="/theory/road-signs"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span>Всі дорожні знаки</span>
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg text-blue-600 font-medium mb-1">
                                    {category?.title}
                                </h2>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="text-gray-400 font-mono text-2xl">
                                        #{sign?.code}
                                    </span>
                                    {sign?.title
                                        .replace(`Знак ${sign?.code}`, "")
                                        .trim() || sign?.title}
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!prevSign}
                                    onClick={() =>
                                        prevSign &&
                                        router.push(
                                            `/theory/road-signs/${categoryId}/${prevSign.code}`,
                                        )
                                    }
                                    className="px-3"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!nextSign}
                                    onClick={() =>
                                        nextSign &&
                                        router.push(
                                            `/theory/road-signs/${categoryId}/${nextSign.code}`,
                                        )
                                    }
                                    className="px-3"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                    >
                        <div className="md:grid md:grid-cols-3 gap-0">
                            <div className="p-8 md:p-12 bg-gray-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="relative w-48 h-48 md:w-full md:h-64"
                                >
                                    {sign?.imageUrl && (
                                        <img
                                            src={sign.imageUrl}
                                            alt={sign.title}
                                            className="w-full h-full object-contain drop-shadow-lg"
                                        />
                                    )}
                                </motion.div>
                            </div>

                            <div className="p-8 md:p-10 md:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 block">
                                        Опис
                                    </h3>
                                    <div
                                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                sign?.content ||
                                                sign?.shortDescription ||
                                                "Опис відсутній",
                                        }}
                                    />
                                </div>

                                {!sign?.content && !sign?.shortDescription && (
                                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm">
                                            Детальний опис цього знаку наразі
                                            відсутній.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 text-center text-gray-500 text-sm"
                    >
                        <p>
                            Знак {sign?.code} належить до категорії "
                            {category?.title}"
                        </p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    Loader,
    AlertCircle,
    ArrowRight,
    PlayCircle,
} from "lucide-react";
import { useTheoryArticles } from "@/hooks";
import Link from "next/link";

import Button from "@/components/ui/Button";

interface TheoryType {
    type: string;
    title: string;
    count: number;
}

const theoryIcons: Record<string, string> = {
    "pdr-chapter": "📖",
    "road-signs": "🚦",
    "road-markings": "🛣️",
};

const theoryDescriptions: Record<string, string> = {
    "pdr-chapter":
        "Правила дорожнього руху України - повний курс з 34 розділів",
    "road-signs": "Всі дорожні знаки з поясненнями та прикладами",
    "road-markings": "Горизонтальна та вертикальна розмітка доріг",
};

const theoryRoutes: Record<string, string> = {
    "pdr-chapter": "/theory/rules",
    "road-signs": "/theory/road-signs",
    "road-markings": "/theory/road-markings",
};

export default function TheoryPage() {
    const { data, isLoading, error, refetch } = useTheoryArticles();
    const theoryTypes = (data as any)?.theoryTypes || [];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            😎 Теорія ПДР і самопідготовка
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Тут зібрано все необхідне для самостійного вивчення
                            правил дорожнього руху
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
                                    "Помилка завантаження теорії"}
                            </p>
                            <Button onClick={() => refetch()}>
                                Спробувати знову
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {theoryTypes.map(
                                    (theoryType: TheoryType, index: number) => (
                                        <motion.div
                                            key={theoryType.type}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link
                                                href={
                                                    theoryRoutes[
                                                        theoryType.type
                                                    ] ||
                                                    `/theory/${theoryType.type}`
                                                }
                                                className="block"
                                            >
                                                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group h-full">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="text-4xl mb-2">
                                                            {theoryIcons[
                                                                theoryType.type
                                                            ] || "📚"}
                                                        </div>
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                                            <ArrowRight className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                                                        </div>
                                                    </div>

                                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                        {theoryType.title}
                                                    </h3>
                                                    <p className="text-gray-600 mb-4">
                                                        {theoryDescriptions[
                                                            theoryType.type
                                                        ] ||
                                                            "Матеріали для вивчення"}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        {theoryType.type ===
                                                        "lectures" ? (
                                                            <>
                                                                <PlayCircle className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        theoryType.count
                                                                    }{" "}
                                                                    відеоуроків
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <BookOpen className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        theoryType.count
                                                                    }{" "}
                                                                    матеріалів
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ),
                                )}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold mb-4">
                                            📹 Відеоуроки з ПДР
                                        </h2>
                                        <p className="text-blue-100 mb-6">
                                            Перегляньте наші відеолекції для
                                            кращого розуміння правил дорожнього
                                            руху. Кожен урок містить детальні
                                            пояснення та практичні приклади.
                                        </p>
                                        <Link href="/theory/lectures">
                                            <Button className="bg-white text-blue-600 hover:bg-blue-50">
                                                <PlayCircle className="w-5 h-5 mr-2" />
                                                Дивитись відео
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="w-full md:w-1/3">
                                        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                                            <div className="text-5xl font-bold mb-2">
                                                50+
                                            </div>
                                            <div className="text-blue-100">
                                                відеоуроків
                                            </div>
                                            <div className="text-5xl font-bold mb-2 mt-4">
                                                24
                                            </div>
                                            <div className="text-blue-100">
                                                теми ПДР
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-12"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    🔥 Популярні теми
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            title: "Проїзд перехресть",
                                            description:
                                                "Правила проїзду регульованих та нерегульованих перехресть",
                                            link: "/theory/rules#crossroads",
                                        },
                                        {
                                            title: "Обгін та випередження",
                                            description:
                                                "Коли можна і коли заборонено виконувати обгін",
                                            link: "/theory/rules#overtaking",
                                        },
                                        {
                                            title: "Дорожні знаки",
                                            description:
                                                "Попереджувальні, заборонні, наказові та інформаційні знаки",
                                            link: "/theory/road-signs",
                                        },
                                        {
                                            title: "Сигнали регулювальника",
                                            description:
                                                "Як правильно розуміти жести регулювальника",
                                            link: "/theory/regulator",
                                        },
                                    ].map((topic, index) => (
                                        <Link
                                            key={index}
                                            href={topic.link}
                                            className="block"
                                        >
                                            <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500 group">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {topic.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {topic.description}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-12 bg-yellow-50 rounded-2xl p-8 border-2 border-yellow-200"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    💡 Поради для ефективного навчання
                                </h2>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
                                            1
                                        </span>
                                        <span className="text-gray-700">
                                            Починайте з теорії - спочатку
                                            прочитайте правила, потім переходьте
                                            до практики
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
                                            2
                                        </span>
                                        <span className="text-gray-700">
                                            Вивчайте знаки групами -
                                            попереджувальні, заборонні, наказові
                                            окремо
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
                                            3
                                        </span>
                                        <span className="text-gray-700">
                                            Повторюйте матеріал регулярно -
                                            краще по 20-30 хвилин щодня
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
                                            4
                                        </span>
                                        <span className="text-gray-700">
                                            Аналізуйте помилки - розбирайте
                                            кожну неправильну відповідь
                                        </span>
                                    </li>
                                </ul>
                            </motion.div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

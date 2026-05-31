"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Car,
    BookOpen,
    Trophy,
    Clock,
    CheckCircle,
    ArrowRight,
    Wifi,
    Database,
    Smartphone,
    Target,
    Brain,
    Bookmark,
    AlertCircle,
    PlayCircle,
    Star,
    Users,
    TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const advantages = [
    {
        icon: Database,
        title: "Офіційна база запитань",
        description:
            "Ви вирішуєте саме ті запитання, які будуть на іспиті в сервісному центрі МВС",
    },
    {
        icon: Smartphone,
        title: "Єдиний доступ",
        description:
            "Ви можете користуватися веб-версією на будь-якому пристрої",
    },
];

const testingModes = [
    {
        icon: Target,
        title: "Іспит, як в Сервісному Центрі",
        description:
            "Симуляція реального іспиту в ТСЦ МВС з обмеженням часу, 20 запитань, 2 хвилини, максимум 2 помилки",
        features: [
            "Оцінка знань за стандартами офіційного іспиту",
            "Відчуйте атмосферу справжнього тестування",
        ],
    },
    {
        icon: BookOpen,
        title: "Вчити по темах",
        description: "Всі питання згруповані по темах",
        features: [
            "Проходьте тести без обмежень часу",
            "Отримуйте пояснення до кожного питання",
        ],
    },
    {
        icon: Clock,
        title: "Вчити по білетах",
        description: "20 випадкових питань з різних тем",
        features: [
            "Проходьте тести без обмежень часу",
            "Отримуйте пояснення до кожного питання",
        ],
    },
    {
        icon: AlertCircle,
        title: "Мої помилки",
        description:
            'У розділі "Мої помилки" можна переглянути запитання, де були зроблені помилки та прочитати пояснення для кращого засвоєння матеріалу.',
        features: [],
    },
    {
        icon: Brain,
        title: "Найскладніші запитання",
        description:
            'Розділ "Найскладніші запитання" містить 100 найбільш складних запитань, з якими найчастіше зустрічаються на іспиті.',
        features: [],
    },
    {
        icon: Bookmark,
        title: "Збережені запитання",
        description:
            "Під час тестування ви можете зберігати запитання для подальшого повторення. Це допоможе краще підготуватися та уникнути помилок у майбутньому.",
        features: [],
    },
];

const theoryTopics = [
    { title: "Лекції з ПДР", icon: BookOpen },
    { title: "Правила дорожнього руху", icon: BookOpen },
    { title: "Знаки", icon: AlertCircle },
    { title: "Дорожня розмітка", icon: Target },
    { title: "Регулювальник", icon: Users },
    { title: "Світлофор", icon: AlertCircle },
];

const testimonials = [
    {
        name: "Ігор",
        text: "Легко і зручно проходити навчання, дивлячись відео і закріплюючи знання, відповідаючи на питання по темах.",
    },
    {
        name: "Галина",
        text: "Дуже дякую за цей застосунок + сьогодні здала теоретичний іспит сама з першого разу, навчаючись по цій програмі, без автошколи. Всі питання на іспиті були такі ж, як тут. Дуже рада!",
    },
    {
        name: "Уляна",
        text: "Дуже дуже дякую розробникам за таку програму. Відразу придбала преміум версію на 1 місяць і почала вивчати питання по темах. Пройшла все менше ніж за неділю не витрачаючи багато часу і зусиль. Сьогодні здала 20/20.",
    },
    {
        name: "Андрій Смотрицький",
        text: "Чудовий додаток, особливо для водіїв які тільки навчаються, так і для водіїв зі стажем, так як ПДР часто змінюються, не завадить інколи перевірити свої знання)) Як водій зі стажем відкрив для себе багато нового))",
    },
    {
        name: "Олександр Гайдук",
        text: "Подобається, що можна прорішувати білети в різних режимах: як в СЦ, по темах, виключно мої помилки та найважчі запитання. Зручний та зрозумілий інтерфейс. Зручно в дорозі тренуватись.",
    },
    {
        name: "Олена Співак",
        text: "Дуже дуже дякую розробникам за таку програму. Відразу придбала преміум версію на 1 місяць і почала вивчати питання по темах. Пройшла все менше ніж за неділю не витрачаючи багато часу і зусиль. Сьогодні здала 20/20.",
    },
];

const stats = [
    {
        value: "900 000+",
        label: "студентів обрали нас для підготовки до іспитів",
        icon: Users,
    },
    {
        value: "4.8",
        label: "учнів успішно склали іспит",
        icon: Star,
    },
    {
        value: "47 хв/добу",
        label: "навчається учень на нашій платформі",
        icon: TrendingUp,
    },
];

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                        >
                            Готуйтеся до іспиту в ТСЦ МВС з<br />
                            <span className="text-blue-200">
                                Нові Офіційні Тести ПДР
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
                        >
                            Самопідготовка до теоретичного іспиту ПДР з Офіційні
                            тести ПДР онлайн. Реєструйся та почни навчання прямо
                            зараз!
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                                >
                                    👉 Почати тестування 👈
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />
                <div className="absolute -left-20 top-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl" />
            </section>

            <section className="py-12 bg-gray-50 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold">
                            <CheckCircle className="w-5 h-5" />5 січня 2026 р. -
                            Дата останнього оновлення запитань
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {advantages.map((advantage, index) => {
                            const Icon = advantage.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl p-6 shadow-md text-center"
                                >
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {advantage.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {advantage.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            Навчайтеся на платформі "Нові Офіційні Тести ПДР"
                            <br />
                            та скористайтеся всіма можливостями
                        </motion.h2>
                    </div>

                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 mt-16"
                    >
                        🧐 Які режими тестування доступні?
                    </motion.h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testingModes.map((mode, index) => {
                            const Icon = mode.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {mode.title}
                                    </h3>
                                    <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                                        {mode.description}
                                    </p>
                                    {mode.features.length > 0 && (
                                        <ul className="space-y-2">
                                            {mode.features.map(
                                                (feature, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-start gap-2 text-sm text-gray-600"
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link href="/practice/by-topic">
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Вчити по темах
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/tickets">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                >
                                    Вчити по білетах
                                </Button>
                            </Link>
                            <Link href="/practice/mistakes">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                >
                                    Мої помилки
                                </Button>
                            </Link>
                            <Link href="/practice/difficult">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                >
                                    Найскладніші
                                </Button>
                            </Link>
                            <Link href="/practice/saved">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                                >
                                    Збережені
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            😎 Теорія ПДР і самопідготовка
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-gray-600"
                        >
                            Тут зібрано все необхідне для самостійного вивчення
                            правил дорожнього руху
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {theoryTopics.map((topic, index) => {
                            const Icon = topic.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center"
                                >
                                    <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">
                                        {topic.title}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mt-8"
                    >
                        <Link href="/theory">
                            <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Вчити теорію
                                <BookOpen className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            🤔 Навчальні відео з поясненнями ПДР
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            Наші навчальні відео створені для того, щоб ви могли
                            легко та ефективно освоїти правила дорожнього руху.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8"
                        >
                            <PlayCircle className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Відеолекції в розділі Теорія-ПДР
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Переглядайте відео під час вивчення правил
                                дорожнього руху в будь-який час та на будь-якому
                                пристрої, у веб-версії або застосунку.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8"
                        >
                            <PlayCircle className="w-12 h-12 text-purple-600 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Відеопояснення тестових питань
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Отримуйте детальні пояснення та розбір тестового
                                питання, щоб краще засвоїти матеріал. Доступ до
                                матеріалів можливий у трьох форматах: "Вчити по
                                білетах", "Вчити по темах", "Часті помилки".
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mt-8 p-6 bg-yellow-50 rounded-xl max-w-3xl mx-auto border-2 border-yellow-200"
                    >
                        <p className="text-lg font-semibold text-gray-900">
                            Ці функції можливі для користувачів з Premium
                            доступом
                        </p>
                        <Link href="/pricing">
                            <Button
                                size="lg"
                                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                            >
                                Детальніше про Premium
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-center text-gray-900 mb-8"
                    >
                        Безліч корисної інформації для підготовки до іспиту
                        <br />
                        та впевненого водіння
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            "Інструкції",
                            "Маршрути для водіння",
                            "Поради водіям",
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center"
                            >
                                <h3 className="text-xl font-bold text-gray-900">
                                    {item}
                                </h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
                    >
                        Приєднуйтесь до спільноти успішних учнів
                        <br />
                        та оцініть ефективність нашого сервісу
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600 text-lg">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            Відгуки учнів
                        </motion.h2>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900"
                        >
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                            <span>4.8</span>
                            <span className="text-lg text-gray-600 font-normal">
                                11 000+ відгуків
                            </span>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-5 h-5 text-yellow-400 fill-yellow-400"
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-4 leading-relaxed">
                                    {testimonial.text}
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {testimonial.name}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-6"
                    >
                        Зареєструйтесь і почніть підготовку!
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xl mb-4 text-blue-100"
                    >
                        Створіть профіль і ви зможете:
                    </motion.p>
                    <motion.ul
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-left max-w-2xl mx-auto mb-8 space-y-3"
                    >
                        {[
                            "Зберігати результати всіх пройдених тестів",
                            "Відслідковувати свій прогрес у навчанні",
                            "Повертатися до пройдених тем та аналізувати свої помилки",
                            "Переглядати маршрути для практичного іспиту",
                        ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0 mt-0.5" />
                                <span className="text-lg">{item}</span>
                            </li>
                        ))}
                    </motion.ul>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold text-lg px-12 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                            >
                                Зареєструватися
                                <ArrowRight className="w-6 h-6 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Виникли питання або пропозиції щодо роботи сервісу?
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Заходьте у наш чат-бот <strong>Телеграм</strong> або
                        </p>
                        <p className="text-lg text-gray-600">
                            Пишіть на пошту{" "}
                            <a
                                href="mailto:support@pdr.com"
                                className="text-blue-600 hover:underline font-semibold"
                            >
                                support@pdr.com
                            </a>
                        </p>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

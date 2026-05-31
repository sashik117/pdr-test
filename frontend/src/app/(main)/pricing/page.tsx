"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Check,
    Crown,
    BookOpen,
    Brain,
    Timer,
    BarChart3,
    Shield,
    Zap,
    Sparkles,
    RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import Button from "@/components/ui/Button";
import api from "@/lib/api";

const PREMIUM_FEATURES = [
    {
        icon: BookOpen,
        title: "Необмежені тренувальні тести",
        description:
            "Проходьте стільки тестів, скільки потрібно для впевненої підготовки",
    },
    {
        icon: Brain,
        title: "Інтервальне повторення",
        description:
            "Розумна система повторення питань, які викликають труднощі",
    },
    {
        icon: Timer,
        title: "Симуляція іспиту",
        description: "Реалістична симуляція офіційного іспиту з таймером",
    },
    {
        icon: BarChart3,
        title: "Детальна статистика",
        description: "Аналіз помилок та прогрес по кожній темі",
    },
    {
        icon: Shield,
        title: "Без реклами",
        description: "Чистий інтерфейс без відволікаючих елементів",
    },
    {
        icon: Zap,
        title: "Пріоритетна підтримка",
        description: "Швидкі відповіді на ваші запитання",
    },
];

const COMPARISON_ITEMS = [
    { feature: "Доступ до всіх питань", free: true, premium: true },
    { feature: "Базова статистика", free: true, premium: true },
    { feature: "Тести за темами", free: "3 на день", premium: "Необмежено" },
    { feature: "Тренувальні білети", free: "1 на день", premium: "Необмежено" },
    { feature: "Симуляція іспиту", free: false, premium: true },
    { feature: "Інтервальне повторення", free: false, premium: true },
    { feature: "Детальний аналіз помилок", free: false, premium: true },
    { feature: "Без реклами", free: false, premium: true },
];

function PricingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{
        type: "success" | "error" | "info";
        text: string;
    } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const orderId = searchParams.get("orderId");

        if (orderId) {
            // Check order status after redirect from LiqPay
            checkOrderStatus(orderId);
        }
    }, [searchParams]);

    const checkOrderStatus = async (orderId: string) => {
        setCheckingStatus(true);
        setStatusMessage({
            type: "info",
            text: "Перевіряємо статус оплати...",
        });

        try {
            // Poll for status a few times as callback might be delayed
            let attempts = 0;
            const maxAttempts = 5;

            const checkStatus = async (): Promise<boolean> => {
                const { data } = await api.get(
                    `/payment/status?orderId=${orderId}`,
                );

                if (data.status === "completed") {
                    setStatusMessage({
                        type: "success",
                        text: "Оплата успішна! Ви тепер Premium користувач.",
                    });
                    updateUser({ isPremium: true });
                    setTimeout(() => router.push("/dashboard"), 2000);
                    return true;
                } else if (data.status === "failed") {
                    setStatusMessage({
                        type: "error",
                        text: "Оплата не вдалась. Спробуйте ще раз.",
                    });
                    return true;
                }
                return false;
            };

            const poll = async () => {
                while (attempts < maxAttempts) {
                    const done = await checkStatus();
                    if (done) break;
                    attempts++;
                    await new Promise((r) => setTimeout(r, 2000));
                }

                if (attempts >= maxAttempts) {
                    setStatusMessage({
                        type: "info",
                        text: "Обробка платежу може зайняти деякий час. Перевірте статус пізніше.",
                    });
                }
            };

            await poll();
        } catch (error) {
            console.error("Error checking order status:", error);
            setStatusMessage({
                type: "error",
                text: "Помилка перевірки статусу. Зверніться до підтримки.",
            });
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated || !user) {
            router.push("/auth/login?next=/pricing");
            return;
        }

        if (user.isPremium) {
            return;
        }

        setLoading(true);
        setStatusMessage(null);

        try {
            const { data } = await api.post("/payment/checkout", {
                userId: user.id,
                plan: "premium",
            });

            if (data.checkoutUrl && data.data && data.signature) {
                // Create and submit form to LiqPay
                const form = document.createElement("form");
                form.method = "POST";
                form.action = data.checkoutUrl;
                form.acceptCharset = "utf-8";

                const dataInput = document.createElement("input");
                dataInput.type = "hidden";
                dataInput.name = "data";
                dataInput.value = data.data;
                form.appendChild(dataInput);

                const signatureInput = document.createElement("input");
                signatureInput.type = "hidden";
                signatureInput.name = "signature";
                signatureInput.value = data.signature;
                form.appendChild(signatureInput);

                document.body.appendChild(form);
                form.submit();
            } else {
                throw new Error("Invalid checkout response");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setStatusMessage({
                type: "error",
                text: "Не вдалось розпочати оплату. Спробуйте ще раз.",
            });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-6">
                        <Crown className="w-5 h-5" />
                        <span className="font-medium">Premium підписка</span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                        Підготуйся до іспиту
                        <span className="text-blue-600"> на 100%</span>
                    </h1>

                    <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                        Отримай доступ до всіх можливостей платформи та склади
                        іспит з першого разу
                    </p>
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div
                        className={`mt-8 max-w-md mx-auto p-4 rounded-lg text-center ${
                            statusMessage.type === "success"
                                ? "bg-green-100 text-green-800"
                                : statusMessage.type === "error"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                        }`}
                    >
                        {checkingStatus && (
                            <RefreshCw className="w-5 h-5 inline-block mr-2 animate-spin" />
                        )}
                        {statusMessage.text}
                    </div>
                )}

                {/* Pricing Card */}
                <div className="mt-12 flex justify-center">
                    <div className="relative bg-white border-2 border-blue-500 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden">
                        {/* Badge */}
                        <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                            Найпопулярніший
                        </div>

                        <div className="p-8 pt-12">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Crown className="w-8 h-8 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Premium
                                    </h3>
                                    <p className="text-gray-500">
                                        Повний доступ на рік
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-baseline">
                                <span className="text-5xl font-extrabold text-gray-900">
                                    200
                                </span>
                                <span className="ml-2 text-2xl text-gray-500">
                                    грн
                                </span>
                                <span className="ml-2 text-gray-400">
                                    / рік
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                                Менше ніж 17 грн на місяць
                            </p>

                            <div className="mt-8">
                                <Button
                                    className="w-full text-lg py-4 flex items-center justify-center gap-2"
                                    size="lg"
                                    onClick={handleSubscribe}
                                    disabled={
                                        loading ||
                                        user?.isPremium ||
                                        checkingStatus
                                    }
                                >
                                    {user?.isPremium ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Активна підписка
                                        </>
                                    ) : loading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Обробка...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Отримати Premium
                                        </>
                                    )}
                                </Button>
                            </div>

                            <p className="mt-4 text-center text-sm text-gray-500">
                                Безпечна оплата через LiqPay
                            </p>
                        </div>

                        {/* Features list */}
                        <div className="px-8 pb-8">
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="font-semibold text-gray-900 mb-4">
                                    Що входить:
                                </h4>
                                <ul className="space-y-3">
                                    {[
                                        "Необмежені тренувальні тести",
                                        "Інтервальне повторення",
                                        "Симуляція офіційного іспиту",
                                        "Детальна статистика та аналіз",
                                        "Без реклами",
                                        "Пріоритетна підтримка",
                                    ].map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span className="text-gray-600">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mt-24">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Можливості Premium
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {PREMIUM_FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="mt-24">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Порівняння планів
                    </h2>

                    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="grid grid-cols-3 bg-gray-50 border-b">
                            <div className="p-4 font-semibold text-gray-700">
                                Функція
                            </div>
                            <div className="p-4 text-center font-semibold text-gray-700">
                                Безкоштовно
                            </div>
                            <div className="p-4 text-center font-semibold text-blue-600 bg-blue-50">
                                Premium
                            </div>
                        </div>

                        {COMPARISON_ITEMS.map((item, index) => (
                            <div
                                key={item.feature}
                                className={`grid grid-cols-3 ${index !== COMPARISON_ITEMS.length - 1 ? "border-b" : ""}`}
                            >
                                <div className="p-4 text-gray-600">
                                    {item.feature}
                                </div>
                                <div className="p-4 flex justify-center items-center">
                                    {typeof item.free === "boolean" ? (
                                        item.free ? (
                                            <Check className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <span className="w-5 h-5 text-gray-300">
                                                —
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-gray-500 text-sm">
                                            {item.free}
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 flex justify-center items-center bg-blue-50/50">
                                    {typeof item.premium === "boolean" ? (
                                        item.premium ? (
                                            <Check className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <span className="w-5 h-5 text-gray-300">
                                                —
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-blue-600 font-medium text-sm">
                                            {item.premium}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Часті запитання
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Як відбувається оплата?
                            </h3>
                            <p className="text-gray-500">
                                Оплата здійснюється через безпечну платіжну
                                систему LiqPay. Ви можете оплатити карткою Visa,
                                MasterCard або через Apple Pay / Google Pay.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Коли активується підписка?
                            </h3>
                            <p className="text-gray-500">
                                Підписка активується одразу після успішної
                                оплати. Ви отримаєте доступ до всіх Premium
                                функцій миттєво.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Чи можна повернути кошти?
                            </h3>
                            <p className="text-gray-500">
                                Так, протягом 14 днів з моменту покупки ви
                                можете звернутися до підтримки для повернення
                                коштів, якщо сервіс вам не підійшов.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Що відбувається після закінчення підписки?
                            </h3>
                            <p className="text-gray-500">
                                Після закінчення року ви повернетесь до
                                безкоштовного плану. Автоматичне списання
                                відсутнє — ви самі вирішуєте, чи продовжувати
                                підписку.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-24 text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Готовий до успішного складання іспиту?
                        </h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                            Приєднуйся до тисяч водіїв, які вже склали іспит з
                            нашою допомогою
                        </p>
                        <Button
                            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4"
                            size="lg"
                            onClick={handleSubscribe}
                            disabled={
                                loading || user?.isPremium || checkingStatus
                            }
                        >
                            {user?.isPremium
                                ? "Ви вже Premium"
                                : "Отримати Premium за 200 грн"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            }
        >
            <PricingContent />
        </Suspense>
    );
}

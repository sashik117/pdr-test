"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useVerifyEmail } from "@/hooks";
import Button from "@/components/ui/Button";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading",
    );
    const [message, setMessage] = useState("");

    const verifyEmailMutation = useVerifyEmail();

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Відсутній токен верифікації");
            return;
        }

        verifyEmailMutation.mutate(token, {
            onSuccess: (data) => {
                setStatus("success");
                setMessage(data.message || "Email успішно підтверджено!");

                setTimeout(() => {
                    router.push("/dashboard");
                }, 3000);
            },
            onError: (error: any) => {
                setStatus("error");
                setMessage(
                    error.response?.data?.message ||
                        "Не вдалося підтвердити email. Можливо, токен застарілий або недійсний.",
                );
            },
        });
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {status === "loading" && (
                        <>
                            <div className="flex justify-center mb-6">
                                <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Підтвердження email
                            </h1>
                            <p className="text-gray-600">
                                Зачекайте, будь ласка. Ми підтверджуємо ваш
                                email...
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-success-600" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Успішно підтверджено! 🎉
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-success-800">
                                    Ви будете автоматично перенаправлені на
                                    панель користувача через кілька секунд...
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="w-full"
                            >
                                Перейти до панелі
                            </Button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-10 h-10 text-error-600" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Помилка підтвердження
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800 mb-2">
                                    <strong>Що робити:</strong>
                                </p>
                                <ul className="text-sm text-yellow-700 text-left space-y-1">
                                    <li>
                                        • Перевірте, чи не застаріло посилання
                                        (дійсне 24 години)
                                    </li>
                                    <li>
                                        • Спробуйте запросити новий лист
                                        підтвердження
                                    </li>
                                    <li>
                                        • Зверніться до підтримки, якщо проблема
                                        повторюється
                                    </li>
                                </ul>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() =>
                                        router.push("/resend-verification")
                                    }
                                    className="w-full"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Отримати новий лист
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/login")}
                                    className="w-full"
                                >
                                    Повернутися до входу
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Потрібна допомога?{" "}
                    <a
                        href="mailto:support@pdr-ukraine.com"
                        className="text-primary-600 hover:underline"
                    >
                        Зв'яжіться з нами
                    </a>
                </p>
            </motion.div>
        </div>
    );
}

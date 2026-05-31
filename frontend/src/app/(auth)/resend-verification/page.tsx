"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useResendVerification } from "@/hooks";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ResendVerificationPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const resendMutation = useResendVerification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        resendMutation.mutate(email, {
            onSuccess: () => {
                setSuccess(true);
            },
            onError: (err: any) => {
                setError(
                    err.response?.data?.message ||
                        "Не вдалося відправити лист. Спробуйте ще раз.",
                );
            },
        });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-success-600" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Лист відправлено! 📧
                        </h1>

                        <p className="text-gray-600 mb-6">
                            Перевірте вашу поштову скриньку{" "}
                            <strong className="text-gray-900">{email}</strong>.
                            Ми відправили вам новий лист з підтвердженням.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>Важливо:</strong> Посилання дійсне
                                протягом 24 годин. Не забудьте перевірити папку
                                "Спам".
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => router.push("/login")}
                                className="w-full"
                            >
                                Повернутися до входу
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSuccess(false)}
                                className="w-full"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Відправити ще раз
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад
                    </button>

                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-primary-600" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                        Повторна відправка листа
                    </h1>

                    <p className="text-center text-gray-600 mb-8">
                        Введіть email, який ви використовували при реєстрації, і
                        ми надішлемо вам новий лист з підтвердженням.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            error={error}
                        />

                        {error && (
                            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                                <p className="text-sm text-error-800">
                                    {error}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            isLoading={resendMutation.isPending}
                            disabled={resendMutation.isPending || !email}
                            className="w-full"
                        >
                            {resendMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Відправляємо...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Відправити лист
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Вже підтвердили email?{" "}
                            <button
                                onClick={() => router.push("/login")}
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Увійти
                            </button>
                        </p>
                    </div>
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

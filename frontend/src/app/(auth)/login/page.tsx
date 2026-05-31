"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [showEmailVerificationError, setShowEmailVerificationError] =
        useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState("");

    const loginMutation = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!formData.email) {
            setErrors({ email: "Введіть email" });
            return;
        }
        if (!formData.password) {
            setErrors({ password: "Введіть пароль" });
            return;
        }

        loginMutation.mutate(formData, {
            onError: (
                error: Error & {
                    response?: {
                        data?: {
                            message?: string;
                            statusCode?: number;
                            data?: any;
                        };
                        status?: number;
                    };
                },
            ) => {
                if (
                    error.response?.status === 403 &&
                    error.response?.data?.data?.emailVerified === false
                ) {
                    setUnverifiedEmail(
                        error.response.data.data.email || formData.email,
                    );
                    setShowEmailVerificationError(true);
                } else {
                    setErrors({
                        general:
                            error.response?.data?.message ||
                            "Помилка входу. Спробуйте ще раз.",
                    });
                }
            },
        });
    };

    if (showEmailVerificationError) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card variant="elevated" className="p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Email не підтверджено
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Ви повинні підтвердити ваш email перед входом в
                            систему.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-yellow-800 mb-2">
                                <strong>Що робити:</strong>
                            </p>
                            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                                <li>
                                    Перевірте вашу пошту{" "}
                                    <strong>{unverifiedEmail}</strong>
                                </li>
                                <li>Знайдіть лист від ПДР Україна</li>
                                <li>
                                    Натисніть на посилання для підтвердження
                                </li>
                            </ol>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() =>
                                    router.push("/resend-verification")
                                }
                                className="w-full"
                            >
                                Відправити лист ще раз
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setShowEmailVerificationError(false)
                                }
                                className="w-full"
                            >
                                Спробувати інший email
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            <Card variant="elevated" className="p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Вхід в акаунт
                    </h1>
                    <p className="text-gray-600">Введіть свої дані для входу</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {errors.general && (
                        <div className="p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                            {errors.general}
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            error={errors.email}
                            className="pl-12"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Пароль"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            error={errors.password}
                            className="pl-12 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={loginMutation.isPending}
                    >
                        Увійти
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Немає акаунту?{" "}
                        <Link
                            href="/register"
                            className="text-primary-600 hover:underline font-medium"
                        >
                            Зареєструватися
                        </Link>
                    </p>
                </div>
            </Card>
        </motion.div>
    );
}

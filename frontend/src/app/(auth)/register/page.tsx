"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useRegister } from "@/hooks";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    const registerMutation = useRegister();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!formData.name) {
            setErrors({ name: "Введіть ім'я" });
            return;
        }
        if (!formData.email) {
            setErrors({ email: "Введіть email" });
            return;
        }
        if (!formData.password) {
            setErrors({ password: "Введіть пароль" });
            return;
        }
        if (formData.password.length < 6) {
            setErrors({ password: "Пароль має містити мінімум 6 символів" });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: "Паролі не співпадають" });
            return;
        }

        registerMutation.mutate(
            {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            },
            {
                onSuccess: () => {
                    setRegisteredEmail(formData.email);
                    setRegistrationSuccess(true);
                },
                onError: (
                    error: Error & {
                        response?: { data?: { message?: string } };
                    },
                ) => {
                    setErrors({
                        general:
                            error.response?.data?.message ||
                            "Помилка реєстрації. Спробуйте ще раз.",
                    });
                },
            },
        );
    };

    if (registrationSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card variant="elevated" className="p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-success-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Перевірте вашу пошту! 📧
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Ми відправили лист з підтвердженням на{" "}
                            <strong className="text-gray-900">
                                {registeredEmail}
                            </strong>
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
                            <p className="text-sm text-blue-800 mb-2">
                                <strong>Що далі:</strong>
                            </p>
                            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                <li>Відкрийте вашу поштову скриньку</li>
                                <li>Знайдіть лист від ПДР Україна</li>
                                <li>
                                    Натисніть на посилання для підтвердження
                                </li>
                            </ol>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
                            <p className="text-sm text-yellow-800">
                                <strong>Не отримали лист?</strong> Перевірте
                                папку "Спам" або{" "}
                                <button
                                    onClick={() =>
                                        router.push("/resend-verification")
                                    }
                                    className="text-primary-600 hover:underline font-medium"
                                >
                                    запросіть новий
                                </button>
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push("/login")}
                            className="w-full"
                        >
                            Повернутися до входу
                        </Button>
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
                        Реєстрація
                    </h1>
                    <p className="text-gray-600">
                        Створіть акаунт для збереження прогресу
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {errors.general && (
                        <div className="p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                            {errors.general}
                        </div>
                    )}

                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Ваше ім'я"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            error={errors.name}
                            className="pl-12"
                        />
                    </div>

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

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Підтвердіть пароль"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value,
                                })
                            }
                            error={errors.confirmPassword}
                            className="pl-12"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={registerMutation.isPending}
                    >
                        Зареєструватися
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Вже є акаунт?{" "}
                        <Link
                            href="/login"
                            className="text-primary-600 hover:underline font-medium"
                        >
                            Увійти
                        </Link>
                    </p>
                </div>
            </Card>
        </motion.div>
    );
}

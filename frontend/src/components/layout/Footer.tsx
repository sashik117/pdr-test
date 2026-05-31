"use client";

import Link from "next/link";
import { Car, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                ПДР Тест
                            </span>
                        </Link>
                        <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
                            Офіційний сервіс для підготовки до іспитів на отримання посвідчення водія.
                            Актуальні білети 2026 року, затверджені ГСЦ МВС.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-200">Навігація</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/questions" className="text-gray-400 hover:text-white transition-colors">
                                    Каталог питань
                                </Link>
                            </li>
                            <li>
                                <Link href="/tickets" className="text-gray-400 hover:text-white transition-colors">
                                    Білети по номерах
                                </Link>
                            </li>
                            <li>
                                <Link href="/theory" className="text-gray-400 hover:text-white transition-colors">
                                    Теорія ПДР
                                </Link>
                            </li>
                            <li>
                                <Link href="/practice/by-topic" className="text-gray-400 hover:text-white transition-colors">
                                    Тематичні тести
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-200">Контакти</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:support@pdr-test.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                    <Mail className="w-5 h-5" />
                                    support@pdr-test.com
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                    Написати в Telegram
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Всі права захищено. Тестові завдання затверджено наказом ГСЦ МВС.</p>
                </div>
            </div>
        </footer>
    );
}

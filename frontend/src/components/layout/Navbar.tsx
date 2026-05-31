"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    Car,
    BookOpen,
    History,
    LayoutDashboard,
    LogOut,
    User,
    ClipboardList,
    MessageSquareText,
    BarChart3,
    CreditCard,
    Layers,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const navItems = [
    { href: "/dashboard", label: "Панель", icon: LayoutDashboard },
    { href: "/theory", label: "Теорія", icon: BookOpen },
    { href: "/practice/by-topic", label: "Практика", icon: Layers },
    { href: "/tickets", label: "Білети", icon: ClipboardList },
    { href: "/questions", label: "Питання", icon: MessageSquareText },
    { href: "/progress", label: "Прогрес", icon: BarChart3 },
    { href: "/history", label: "Історія", icon: History },
    { href: "/pricing", label: "Тарифи", icon: CreditCard },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    const isItemActive = (href: string) => {
        if (href === "/dashboard") return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                            ПДР Тест
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-0.5">
                        {isAuthenticated &&
                            navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isItemActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary-50 text-primary-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "w-4 h-4",
                                                isActive
                                                    ? "text-primary-600"
                                                    : "text-gray-400",
                                            )}
                                        />
                                        {item.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className="absolute -bottom-[13px] left-2 right-2 h-0.5 bg-primary-600 rounded-full"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                    </div>

                    <div className="hidden lg:flex items-center gap-4 shrink-0">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span>{user?.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4 mr-1.5" />
                                    Вийти
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                                    >
                                        Вхід
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        size="sm"
                                        className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-shadow"
                                    >
                                        Реєстрація
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <X className="w-6 h-6 text-gray-600" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {isAuthenticated &&
                                navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isItemActive(item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-primary-50 text-primary-700"
                                                    : "text-gray-600 hover:bg-gray-50",
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "w-5 h-5",
                                                    isActive
                                                        ? "text-primary-600"
                                                        : "text-gray-400",
                                                )}
                                            />
                                            {item.label}
                                        </Link>
                                    );
                                })}

                            <div className="pt-4 mt-2 border-t border-gray-100">
                                {isAuthenticated ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl mx-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span>{user?.name}</span>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-6 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Вийти
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 px-2">
                                        <Link
                                            href="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full"
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full justify-center"
                                            >
                                                Вхід
                                            </Button>
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full"
                                        >
                                            <Button className="w-full justify-center shadow-lg shadow-primary-500/20">
                                                Реєстрація
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

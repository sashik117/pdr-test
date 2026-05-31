"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SignReferenceProps {
    code: string;
    type: "sign" | "marking";
    description?: string;
    className?: string;
}

export default function SignReference({
    code,
    type,
    description,
    className = "",
}: SignReferenceProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const getImagePath = useCallback(() => {
        if (type === "sign") {
            return `/images/theory/signs/${code}.png`;
        } else {
            return `/images/theory/marking/${code}.png`;
        }
    }, [code, type]);

    const imagePath = getImagePath();
    const displayText =
        type === "sign" ? `знаком ${code}` : `розміткою ${code}`;

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsModalOpen(false);
        }
    }, []);

    return (
        <>
            <span
                className={`relative inline-block ${className}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <button
                    onClick={handleClick}
                    className="text-blue-600 hover:text-blue-800 font-medium underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
                >
                    {displayText}
                </button>

                <AnimatePresence>
                    {isHovered && !imageError && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                        >
                            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-3 min-w-[120px]">
                                <div className="flex flex-col items-center gap-2">
                                    <img
                                        src={imagePath}
                                        alt={`${type === "sign" ? "Знак" : "Розмітка"} ${code}`}
                                        className="max-w-[80px] max-h-[80px] object-contain"
                                        onLoad={() => setImageLoaded(true)}
                                        onError={() => setImageError(true)}
                                    />
                                    {description && (
                                        <p className="text-xs text-gray-600 text-center max-w-[150px]">
                                            {description}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        Клікніть для перегляду
                                    </p>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                    <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </span>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 md:p-12"
                        onClick={handleClose}
                        onKeyDown={handleKeyDown}
                        role="dialog"
                        aria-modal="true"
                        tabIndex={-1}
                    >
                        <motion.div
                            initial={{ backdropFilter: "blur(0px)" }}
                            animate={{ backdropFilter: "blur(12px)" }}
                            exit={{ backdropFilter: "blur(0px)" }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black/60"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{
                                duration: 0.3,
                                type: "spring",
                                damping: 25,
                            }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {type === "sign"
                                        ? `Знак ${code}`
                                        : `Розмітка ${code}`}
                                </h3>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    aria-label="Закрити"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 flex flex-col items-center justify-center">
                                <motion.img
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    src={imagePath}
                                    alt={`${type === "sign" ? "Знак" : "Розмітка"} ${code}`}
                                    className="max-w-full max-h-[50vh] object-contain drop-shadow-lg"
                                />
                                {description && (
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay: 0.2,
                                            duration: 0.3,
                                        }}
                                        className="mt-4 text-center text-gray-600 max-w-md"
                                    >
                                        {description}
                                    </motion.p>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
                                Натисніть Esc або клікніть за межами для
                                закриття
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

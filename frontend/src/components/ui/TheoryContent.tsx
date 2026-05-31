"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ImageModalProps {
    src: string;
    alt: string;
    isOpen: boolean;
    onClose: () => void;
}

function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        },
        [onClose],
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 md:p-12"
                    onClick={onClose}
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
                        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                            aria-label="Закрити"
                        >
                            <X className="w-5 h-5 text-gray-700" />
                        </button>

                        <div className="p-4 flex items-center justify-center min-h-[200px]">
                            <motion.img
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                src={src}
                                alt={alt}
                                className="max-w-full max-h-[75vh] object-contain drop-shadow-lg"
                            />
                        </div>

                        <div className="py-3 bg-gray-50 text-center text-sm text-gray-500">
                            Натисніть Esc або клікніть за межами для закриття
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface TheoryContentProps {
    html: string;
    className?: string;
}

export default function TheoryContent({
    html,
    className = "",
}: TheoryContentProps) {
    const [modalImage, setModalImage] = useState<{
        src: string;
        alt: string;
    } | null>(null);
    const [hoveredImage, setHoveredImage] = useState<string | null>(null);

    const processedHtml = useMemo(() => {
        if (!html) return "";

        let processed = html;

        processed = processed.replace(
            /<img([^>]*)src="([^"]+)"([^>]*)>/gi,
            (match, before, src, after) => {
                const altMatch = match.match(/alt="([^"]*)"/i);
                const alt = altMatch ? altMatch[1] : "Зображення";

                return `<span class="inline-image-wrapper" data-src="${src}" data-alt="${alt}"><img${before}src="${src}"${after} class="inline-theory-image" /></span>`;
            },
        );

        return processed;
    }, [html]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;

        const wrapper = target.closest(".inline-image-wrapper") as HTMLElement;
        if (wrapper) {
            const src = wrapper.dataset.src;
            const alt = wrapper.dataset.alt || "Зображення";
            if (src) {
                e.preventDefault();
                e.stopPropagation();
                setModalImage({ src, alt });
            }
        }

        if (target.tagName === "IMG") {
            const src = target.getAttribute("src");
            const alt = target.getAttribute("alt") || "Зображення";
            if (src) {
                e.preventDefault();
                e.stopPropagation();
                setModalImage({ src, alt });
            }
        }
    }, []);

    const handleMouseOver = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement;
            const wrapper = target.closest(
                ".inline-image-wrapper",
            ) as HTMLElement;
            if (wrapper) {
                setHoveredImage(wrapper.dataset.src || null);
            } else if (target.tagName === "IMG") {
                setHoveredImage(target.getAttribute("src"));
            }
        },
        [],
    );

    const handleMouseOut = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (
                !relatedTarget?.closest(".inline-image-wrapper") &&
                relatedTarget?.tagName !== "IMG"
            ) {
                setHoveredImage(null);
            }
        },
        [],
    );

    return (
        <>
            <div
                onClick={handleClick}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                className={`theory-content ${className}`}
                dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            <style jsx global>{`
                .theory-content {
                    line-height: 1.7;
                }

                .theory-content p {
                    margin-bottom: 1rem;
                }

                .theory-content a {
                    color: #2563eb;
                    text-decoration: none;
                }

                .theory-content a:hover {
                    text-decoration: underline;
                }

                .inline-image-wrapper {
                    display: inline-flex;
                    align-items: center;
                    cursor: pointer;
                    position: relative;
                    vertical-align: middle;
                    transition: transform 0.15s ease;
                }

                .inline-image-wrapper:hover {
                    transform: scale(1.1);
                }

                .inline-image-wrapper::after {
                    content: "";
                    position: absolute;
                    inset: -4px;
                    border-radius: 4px;
                    background: rgba(59, 130, 246, 0.1);
                    opacity: 0;
                    transition: opacity 0.15s ease;
                }

                .inline-image-wrapper:hover::after {
                    opacity: 1;
                }

                .inline-theory-image {
                    display: inline;
                    vertical-align: middle;
                    max-height: 1.5em;
                    cursor: pointer;
                }

                .theory-content img[height="40"],
                .theory-content img[height="50"],
                .theory-content img[height="60"] {
                    max-height: 2.5em;
                }

                .theory-content img[height="100"],
                .theory-content img[height="150"],
                .theory-content img[height="200"] {
                    display: block;
                    margin: 1rem auto;
                    max-height: none;
                    max-width: 100%;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
            `}</style>

            <ImageModal
                src={modalImage?.src || ""}
                alt={modalImage?.alt || ""}
                isOpen={!!modalImage}
                onClose={() => setModalImage(null)}
            />
        </>
    );
}

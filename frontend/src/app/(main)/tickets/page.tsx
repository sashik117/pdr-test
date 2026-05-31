"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, FileQuestion } from "lucide-react";
import { useTickets } from "@/hooks";
import Card from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function TicketsPage() {
    const { data, isLoading } = useTickets();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Білети
                </h1>
                <p className="text-gray-600">
                    Виберіть білет для проходження тесту. Кожен білет містить 20
                    питань.
                </p>
            </motion.div>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }, (_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {data?.tickets.map((ticket, index) => (
                        <motion.div
                            key={ticket.ticketNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                        >
                            <Link href={`/test/ticket/${ticket.ticketNumber}`}>
                                <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary-200 border-2 border-transparent">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
                                            <BookOpen className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            Білет {ticket.ticketNumber}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                                            <FileQuestion className="w-4 h-4" />
                                            {ticket.questionsCount} питань
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {data && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center text-gray-500"
                >
                    Всього {data.total} білетів
                </motion.div>
            )}
        </div>
    );
}

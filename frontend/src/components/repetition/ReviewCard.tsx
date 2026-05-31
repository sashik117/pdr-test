"use client";

import React from "react";
import { Question } from "@/types";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

interface ReviewCardProps {
    question: Question & { 
        repetition?: { 
            interval: number; 
            repetitions: number 
        } 
    };
    onGrade: (grade: number) => void;
}

export function ReviewCard({ question, onGrade }: ReviewCardProps) {
    const [showAnswer, setShowAnswer] = React.useState(false);

    const handleGrade = (grade: number) => {
        setShowAnswer(false);
        onGrade(grade);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="shadow-lg border-2 dark:border-gray-800 p-0 overflow-hidden">
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Ticket #{question.ticketNumber} / Q{question.questionNumber}</span>
                        {question.repetition && (
                            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                Interval: {question.repetition.interval}d
                            </span>
                        )}
                    </div>
                    {question.imageUrl && (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                            <Image
                                src={`https://pdr-api.b-cdn.net/${question.imageUrl}`} 
                                alt="Question Image"
                                fill
                                style={{ objectFit: "contain" }}
                            />
                        </div>
                    )}
                    <h3 className="text-xl font-semibold leading-relaxed">
                        {question.text}
                    </h3>
                </div>
                
                <div className="px-6 pb-6">
                    {!showAnswer ? (
                        <div className="space-y-4">
                             <div className="grid gap-3">
                                {question.options.map((opt) => (
                                    <div 
                                        key={opt.id}
                                        className="p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setShowAnswer(true)}
                                    >
                                        {opt.text}
                                    </div>
                                ))}
                             </div>
                        </div>
                    ) : (
                        <AnimatePresence>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="grid gap-3">
                                    {question.options.map((opt) => (
                                        <div 
                                            key={opt.id}
                                            className={cn(
                                                "p-4 rounded-lg border",
                                                opt.id === question.correctAnswer 
                                                    ? "bg-green-100 border-green-500"
                                                    : "opacity-50"
                                            )}
                                        >
                                            {opt.text}
                                            {opt.id === question.correctAnswer && " ✅"}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="p-4 bg-gray-100 rounded-lg text-sm">
                                    <p className="font-semibold mb-1">Explanation:</p>
                                    {question.explanation}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t flex flex-col gap-4">
                    {!showAnswer ? (
                        <Button 
                            className="w-full h-12 text-lg" 
                            onClick={() => setShowAnswer(true)}
                        >
                            Show Answer
                        </Button>
                    ) : (
                        <div className="grid grid-cols-4 gap-2 w-full">
                            <div className="flex flex-col gap-1">
                                <Button 
                                    variant="outline" 
                                    className="border-red-200 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleGrade(0)}
                                >
                                    Again
                                </Button>
                                <span className="text-[10px] text-center text-gray-500">&lt; 1m</span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <Button 
                                    variant="outline" 
                                    className="border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                    onClick={() => handleGrade(2)}
                                >
                                    Hard
                                </Button>
                                <span className="text-[10px] text-center text-gray-500">2d</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Button 
                                    variant="outline" 
                                    className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                    onClick={() => handleGrade(4)}
                                >
                                    Good
                                </Button>
                                <span className="text-[10px] text-center text-gray-500">4d</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Button 
                                    variant="outline" 
                                    className="border-green-200 hover:bg-green-50 hover:text-green-600"
                                    onClick={() => handleGrade(5)}
                                >
                                    Easy
                                </Button>
                                <span className="text-[10px] text-center text-gray-500">7d</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewCard } from "@/components/repetition/ReviewCard";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/lib/auth";
import { repetitionApi } from "@/lib/api";

export default function RepetitionPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const fetchDue = async () => {
            try {
                if (!isAuthenticated) {
                }

                const data = await repetitionApi.getDue();

                if (data.success) {
                    setQuestions(data.questions);
                }
            } catch (error) {
                console.error("Failed to load cards", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchDue();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, router]);

    const handleGrade = async (grade: number) => {
        const currentQ = questions[currentIndex];

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setFinished(true);
        }

        try {
            await repetitionApi.review({
                questionId: currentQ.questionId,
                grade,
            });
        } catch (error) {
            console.error("Failed to submit review", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="container max-w-2xl py-20 text-center space-y-6">
                <h1 className="text-3xl font-bold">All caught up! 🎉</h1>
                <p className="text-gray-600">
                    You've reviewed all your due cards for now. Good job!
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="container max-w-2xl py-20 text-center space-y-6">
                <h1 className="text-3xl font-bold">No cards due</h1>
                <p className="text-gray-600">
                    You don't have any cards due for review right now. Take some
                    new tests to add cards to your deck!
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="container max-w-4xl py-10 space-y-8 px-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Daily Review</h1>
                <div className="text-sm text-gray-500">
                    {currentIndex + 1} / {questions.length}
                </div>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                    className="bg-primary-600 h-full transition-all duration-300"
                    style={{
                        width: `${(currentIndex / questions.length) * 100}%`,
                    }}
                />
            </div>

            <ReviewCard
                key={currentQuestion.questionId}
                question={currentQuestion}
                onGrade={handleGrade}
            />
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Flag, Loader2 } from "lucide-react";
import {
    useRandomQuestions,
    useTicket,
    useSubmitTest,
    useTestStore,
} from "@/hooks";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import QuestionCard from "@/components/test/QuestionCard";
import QuestionNav from "@/components/test/QuestionNav";
import Timer from "@/components/test/Timer";
import ResultModal from "@/components/test/ResultModal";
import { QuestionSkeleton } from "@/components/ui/Skeleton";

export default function TestPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params.id as string;

    const [showResult, setShowResult] = useState(false);
    const [testResult, setTestResult] = useState<{
        score: number;
        passed: boolean;
        correctAnswers: number;
        totalQuestions: number;
        answers: {
            questionId: string;
            answer: string;
            correct: boolean;
            correctAnswer: string;
        }[];
    } | null>(null);

    const {
        questions,
        currentIndex,
        answers,
        startedAt,
        startTest,
        setAnswer,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        getAnswersArray,
        resetTest,
    } = useTestStore();

    const isRandomTest = testId === "random";
    const ticketNumber = testId.startsWith("ticket/")
        ? parseInt(testId.split("/")[1])
        : null;

    const { data: randomData, isLoading: randomLoading } = useRandomQuestions(
        20,
        isRandomTest && questions.length === 0,
    );

    const { data: ticketData, isLoading: ticketLoading } = useTicket(
        ticketNumber,
        !!ticketNumber && questions.length === 0,
    );

    const submitMutation = useSubmitTest();

    useEffect(() => {
        resetTest();

        return () => {
            resetTest();
        };
    }, [testId, resetTest]);

    useEffect(() => {
        if (randomData?.questions) {
            startTest(randomData.questions);
        }
    }, [randomData, startTest]);

    useEffect(() => {
        if (ticketData?.questions) {
            startTest(ticketData.questions);
        }
    }, [ticketData, startTest]);

    const isLoading =
        (isRandomTest && randomLoading) || (ticketNumber && ticketLoading);
    const currentQuestion = questions[currentIndex];
    const currentAnswer = currentQuestion
        ? answers.get(currentQuestion.questionId)
        : null;
    const answeredCount = answers.size;
    const allAnswered = answeredCount === questions.length;

    const handleSubmit = () => {
        if (!startedAt) return;

        submitMutation.mutate(
            {
                questions: questions.map((q) => q.questionId),
                answers: getAnswersArray(),
                startedAt,
            },
            {
                onSuccess: (data) => {
                    setTestResult({
                        score: data.score,
                        passed: data.passed,
                        correctAnswers: data.correctAnswers,
                        totalQuestions: data.totalQuestions,
                        answers: data.answers.map((a) => ({
                            questionId: a.questionId,
                            answer: a.answer,
                            correct: a.correct,
                            correctAnswer: a.correctAnswer,
                        })),
                    });
                    setShowResult(true);
                },
            },
        );
    };

    const handleTimeUp = () => {
        handleSubmit();
    };

    const handleRetry = () => {
        setShowResult(false);
        setTestResult(null);
        resetTest();
        if (isRandomTest) {
            router.push("/test/random");
        } else if (ticketNumber) {
            router.push(`/test/ticket/${ticketNumber}`);
        }
        router.refresh();
    };

    const handleGoHome = () => {
        resetTest();
        router.push("/dashboard");
    };

    const handleViewAnswers = () => {
        setShowResult(false);
    };

    const resultsMap = testResult
        ? new Map(testResult.answers.map((a) => [a.questionId, a.correct]))
        : undefined;

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <QuestionSkeleton />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Завантаження питань...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isRandomTest
                            ? "Випадковий тест"
                            : `Білет ${ticketNumber}`}
                    </h1>
                    <p className="text-gray-600">
                        Питання {currentIndex + 1} з {questions.length}
                    </p>
                </div>

                {startedAt && !testResult && !showResult && (
                    <Timer startedAt={startedAt} onTimeUp={handleTimeUp} />
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <ProgressBar
                    value={answeredCount}
                    max={questions.length}
                    showLabel
                    colorClass={
                        testResult
                            ? testResult.passed
                                ? "bg-success-500"
                                : "bg-error-500"
                            : "bg-primary-600"
                    }
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
            >
                <Card className="p-4">
                    <QuestionNav
                        total={questions.length}
                        current={currentIndex}
                        answers={answers}
                        questionIds={questions.map((q) => q.questionId)}
                        onNavigate={goToQuestion}
                        results={resultsMap}
                    />
                </Card>
            </motion.div>

            {currentQuestion && (
                <QuestionCard
                    key={currentQuestion.questionId}
                    question={currentQuestion}
                    selectedAnswer={currentAnswer || null}
                    onSelectAnswer={(answer) =>
                        setAnswer(currentQuestion.questionId, answer)
                    }
                    showResult={!!testResult}
                    correctAnswer={
                        testResult
                            ? testResult.answers.find(
                                  (a) =>
                                      a.questionId ===
                                      currentQuestion.questionId,
                              )?.correctAnswer
                            : undefined
                    }
                />
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
            >
                <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Попереднє
                </Button>

                <div className="flex gap-3">
                    {!testResult && (
                        <Button
                            variant="danger"
                            onClick={handleSubmit}
                            disabled={!allAnswered || submitMutation.isPending}
                            isLoading={submitMutation.isPending}
                        >
                            <Flag className="w-4 h-4 mr-2" />
                            Завершити тест
                        </Button>
                    )}

                    {testResult && (
                        <Button onClick={handleRetry}>Спробувати ще</Button>
                    )}
                </div>

                <Button
                    variant="outline"
                    onClick={nextQuestion}
                    disabled={currentIndex === questions.length - 1}
                >
                    Наступне
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </motion.div>

            {testResult && (
                <ResultModal
                    isOpen={showResult}
                    onClose={() => setShowResult(false)}
                    score={testResult.score}
                    passed={testResult.passed}
                    correctAnswers={testResult.correctAnswers}
                    totalQuestions={testResult.totalQuestions}
                    onRetry={handleRetry}
                    onViewAnswers={handleViewAnswers}
                    onGoHome={handleGoHome}
                />
            )}
        </div>
    );
}

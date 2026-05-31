import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface TestResult extends Document {
    _id?: string;
    userId: string;
    startedAt: Date;
    completedAt: Date;
    questions: string[];
    answers: { questionId: string; answer: string; correct: boolean }[];
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
}

export async function getTestResultsCollection(): Promise<Collection<TestResult>> {
    const db = await connectToDatabase();
    return db.collection<TestResult>("test_results");
}

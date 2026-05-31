import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface Question extends Document {
    _id?: string;
    questionId: string;
    ticketNumber: number;
    questionNumber: number;
    text: string;
    imageUrl: string | null;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
    category: string;
    topic: string;
    difficulty: number; // 1-5
    contentHash?: string;
}

export async function getQuestionsCollection(): Promise<Collection<Question>> {
    const db = await connectToDatabase();
    return db.collection<Question>("questions");
}

import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface UserProgress extends Document {
    _id?: string;
    userId: string;
    topicSlug: string;
    totalQuestions: number;
    answeredCorrectly: number;
    totalAttempts: number;
    lastAttemptAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export async function getUserProgressCollection(): Promise<Collection<UserProgress>> {
    const db = await connectToDatabase();
    return db.collection<UserProgress>("user_progress");
}

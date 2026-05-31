import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface UserMistake extends Document {
    _id?: string;
    userId: string;
    questionId: string;
    topicSlug: string;
    mistakeCount: number;
    isResolved: boolean;
    lastMistakeAt: Date;
    createdAt: Date;
}

export async function getUserMistakesCollection(): Promise<Collection<UserMistake>> {
    const db = await connectToDatabase();
    return db.collection<UserMistake>("user_mistakes");
}

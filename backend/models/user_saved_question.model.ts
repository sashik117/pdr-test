import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface UserSavedQuestion extends Document {
    _id?: string;
    userId: string;
    questionId: string;
    savedAt: Date;
}

export async function getUserSavedQuestionsCollection(): Promise<Collection<UserSavedQuestion>> {
    const db = await connectToDatabase();
    return db.collection<UserSavedQuestion>("user_saved_questions");
}

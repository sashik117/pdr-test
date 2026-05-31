import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface Topic extends Document {
    _id?: string;
    name: string;
    slug: string;
    description: string;
    difficulty: number; // 1-5 average difficulty
    questionCount: number;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export async function getTopicsCollection(): Promise<Collection<Topic>> {
    const db = await connectToDatabase();
    return db.collection<Topic>("topics");
}

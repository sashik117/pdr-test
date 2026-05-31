import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface Subscription extends Document {
    _id?: string;
    userId: string;
    plan: "premium" | "pro"; // extensible
    startDate: Date;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getSubscriptionsCollection(): Promise<Collection<Subscription>> {
    const db = await connectToDatabase();
    return db.collection<Subscription>("subscriptions");
}

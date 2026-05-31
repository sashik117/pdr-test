import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface User extends Document {
    _id?: string;
    email: string;
    password: string;
    name: string;
    role: "user" | "admin";
    emailVerified: boolean;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    createdAt: Date;
    isPremium?: boolean;
    subscriptionExpiresAt?: Date;
}

export async function getUsersCollection(): Promise<Collection<User>> {
    const db = await connectToDatabase();
    return db.collection<User>("users");
}

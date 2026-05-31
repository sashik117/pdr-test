import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface IdempotencyKey extends Document {
    _id?: string;
    key: string;
    userId?: string;
    path: string;
    method: string;
    params?: any;
    body?: any;
    status: "processing" | "completed" | "failed";
    response?: any;
    statusCode?: number;
    createdAt: Date;
    expireAt: Date;
}

export async function getIdempotencyKeysCollection(): Promise<Collection<IdempotencyKey>> {
    const db = await connectToDatabase();
    return db.collection<IdempotencyKey>("idempotency_keys");
}

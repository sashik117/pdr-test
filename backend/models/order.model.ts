import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface Order extends Document {
    _id?: string;
    userId: string;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed";
    paymentProvider: "mock" | "liqpay" | "stripe";
    transactionId?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

export async function getOrdersCollection(): Promise<Collection<Order>> {
    const db = await connectToDatabase();
    return db.collection<Order>("orders");
}

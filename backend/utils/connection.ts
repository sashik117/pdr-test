import { MongoClient, Db } from "mongodb";
import config from "../config";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
    if (db) return db;

    const uri = config.MONGO_URI;

    client = new MongoClient(uri);
    await client.connect();

    db = client.db();
    console.log("Connected to MongoDB");

    return db;
}

export async function closeConnection(): Promise<void> {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}


export async function getCollection<T extends import("mongodb").Document>(name: string): Promise<import("mongodb").Collection<T>> {
    const db = await connectToDatabase();
    return db.collection<T>(name);
}


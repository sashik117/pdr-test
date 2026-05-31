import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface ImportLog extends Document {
    _id?: string;
    startedAt: Date;
    completedAt?: Date;
    status: "running" | "completed" | "failed";
    questionsImported: number;
    imagesDownloaded: number;
    errors: string[];
    logs: string[];
}

export async function getImportLogsCollection(): Promise<Collection<ImportLog>> {
    const db = await connectToDatabase();
    return db.collection<ImportLog>("import_logs");
}

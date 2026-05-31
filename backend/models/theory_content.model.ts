import { Collection, Document } from "mongodb";
import { connectToDatabase } from "../utils/connection";

export interface TheoryItem {
    id: string;
    title: string;
    imageUrl?: string;
    description?: string;
}

export interface TheoryContent extends Document {
    _id?: string;
    type:
    | "road-signs"
    | "road-markings"
    | "rules"
    | "regulator"
    | "traffic-light"
    | "lectures";
    slug: string;
    title: string;
    description?: string;
    content?: string;
    imageUrl?: string;
    categoryId?: string;
    categoryName?: string;
    order?: number;
    items?: TheoryItem[];
    createdAt: Date;
    updatedAt: Date;
}

export async function getTheoryContentCollection(): Promise<Collection<TheoryContent>> {
    const db = await connectToDatabase();
    return db.collection<TheoryContent>("theory_content");
}

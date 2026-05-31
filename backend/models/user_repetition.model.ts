import { Document, ObjectId } from "mongodb";
import { getCollection } from "../utils/connection";

export interface RepetitionHistory {
    date: Date;
    grade: number;
    interval: number;
    easeFactor: number;
    timeTaken?: number;
}

export interface UserRepetition extends Document {
    _id?: ObjectId;
    userId: string;
    questionId: string;
    topicId?: string;

    interval: number;
    repetitions: number;
    easeFactor: number;

    nextReviewDate: Date;
    lastReviewDate: Date;

    history: RepetitionHistory[];

    createdAt: Date;
    updatedAt: Date;
}

export const getUserRepetitionsCollection = () =>
    getCollection<UserRepetition>("user_repetitions");

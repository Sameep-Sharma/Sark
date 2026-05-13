import "server-only";

import { ObjectId, type Collection, type WithId } from "mongodb";

import { getQuizDb } from "./mongodb";

export const QUIZ_USERS_COLLECTION = "quiz-users-collection";

export type QuizUserDocument = {
  name: string;
  usn: string;
  email: string;
  phone: string;
  passwordHash: string;
  score: number | null;
  timetaken: number | null;
  latestQuizId?: string;
  latestQuizName?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type QuizUser = WithId<QuizUserDocument>;
export type PublicQuizUser = Pick<QuizUser, "_id" | "name" | "usn" | "email" | "phone" | "score" | "timetaken">;

export async function getQuizUsersCollection(): Promise<Collection<QuizUserDocument>> {
const db = await getQuizDb();
  const collection = db.collection<QuizUserDocument>(QUIZ_USERS_COLLECTION);

  return collection;
}

let userIndexesPromise: Promise<void> | null = null;

export async function ensureQuizUserIndexes() {
  if (!userIndexesPromise) {
    userIndexesPromise = getQuizUsersCollection().then(async (collection) => {
      await Promise.all([collection.createIndex({ email: 1 }, { unique: true }), collection.createIndex({ usn: 1 }, { unique: true })]);
    });
  }

  return userIndexesPromise;
}

export async function findQuizUserByEmail(email: string) {
  const users = await getQuizUsersCollection();

  return users.findOne({ email: normalizeEmail(email) });
}

export async function findQuizUserById(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const users = await getQuizUsersCollection();

  return users.findOne({ _id: new ObjectId(userId) });
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeUsn(usn: string) {
  return usn.trim().toUpperCase();
}

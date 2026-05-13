import "server-only";

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

const options = {
  appName: "sark-quiz",
  maxPoolSize: 5,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 8000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = globalThis as typeof globalThis & {
  _quizMongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalWithMongo._quizMongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._quizMongoClientPromise = client.connect();
  }

  clientPromise = globalWithMongo._quizMongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getMongoClient() {
  return clientPromise;
}

export async function getQuizDb() {
  const client = await getMongoClient();

  return client.db();
}

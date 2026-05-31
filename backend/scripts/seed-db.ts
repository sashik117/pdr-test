import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pdr-ukraine';

async function seedDatabase() {
  console.log('Connecting to MongoDB...');

  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db();

  console.log('Loading questions from JSON...');

  const questionsPath = path.join(__dirname, '..', 'data', 'questions.json');
  const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  console.log(`Found ${questionsData.length} questions`);

  // Clear existing questions
  await db.collection('questions').deleteMany({});

  // Insert questions
  if (questionsData.length > 0) {
    await db.collection('questions').insertMany(questionsData);
    console.log(`Inserted ${questionsData.length} questions`);
  }

  // Create indexes
  await db.collection('questions').createIndex({ questionId: 1 }, { unique: true });
  await db.collection('questions').createIndex({ ticketNumber: 1 });
  await db.collection('questions').createIndex({ category: 1 });

  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  await db.collection('test_results').createIndex({ userId: 1 });
  await db.collection('test_results').createIndex({ completedAt: -1 });

  console.log('Indexes created');

  await client.close();
  console.log('Database seeded successfully!');
}

seedDatabase().catch(console.error);

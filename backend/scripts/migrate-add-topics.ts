import { MongoClient, Db } from "mongodb";

// Topic definitions with keywords for classification
const TOPICS = [
    {
        name: "Дорожні знаки",
        slug: "road-signs",
        description: "Попереджувальні, заборонні, наказові та інформаційні знаки",
        order: 1,
        keywords: ["знак", "знаків", "зображен", "табличк", "5.1", "5.2", "5.3", "5.4", "5.5", "3.1", "3.2", "3.21", "3.34", "1.1", "1.2", "1.31", "2.1", "2.2", "4.1", "4.2"]
    },
    {
        name: "Дорожня розмітка",
        slug: "road-markings",
        description: "Горизонтальна та вертикальна розмітка",
        order: 2,
        keywords: ["розмітк", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10", "1.11", "лінія", "лінію", "смуга", "смуги"]
    },
    {
        name: "Сигнали регулювання",
        slug: "traffic-signals",
        description: "Сигнали світлофора та регулювальника",
        order: 3,
        keywords: ["світлофор", "регулювальник", "сигнал", "зелен", "жовт", "червон", "реверсивн"]
    },
    {
        name: "Проїзд перехресть",
        slug: "intersections",
        description: "Правила проїзду регульованих та нерегульованих перехресть",
        order: 4,
        keywords: ["перехрест", "головн", "другоряд", "пріоритет", "правило правої", "рівнозначн", "16.11", "16.12", "16.13", "проїзд"]
    },
    {
        name: "Швидкість руху",
        slug: "speed",
        description: "Обмеження швидкості та дистанція",
        order: 5,
        keywords: ["швидкіст", "км/год", "дистанц", "інтервал", "12.1", "12.2", "12.3", "12.4", "12.5", "12.6"]
    },
    {
        name: "Обгін та випередження",
        slug: "overtaking",
        description: "Правила обгону, випередження та зустрічного роз'їзду",
        order: 6,
        keywords: ["обгін", "обгон", "випередж", "зустрічн", "14.1", "14.2", "14.3", "14.4", "14.5", "14.6"]
    },
    {
        name: "Зупинка та стоянка",
        slug: "parking",
        description: "Правила зупинки та стоянки транспортних засобів",
        order: 7,
        keywords: ["зупинк", "стоянк", "парку", "15.9", "15.10", "15.11"]
    },
    {
        name: "Маневрування",
        slug: "maneuvering",
        description: "Початок руху, повороти, розвороти, рух заднім ходом",
        order: 8,
        keywords: ["маневр", "поворот", "розворот", "заднім ход", "перестро", "10.1", "10.2", "10.3", "10.4", "10.5", "10.6"]
    },
    {
        name: "Пішоходи та велосипедисти",
        slug: "pedestrians",
        description: "Правила для пішоходів, велосипедистів та мопедистів",
        order: 9,
        keywords: ["пішохід", "пішоход", "велосипед", "мопед", "пішохідн", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7"]
    },
    {
        name: "Проїзд залізничних переїздів",
        slug: "railway",
        description: "Правила проїзду залізничних переїздів",
        order: 10,
        keywords: ["залізнич", "переїзд", "шлагбаум", "20.1", "20.2", "20.3", "20.4"]
    },
    {
        name: "Автомагістралі",
        slug: "highways",
        description: "Особливості руху по автомагістралях",
        order: 11,
        keywords: ["автомагістрал", "27.1", "27.2", "27.3", "27.4"]
    },
    {
        name: "Буксирування та експлуатація",
        slug: "towing",
        description: "Буксирування транспортних засобів, технічний стан",
        order: 12,
        keywords: ["буксир", "експлуатац", "технічн", "несправн", "23.1", "23.2", "23.3", "31.1", "31.2", "31.3", "31.4", "31.5"]
    },
    {
        name: "Медична допомога",
        slug: "first-aid",
        description: "Домедична допомога постраждалим у ДТП",
        order: 13,
        keywords: ["медичн", "допомог", "кровотеч", "перелом", "опік", "реанімац", "пов'язк", "шина", "постраждал", "рана", "ДТП"]
    },
    {
        name: "Правові питання",
        slug: "legal",
        description: "Відповідальність водіїв, документи, страхування",
        order: 14,
        keywords: ["відповідальн", "штраф", "адміністрат", "позбавл", "права", "документ", "страхув", "поліц", "затриман", "Європротокол"]
    },
    {
        name: "Загальні положення",
        slug: "general",
        description: "Терміни, визначення та загальні правила",
        order: 15,
        keywords: ["визначен", "термін", "означає", "вважається", "п. 1", "п.1", "пп. 1", "1.10", "дозволена максимальна маса", "механічний транспортний", "гальмівний шлях"]
    }
];

function classifyQuestion(question: { text: string; explanation: string }): string {
    const fullText = `${question.text} ${question.explanation}`.toLowerCase();

    // Score each topic based on keyword matches
    const scores: { slug: string; score: number }[] = [];

    for (const topic of TOPICS) {
        let score = 0;
        for (const keyword of topic.keywords) {
            if (fullText.includes(keyword.toLowerCase())) {
                score++;
            }
        }
        scores.push({ slug: topic.slug, score });
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Return the topic with highest score, or 'general' if no matches
    return scores[0].score > 0 ? scores[0].slug : "general";
}

async function main() {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/pdr";

    console.log("Connecting to MongoDB...");
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db: Db = client.db();
    const questionsCollection = db.collection("questions");
    const topicsCollection = db.collection("topics");
    const testResultsCollection = db.collection("test_results");

    console.log("Creating topics collection...");

    // Clear and insert topics
    await topicsCollection.deleteMany({});
    const now = new Date();
    const topicDocs = TOPICS.map(t => ({
        name: t.name,
        slug: t.slug,
        description: t.description,
        difficulty: 3, // Will be updated based on error rates
        questionCount: 0,
        order: t.order,
        createdAt: now,
        updatedAt: now
    }));
    await topicsCollection.insertMany(topicDocs);
    console.log(`Inserted ${topicDocs.length} topics`);

    // Get all questions
    const questions = await questionsCollection.find({}).toArray();
    console.log(`Found ${questions.length} questions to classify`);

    // Classify each question
    const topicCounts: Record<string, number> = {};
    let updated = 0;

    for (const question of questions) {
        const topicSlug = classifyQuestion({
            text: question.text || "",
            explanation: question.explanation || ""
        });

        // Update question with topic and default difficulty
        await questionsCollection.updateOne(
            { _id: question._id },
            {
                $set: {
                    topic: topicSlug,
                    difficulty: 3 // Default, will be recalculated
                }
            }
        );

        topicCounts[topicSlug] = (topicCounts[topicSlug] || 0) + 1;
        updated++;

        if (updated % 100 === 0) {
            console.log(`Updated ${updated}/${questions.length} questions...`);
        }
    }

    console.log("\nTopic distribution:");
    for (const [slug, count] of Object.entries(topicCounts)) {
        const topic = TOPICS.find(t => t.slug === slug);
        console.log(`  ${topic?.name || slug}: ${count} questions`);

        // Update topic question count
        await topicsCollection.updateOne(
            { slug },
            { $set: { questionCount: count, updatedAt: new Date() } }
        );
    }

    // Calculate difficulty based on error rates from test results
    console.log("\nCalculating difficulty levels based on error rates...");

    const errorRates = await testResultsCollection.aggregate([
        { $unwind: "$answers" },
        {
            $group: {
                _id: "$answers.questionId",
                totalAttempts: { $sum: 1 },
                incorrectAttempts: {
                    $sum: { $cond: [{ $eq: ["$answers.correct", false] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                questionId: "$_id",
                errorRate: {
                    $cond: [
                        { $gt: ["$totalAttempts", 0] },
                        { $divide: ["$incorrectAttempts", "$totalAttempts"] },
                        0
                    ]
                }
            }
        }
    ]).toArray();

    console.log(`Found error rates for ${errorRates.length} questions`);

    // Update question difficulties based on error rates
    for (const { questionId, errorRate } of errorRates) {
        // Convert error rate to difficulty (1-5)
        // 0-20% error = difficulty 1 (easy)
        // 20-40% error = difficulty 2
        // 40-60% error = difficulty 3
        // 60-80% error = difficulty 4
        // 80-100% error = difficulty 5 (hard)
        const difficulty = Math.min(5, Math.max(1, Math.ceil(errorRate * 5)));

        await questionsCollection.updateOne(
            { questionId },
            { $set: { difficulty } }
        );
    }

    // Update topic average difficulties
    for (const topic of TOPICS) {
        const avgDifficulty = await questionsCollection.aggregate([
            { $match: { topic: topic.slug } },
            { $group: { _id: null, avgDifficulty: { $avg: "$difficulty" } } }
        ]).toArray();

        if (avgDifficulty.length > 0) {
            const diff = Math.round(avgDifficulty[0].avgDifficulty || 3);
            await topicsCollection.updateOne(
                { slug: topic.slug },
                { $set: { difficulty: diff, updatedAt: new Date() } }
            );
        }
    }

    // Create indexes
    console.log("\nCreating indexes...");
    await questionsCollection.createIndex({ topic: 1 });
    await questionsCollection.createIndex({ difficulty: 1 });
    await questionsCollection.createIndex({ topic: 1, difficulty: 1 });
    await topicsCollection.createIndex({ slug: 1 }, { unique: true });

    console.log("\n✅ Migration completed successfully!");
    console.log(`   - ${questions.length} questions classified into ${TOPICS.length} topics`);
    console.log(`   - Difficulties calculated based on ${errorRates.length} answer records`);

    await client.close();
}

main().catch(console.error);

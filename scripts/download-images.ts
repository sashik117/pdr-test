import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import pLimit from "p-limit";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(
    __dirname,
    "..",
    "backend",
    "public",
    "images",
    "questions",
);

const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/pdr-ukraine";

interface Question {
    _id: any;
    questionId: string;
    imageUrl: string | null;
}

async function downloadImage(
    imageUrl: string,
    questionId: string,
): Promise<string | null> {
    if (!imageUrl || !imageUrl.startsWith("http")) {
        return imageUrl; // Already local or null
    }

    try {
        // Ensure images directory exists
        if (!fs.existsSync(IMAGES_DIR)) {
            fs.mkdirSync(IMAGES_DIR, { recursive: true });
        }

        console.log(`Downloading image for ${questionId}: ${imageUrl}`);

        // Download image
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            },
        });

        // Get file extension from URL or content-type
        let ext = path.extname(new URL(imageUrl).pathname);
        if (!ext) {
            const contentType = response.headers["content-type"];
            if (contentType?.includes("jpeg") || contentType?.includes("jpg")) {
                ext = ".jpg";
            } else if (contentType?.includes("png")) {
                ext = ".png";
            } else if (contentType?.includes("webp")) {
                ext = ".webp";
            } else {
                ext = ".jpg"; // default
            }
        }

        // Create filename using questionId
        const filename = `${questionId}${ext}`;
        const filepath = path.join(IMAGES_DIR, filename);

        // Save image
        fs.writeFileSync(filepath, response.data);

        console.log(`✅ Saved: ${filename}`);

        // Return relative URL path
        return `/images/questions/${filename}`;
    } catch (error) {
        console.error(`❌ Failed to download image for ${questionId}:`, error);
        return imageUrl; // fallback to original URL
    }
}

async function downloadAllImages() {
    console.log("==========================================");
    console.log("  Скачування зображень для питань ПДР");
    console.log("==========================================\n");

    let client: MongoClient | null = null;

    try {
        // Connect to MongoDB
        console.log("Підключення до MongoDB...");
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log("✅ Підключено до MongoDB\n");

        const db = client.db();
        const questions = db.collection("questions");

        // Find all questions with external image URLs
        const questionsWithImages = await questions
            .find({
                imageUrl: { $regex: "^https?://", $options: "i" },
            })
            .toArray();

        console.log(
            `Знайдено ${questionsWithImages.length} питань з зовнішніми зображеннями\n`,
        );

        if (questionsWithImages.length === 0) {
            console.log("✅ Всі зображення вже локальні!");
            return;
        }

        const limit = pLimit(5); // Limit concurrent downloads
        let downloaded = 0;
        let failed = 0;

        const tasks = questionsWithImages.map((question: Question) =>
            limit(async () => {
                if (question.imageUrl && question.imageUrl.startsWith("http")) {
                    const localPath = await downloadImage(
                        question.imageUrl,
                        question.questionId,
                    );

                    if (localPath && localPath.startsWith("/images")) {
                        // Update database with local path
                        await questions.updateOne(
                            { _id: question._id },
                            { $set: { imageUrl: localPath } },
                        );
                        downloaded++;
                    } else {
                        failed++;
                    }

                    if ((downloaded + failed) % 10 === 0) {
                        console.log(
                            `Прогрес: ${downloaded} успішно, ${failed} помилок з ${questionsWithImages.length}`,
                        );
                    }

                    // Small delay to avoid rate limiting
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            }),
        );

        await Promise.all(tasks);

        console.log("\n==========================================");
        console.log("  Результати");
        console.log("==========================================");
        console.log(`✅ Завантажено: ${downloaded}`);
        console.log(`❌ Помилок: ${failed}`);
        console.log(`📊 Всього: ${questionsWithImages.length}`);
        console.log("==========================================\n");

        // Verify results
        const localImagesCount = await questions.countDocuments({
            imageUrl: { $regex: "^/images", $options: "i" },
        });
        console.log(`📁 Локальних зображень в БД: ${localImagesCount}`);

        const externalImagesCount = await questions.countDocuments({
            imageUrl: { $regex: "^https?://", $options: "i" },
        });
        console.log(
            `🌐 Зовнішніх зображень залишилось: ${externalImagesCount}\n`,
        );
    } catch (error) {
        console.error("❌ Помилка:", error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log("MongoDB з'єднання закрито");
        }
    }
}

// Run the script
downloadAllImages()
    .then(() => {
        console.log("\n✅ Готово!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Критична помилка:", error);
        process.exit(1);
    });

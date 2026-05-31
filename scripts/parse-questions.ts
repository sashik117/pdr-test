import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import pLimit from "p-limit";
import crypto from "crypto";

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

interface Question {
    questionId: string;
    ticketNumber: number;
    questionNumber: number;
    text: string;
    imageUrl: string | null;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
    category: string;
}

const BASE_URL = "https://vodiy.ua/pdr/test/";
const TOTAL_TICKETS = 117;
const QUESTIONS_PER_TICKET = 20;

async function downloadImage(
    imageUrl: string,
    questionId: string,
): Promise<string | null> {
    if (!imageUrl) return null;

    try {
        // Ensure images directory exists
        if (!fs.existsSync(IMAGES_DIR)) {
            fs.mkdirSync(IMAGES_DIR, { recursive: true });
        }

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

        // Return relative URL path
        return `/images/questions/${filename}`;
    } catch (error) {
        console.error(`Failed to download image for ${questionId}:`, error);
        return imageUrl; // fallback to original URL
    }
}

async function fetchTicketPage(ticketNumber: number): Promise<string> {
    const url = `${BASE_URL}?complect=6&bilet=${ticketNumber}`;

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7",
            },
            timeout: 30000,
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching ticket ${ticketNumber}:`, error);
        throw error;
    }
}

function parseVodiyQuestions(html: string, ticketNumber: number): Question[] {
    const $ = cheerio.load(html);
    const questions: Question[] = [];

    // Find all elements containing "Білет №X. Питання №Y"
    $("*")
        .contents()
        .filter(function () {
            return (
                this.type === "text" &&
                this.data &&
                this.data.includes(`Білет №${ticketNumber}. Питання №`)
            );
        })
        .each((_, node) => {
            const text = $(node).text().trim();
            const match = text.match(
                new RegExp(`Білет №${ticketNumber}\\. Питання №(\\d+)`),
            );

            if (!match) return;

            const globalQuestionId = parseInt(match[1]);
            const $questionContainer = $(node).parent();

            // Find question text (usually in the next <p> tag)
            let questionText = "";
            let $current = $questionContainer;

            // Look for the question text in the next few siblings
            for (let i = 0; i < 10; i++) {
                $current = $current.next();
                if ($current.is("p")) {
                    const txt = $current.text().trim();
                    if (txt.length > 10 && !txt.includes("Білет №")) {
                        questionText = txt;
                        break;
                    }
                }
            }

            // Find the container with class that contains question number
            let $mainContainer = $questionContainer;
            for (let i = 0; i < 5; i++) {
                $mainContainer = $mainContainer.next();
                if (
                    $mainContainer.attr("class") &&
                    $mainContainer.attr("class")?.includes("select_ticket")
                ) {
                    break;
                }
            }

            // Find image
            let imageUrl: string | null = null;
            const $ticketLeft = $mainContainer.find(".ticket_left");
            if ($ticketLeft.length) {
                const $img = $ticketLeft.find("img").first();
                if ($img.length) {
                    const src = $img.attr("src");
                    if (src) {
                        imageUrl = src.startsWith("http")
                            ? src
                            : `https://vodiy.ua${src}`;
                    }
                }
            }

            // Find options (radio button labels)
            const options: { id: string; text: string }[] = [];
            const $ticketRight = $mainContainer.find(".ticket_right");

            if ($ticketRight.length) {
                $ticketRight.find("label.label_raio").each((idx, label) => {
                    const $label = $(label);
                    // Get the text content, excluding the radio input
                    const $clone = $label.clone();
                    $clone.find("input, span.radio").remove();
                    const optionText = $clone.text().trim();

                    if (optionText && optionText.length > 0) {
                        options.push({
                            id: String.fromCharCode(65 + idx), // A, B, C, D, etc.
                            text: optionText,
                        });
                    }
                });
            }

            // Find explanation (usually in a div after the options)
            let explanation = "";
            let $explContainer = $mainContainer;
            for (let i = 0; i < 10; i++) {
                $explContainer = $explContainer.next();
                const txt = $explContainer.text().trim();
                if (
                    txt.length > 50 &&
                    (txt.includes("ПДР") ||
                        txt.includes("п.") ||
                        txt.includes("пп."))
                ) {
                    explanation = txt;
                    break;
                }
            }

            // Try to find correct answer by looking for a specific attribute or pattern
            // The correct answer is often marked in the HTML somehow
            let correctAnswer = "A"; // Default

            // Look for checked radio or data attributes
            $ticketRight.find("input[type='radio']").each((idx, input) => {
                const $input = $(input);
                if (
                    $input.attr("checked") ||
                    $input.hasClass("correct") ||
                    $input.parent().hasClass("correct")
                ) {
                    correctAnswer = String.fromCharCode(65 + idx);
                }
            });

            if (questionText && options.length >= 2) {
                questions.push({
                    questionId: `T${ticketNumber}Q${questions.length + 1}`,
                    ticketNumber,
                    questionNumber: questions.length + 1,
                    text: questionText,
                    imageUrl,
                    options,
                    correctAnswer,
                    explanation: explanation || "",
                    category: "ПДР України",
                });
            }
        });

    return questions;
}

async function parseAllTickets(): Promise<Question[]> {
    const allQuestions: Question[] = [];
    const limit = pLimit(3); // Limit concurrent requests

    console.log(`Starting to parse ${TOTAL_TICKETS} tickets...`);

    // First, test with one ticket
    console.log("Testing with ticket 68...");
    try {
        const testHtml = await fetchTicketPage(68);
        fs.writeFileSync(
            path.join(__dirname, "debug-ticket-68.html"),
            testHtml,
        );
        console.log("Saved debug HTML to debug-ticket-68.html");

        const testQuestions = parseVodiyQuestions(testHtml, 68);
        console.log(`Parsed ${testQuestions.length} questions from ticket 68`);

        if (testQuestions.length > 0) {
            console.log(
                "Sample question:",
                JSON.stringify(testQuestions[0], null, 2),
            );
        }
    } catch (error) {
        console.error("Error testing ticket 68:", error);
    }

    // Parse all tickets with rate limiting
    const tasks = [];
    for (let ticketNum = 1; ticketNum <= TOTAL_TICKETS; ticketNum++) {
        tasks.push(
            limit(async () => {
                try {
                    console.log(
                        `Parsing ticket ${ticketNum}/${TOTAL_TICKETS}...`,
                    );
                    const html = await fetchTicketPage(ticketNum);
                    const questions = parseVodiyQuestions(html, ticketNum);

                    console.log(
                        `  Found ${questions.length} questions in ticket ${ticketNum}`,
                    );

                    // Add delay to avoid rate limiting
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    return questions;
                } catch (error) {
                    console.error(
                        `Failed to parse ticket ${ticketNum}:`,
                        error,
                    );
                    return [];
                }
            }),
        );
    }

    const results = await Promise.all(tasks);
    results.forEach((questions) => allQuestions.push(...questions));

    return allQuestions;
}

async function downloadAllImages(questions: Question[]): Promise<Question[]> {
    console.log("\nDownloading images...");
    const limit = pLimit(5); // Limit concurrent downloads
    let downloaded = 0;

    const tasks = questions.map((question) =>
        limit(async () => {
            if (question.imageUrl && question.imageUrl.startsWith("http")) {
                const localPath = await downloadImage(
                    question.imageUrl,
                    question.questionId,
                );
                downloaded++;
                if (downloaded % 10 === 0) {
                    console.log(
                        `  Downloaded ${downloaded}/${questions.filter((q) => q.imageUrl).length} images...`,
                    );
                }
                return { ...question, imageUrl: localPath };
            }
            return question;
        }),
    );

    const updatedQuestions = await Promise.all(tasks);
    console.log(`✅ Downloaded ${downloaded} images`);
    return updatedQuestions;
}

async function main() {
    console.log("PDR Ukraine Questions Parser");
    console.log("============================");

    try {
        const questions = await parseAllTickets();

        console.log(`\nTotal questions parsed: ${questions.length}`);
        console.log(`Expected: ${TOTAL_TICKETS * QUESTIONS_PER_TICKET}`);

        // Download images
        const questionsWithLocalImages = await downloadAllImages(questions);

        // Save to JSON file
        const outputPath = path.join(
            __dirname,
            "..",
            "backend",
            "data",
            "questions.json",
        );
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(
            outputPath,
            JSON.stringify(questionsWithLocalImages, null, 2),
            "utf-8",
        );
        console.log(`\nQuestions saved to: ${outputPath}`);

        // Print statistics
        const byTicket = questionsWithLocalImages.reduce(
            (acc, q) => {
                acc[q.ticketNumber] = (acc[q.ticketNumber] || 0) + 1;
                return acc;
            },
            {} as Record<number, number>,
        );

        console.log("\nQuestions per ticket (first 20):");
        Object.entries(byTicket)
            .slice(0, 20)
            .forEach(([ticket, count]) => {
                console.log(`  Ticket ${ticket}: ${count} questions`);
            });

        // Show tickets with missing questions
        const incomplete = Object.entries(byTicket)
            .filter(([_, count]) => count < 15)
            .map(([ticket]) => ticket);

        if (incomplete.length > 0) {
            console.log(
                `\nTickets with fewer than 15 questions (${incomplete.length} total): ${incomplete.slice(0, 10).join(", ")}${incomplete.length > 10 ? "..." : ""}`,
            );
        }

        const imagesCount = questionsWithLocalImages.filter(
            (q) => q.imageUrl && !q.imageUrl.startsWith("http"),
        ).length;
        console.log(
            `\n✅ Parsing complete! Total: ${questionsWithLocalImages.length} questions, ${imagesCount} local images`,
        );
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}

main();

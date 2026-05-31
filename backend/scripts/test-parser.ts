
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';

// Copy of the logic from parser.service.ts for testing isolated behavior
// We mock the service to avoid DB dependencies in this test script

export class TestParserService {
    public parseVodiyQuestions(html: string, ticketNumber: number): any[] {
        const $ = cheerio.load(html);
        const questions: any[] = [];

        $("*").contents().filter(function () {
            return this.type === "text" &&
                !!(this.data &&
                    this.data.includes(`Білет №${ticketNumber}. Питання №`));
        }).each((_, node) => {

            const text = $(node).text().trim();
            const match = text.match(new RegExp(`Білет №${ticketNumber}\\. Питання №(\\d+)`));

            if (!match) return;

            const $questionContainer = $(node).parent();

            // Find question text
            let questionText = "";
            let $current = $questionContainer;
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

            // Find main container
            let $mainContainer = $questionContainer;
            for (let i = 0; i < 5; i++) {
                $mainContainer = $mainContainer.next();
                if ($mainContainer.attr("class")?.includes("select_ticket")) {
                    break;
                }
            }

            const options: { id: string; text: string }[] = [];
            let correctAnswer = "A";
            const $ticketRight = $mainContainer.find(".ticket_right");

            if ($ticketRight.length) {
                $ticketRight.find("label.label_raio").each((idx, label) => {
                    const $label = $(label);

                    // Check for correct answer marker
                    const $input = $label.find('input[type="radio"]');
                    const isCorrect = $input.attr('rel') === 'rt1';
                    const optionId = String.fromCharCode(65 + idx);

                    if (isCorrect) {
                        correctAnswer = optionId;
                    }

                    const $clone = $label.clone();
                    $clone.find("input, span.radio").remove();
                    const optionText = $clone.text().trim();

                    if (optionText && optionText.length > 0) {
                        options.push({
                            id: optionId,
                            text: optionText
                        });
                    }
                });
            }

            if (questionText && options.length >= 2) {
                const questionData = {
                    questionId: `T${ticketNumber}Q${questions.length + 1}`,
                    text: questionText,
                    options,
                    correctAnswer
                };

                // Generate content hash
                const contentToHash = JSON.stringify({
                    text: questionData.text,
                    options: questionData.options,
                    correctAnswer: questionData.correctAnswer,
                    explanation: "", // Mock
                    imageUrl: null // Mock
                });
                const contentHash = crypto.createHash('md5').update(contentToHash).digest('hex');

                questions.push({ ...questionData, contentHash });
            }
        });

        return questions;
    }
}

async function runTest() {
    const filePath = path.join(process.cwd(), 'sample_ticket.html');
    if (!fs.existsSync(filePath)) {
        console.error("sample_ticket.html not found!");
        return;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    const parser = new TestParserService();
    const questions = parser.parseVodiyQuestions(html, 1);

    console.log(`Parsed ${questions.length} questions.`);

    // Check first question
    if (questions.length > 0) {
        questions.forEach(q => {
            console.log(`Question ${q.questionId}: Correct Answer = ${q.correctAnswer}`);
            console.log(`Hash: ${q.contentHash}`);
        });

        // Validation: Check if we have answers other than "A"
        const answers = questions.map(q => q.correctAnswer);
        const uniqAnswers = [...new Set(answers)];
        console.log("Unique answers found:", uniqAnswers);

        if (uniqAnswers.length > 1 && uniqAnswers.some(a => a !== 'A')) {
            console.log("SUCCESS: Parser found correct answers other than A.");
        } else {
            console.log("WARNING: Only 'A' answers found. This might be wrong unless the ticket really is all A.");
        }
    }
}

runTest();

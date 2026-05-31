import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { getQuestionsCollection, Question } from "../models/question.model";
import { getImportLogsCollection, ImportLog } from "../models/import_log.model";
import { getTopicsCollection } from "../models/topic.model";
import { getTheoryContentCollection } from "../utils/db";
import logger from "../utils/logger";
import { ObjectId } from "mongodb";
import * as crypto from "crypto";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "questions");
const THEORY_IMAGES_DIR = path.join(
    process.cwd(),
    "public",
    "images",
    "theory",
);
const BASE_URL = "https://vodiy.ua";
const TOTAL_TICKETS = 117;

interface TheorySection {
    sectionId: string;
    number: string;
    content: string;
    comment?: string;
    images: string[];
}

interface TheoryChapter {
    type: string;
    slug: string;
    chapterId: number;
    title: string;
    description?: string;
    sections: TheorySection[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ChapterLink {
    href: string;
    title: string;
    chapterId: number;
}

interface TheoryParseStatus {
    isRunning: boolean;
    startedAt: Date | null;
    completedAt: Date | null;
    logs: string[];
    error: string | null;
    result: {
        chapters: number;
        signs: number;
        markings: number;
        images: number;
    } | null;
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
    "road-signs": ["знак", "знаків", "зображен", "табличк"],
    "road-markings": ["розмітк", "лінія", "лінію", "смуга", "смуги"],
    "traffic-signals": [
        "світлофор",
        "регулювальник",
        "сигнал",
        "зелен",
        "жовт",
        "червон",
    ],
    intersections: ["перехрест", "головн", "другоряд", "пріоритет"],
    speed: ["швидкіст", "км/год", "дистанц"],
    overtaking: ["обгін", "обгон", "випередж", "зустрічн"],
    parking: ["зупинк", "стоянк", "парку"],
    maneuvering: ["маневр", "поворот", "розворот", "заднім ход", "перестро"],
    pedestrians: ["пішохід", "пішоход", "велосипед", "мопед"],
    railway: ["залізнич", "переїзд", "шлагбаум"],
    highways: ["автомагістрал"],
    towing: ["буксир", "експлуатац", "технічн", "несправн"],
    "first-aid": [
        "медичн",
        "допомог",
        "кровотеч",
        "перелом",
        "опік",
        "реанімац",
        "постраждал",
    ],
    legal: [
        "відповідальн",
        "штраф",
        "адміністрат",
        "позбавл",
        "права",
        "документ",
        "страхув",
        "поліц",
    ],
    general: ["визначен", "термін", "означає", "вважається"],
};

const SIGN_CATEGORIES = [
    { id: 1, name: "Попереджувальні знаки" },
    { id: 2, name: "Знаки пріоритету" },
    { id: 3, name: "Заборонні знаки" },
    { id: 4, name: "Наказові знаки" },
    { id: 5, name: "Інформаційно-вказівні знаки" },
    { id: 6, name: "Знаки сервісу" },
    { id: 7, name: "Таблички до дорожніх знаків" },
];

const MARKING_CATEGORIES = [
    { id: 1, name: "Горизонтальна розмітка" },
    { id: 2, name: "Вертикальна розмітка" },
];

export class ParserService {
    private currentLog: ImportLog | null = null;
    private logs: string[] = [];

    private theoryParseStatus: TheoryParseStatus = {
        isRunning: false,
        startedAt: null,
        completedAt: null,
        logs: [],
        error: null,
        result: null,
    };

    private log(message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        this.logs.push(logMessage);
        logger.info(message);
    }

    private theoryLog(message: string): void {
        this.theoryParseStatus.logs.push(message);
        logger.info(`[Theory] ${message}`);
    }

    getTheoryParseStatus(): TheoryParseStatus {
        return { ...this.theoryParseStatus };
    }

    async startTheoryParse(): Promise<{ success: boolean; message: string }> {
        if (this.theoryParseStatus.isRunning) {
            return {
                success: false,
                message: "Theory parsing is already in progress",
            };
        }

        this.theoryParseStatus = {
            isRunning: true,
            startedAt: new Date(),
            completedAt: null,
            logs: [],
            error: null,
            result: null,
        };

        this.runTheoryParse().catch((err) => {
            this.theoryParseStatus.isRunning = false;
            this.theoryParseStatus.completedAt = new Date();
            this.theoryParseStatus.error = err.message;
            logger.error("Theory parse failed:", err);
        });

        return { success: true, message: "Theory parsing started" };
    }

    private async runTheoryParse(): Promise<void> {
        this.theoryLog("Starting PDR Theory Parser...");

        this.ensureTheoryImagesDirs();

        const theoryCollection = await getTheoryContentCollection();
        let totalChapters = 0;
        let totalSigns = 0;
        let totalMarkings = 0;
        let totalImages = 0;

        try {
            this.theoryLog("═".repeat(50));
            this.theoryLog("Parsing PDR Chapters");
            this.theoryLog("═".repeat(50));

            const chapterLinks = await this.getChapterLinks();
            const chapters: TheoryChapter[] = [];

            for (const chapterLink of chapterLinks) {
                try {
                    const chapter = await this.parseChapter(chapterLink);
                    chapters.push(chapter);

                    for (const section of chapter.sections) {
                        totalImages += section.images.length;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 300));
                } catch (error: any) {
                    this.theoryLog(
                        `Error parsing chapter ${chapterLink.chapterId}: ${error.message}`,
                    );
                }
            }

            if (chapters.length > 0) {
                await theoryCollection.deleteMany({ type: "pdr-chapter" });
                await theoryCollection.insertMany(chapters);
                totalChapters = chapters.length;
                this.theoryLog(`✓ Saved ${chapters.length} PDR chapters`);
            }

            this.theoryLog("═".repeat(50));
            this.theoryLog("Parsing Road Signs");
            this.theoryLog("═".repeat(50));

            for (const category of SIGN_CATEGORIES) {
                try {
                    const signCategory = await this.parseSignCategory(
                        category.id,
                        category.name,
                    );
                    totalSigns += signCategory.items.length;

                    await theoryCollection.updateOne(
                        { type: "road-signs", categoryId: category.id },
                        { $set: signCategory },
                        { upsert: true },
                    );

                    this.theoryLog(
                        `✓ Category ${category.id}: ${category.name} - ${signCategory.items.length} signs`,
                    );
                } catch (error: any) {
                    this.theoryLog(
                        `Error parsing sign category ${category.id}: ${error.message}`,
                    );
                }
            }

            this.theoryLog("═".repeat(50));
            this.theoryLog("Parsing Road Markings");
            this.theoryLog("═".repeat(50));

            for (const category of MARKING_CATEGORIES) {
                try {
                    const markingCategory = await this.parseMarkingCategory(
                        category.id,
                        category.name,
                    );
                    totalMarkings += markingCategory.items.length;

                    await theoryCollection.updateOne(
                        { type: "road-markings", categoryId: category.id },
                        { $set: markingCategory },
                        { upsert: true },
                    );

                    this.theoryLog(
                        `✓ Category ${category.id}: ${category.name} - ${markingCategory.items.length} markings`,
                    );
                } catch (error: any) {
                    this.theoryLog(
                        `Error parsing marking category ${category.id}: ${error.message}`,
                    );
                }
            }

            this.theoryParseStatus.result = {
                chapters: totalChapters,
                signs: totalSigns,
                markings: totalMarkings,
                images: totalImages,
            };

            this.theoryLog(
                `✓ Parsing complete! ${totalChapters} chapters, ${totalSigns} signs, ${totalMarkings} markings`,
            );
        } catch (error: any) {
            this.theoryParseStatus.error = error.message;
            this.theoryLog(`❌ Parse failed: ${error.message}`);
        } finally {
            this.theoryParseStatus.isRunning = false;
            this.theoryParseStatus.completedAt = new Date();
        }
    }

    private ensureTheoryImagesDirs(): void {
        const dirs = [
            path.join(THEORY_IMAGES_DIR, "signs"),
            path.join(THEORY_IMAGES_DIR, "marking"),
            path.join(THEORY_IMAGES_DIR, "questions"),
            path.join(THEORY_IMAGES_DIR, "pdr"),
        ];

        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.theoryLog(`Created directory: ${dir}`);
            }
        }
    }

    private async fetchTheoryPage(url: string, retries = 3): Promise<string> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await axios.get(url, {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        "Accept-Language":
                            "uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7",
                    },
                    timeout: 30000,
                });
                return response.data;
            } catch (error) {
                if (attempt === retries) throw error;
                await new Promise((resolve) =>
                    setTimeout(resolve, 2000 * attempt),
                );
            }
        }
        throw new Error("Failed to fetch page");
    }

    private convertLinks(html: string): string {
        let result = html;

        result = result.replace(
            /href="(?:https?:\/\/vodiy\.ua)?\/pdr\/(\d+)\/?(?:#(\d+))?"/g,
            'href="/theory/rules/$1#$2"',
        );

        result = result.replace(
            /href="(?:https?:\/\/vodiy\.ua)?\/znaky\/(\d+)\/([^"\/]+)\/?"/g,
            'href="/theory/road-signs/$1/$2"',
        );

        result = result.replace(
            /href="(?:https?:\/\/vodiy\.ua)?\/rozmitka\/(\d+)\/([^"\/]+)\/?"/g,
            'href="/theory/road-markings/$1/$2"',
        );

        return result;
    }

    private async downloadTheoryImage(imageUrl: string): Promise<string> {
        try {
            let urlPath: string;
            if (imageUrl.startsWith("http")) {
                const url = new URL(imageUrl);
                urlPath = url.pathname;
            } else {
                urlPath = imageUrl;
            }

            if (!urlPath.includes("/media/")) {
                return imageUrl;
            }

            let localRelPath: string;
            const filename = path.basename(urlPath);

            if (urlPath.includes("/uploads/signs/")) {
                localRelPath = `signs/${filename}`;
            } else if (
                urlPath.includes("/uploads/marking/") ||
                urlPath.includes("/rozmitka/")
            ) {
                localRelPath = `marking/${filename}`;
            } else if (urlPath.includes("/questions/pdr/")) {
                localRelPath = `pdr/${filename}`;
            } else {
                localRelPath = `questions/${filename}`;
            }

            const localPath = path.join(THEORY_IMAGES_DIR, localRelPath);
            const localUrlPath = `/images/theory/${localRelPath}`;

            if (fs.existsSync(localPath)) {
                return localUrlPath;
            }

            const fullUrl = imageUrl.startsWith("http")
                ? imageUrl
                : `${BASE_URL}${imageUrl}`;
            const response = await axios.get(fullUrl, {
                responseType: "stream",
                timeout: 30000,
                headers: { "User-Agent": "Mozilla/5.0" },
            });

            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            await pipeline(response.data, createWriteStream(localPath));

            return localUrlPath;
        } catch (error) {
            return imageUrl;
        }
    }

    private async processTheoryHtml(html: string): Promise<string> {
        if (!html) return html;

        let result = html;

        const imgRegex = /src="([^"]+)"/g;
        const matches: string[] = [];
        let match;

        while ((match = imgRegex.exec(html)) !== null) {
            const url = match[1];
            if (url.includes("/media/") || url.includes("vodiy.ua")) {
                matches.push(url);
            }
        }

        const uniqueImages = [...new Set(matches)];
        const imageMap = new Map<string, string>();

        for (const imgUrl of uniqueImages) {
            const localPath = await this.downloadTheoryImage(imgUrl);
            imageMap.set(imgUrl, localPath);
        }

        for (const [original, local] of imageMap) {
            result = result.split(original).join(local);
        }

        result = this.convertLinks(result);
        result = result.replace(/\s+data-hasqtip="[^"]*"/g, "");
        result = result.replace(/\s+oldtitle="[^"]*"/g, "");

        return result;
    }

    private async getChapterLinks(): Promise<ChapterLink[]> {
        const html = await this.fetchTheoryPage(`${BASE_URL}/pdr/`);
        const $ = cheerio.load(html);
        const chapters: ChapterLink[] = [];

        $(".switch_contetn_1 ol li a").each((_, element) => {
            const $link = $(element);
            const href = $link.attr("href") || "";
            const title = $link.text().trim();

            const match = href.match(/\/pdr\/(\d+)\//);
            if (match) {
                const chapterId = parseInt(match[1], 10);
                chapters.push({
                    href: `${BASE_URL}${href}`,
                    title: title,
                    chapterId: chapterId,
                });
            }
        });

        this.theoryLog(`Found ${chapters.length} chapters`);
        return chapters;
    }

    private async parseChapter(
        chapterLink: ChapterLink,
    ): Promise<TheoryChapter> {
        const html = await this.fetchTheoryPage(chapterLink.href);
        const $ = cheerio.load(html);

        const sections: TheorySection[] = [];
        const textBoxes = $("#elems .text_box").toArray();

        for (const element of textBoxes) {
            const $box = $(element);
            const sectionNumber = $box.find(".number a").first().text().trim();
            const sectionId =
                $box.find(".number a").attr("name") ||
                sectionNumber.replace(".", "");

            const $contentSpan = $box.find("> span").last();
            const $clonedContent = $contentSpan.clone();

            const $commentDiv = $clonedContent.find(".collapse");
            let comment = "";
            if ($commentDiv.length > 0) {
                comment = $commentDiv.html() || "";
                $commentDiv.remove();
            }

            $clonedContent.find(".button_comment").remove();
            $clonedContent.find("script").remove();

            let content = $clonedContent.html() || "";
            content = await this.processTheoryHtml(content);
            if (comment) {
                comment = await this.processTheoryHtml(comment);
            }

            const images: string[] = [];
            const imageRegex = /src="(\/images\/theory\/[^"]+)"/g;
            let imgMatch;

            while ((imgMatch = imageRegex.exec(content)) !== null) {
                images.push(imgMatch[1]);
            }
            while ((imgMatch = imageRegex.exec(comment)) !== null) {
                images.push(imgMatch[1]);
            }

            if (sectionNumber && content) {
                sections.push({
                    sectionId: sectionId,
                    number: sectionNumber,
                    content: content.trim(),
                    comment: comment.trim() || undefined,
                    images: [...new Set(images)],
                });
            }
        }

        this.theoryLog(
            `Chapter ${chapterLink.chapterId}: ${chapterLink.title} - ${sections.length} sections`,
        );

        return {
            type: "pdr-chapter",
            slug: `chapter-${chapterLink.chapterId}`,
            chapterId: chapterLink.chapterId,
            title: chapterLink.title,
            description: `Розділ ${chapterLink.chapterId}. ${chapterLink.title}`,
            sections: sections,
            order: chapterLink.chapterId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private async parseSignCategory(
        categoryId: number,
        categoryName: string,
    ): Promise<any> {
        const url = `${BASE_URL}/znaky/${categoryId}/`;
        const html = await this.fetchTheoryPage(url);
        const $ = cheerio.load(html);

        const signLinks: {
            code: string;
            href: string;
            description: string;
            imgSrc: string;
        }[] = [];

        $(".mark-inside li a").each((_, element) => {
            const $el = $(element);
            const href = $el.attr("href") || "";

            const match = href.match(/^([\d\.]+)\/?$/);
            if (match) {
                const signCode = match[1];
                const description = $el.find("span span").last().text().trim();
                const imgSrc = $el.find("img").attr("src") || "";

                if (signCode && !signLinks.find((i) => i.code === signCode)) {
                    signLinks.push({
                        code: signCode,
                        href: `${BASE_URL}/znaky/${categoryId}/${signCode}/`,
                        description: description,
                        imgSrc: imgSrc,
                    });
                }
            }
        });

        const items: any[] = [];
        for (const sign of signLinks) {
            try {
                const detailHtml = await this.fetchTheoryPage(sign.href);
                const $detail = cheerio.load(detailHtml);

                const contentBlock = $detail(".mark_markpage_block");
                let fullContent = "";

                contentBlock.find("p").each((_, p) => {
                    fullContent += $detail(p).html() || "";
                });

                fullContent = this.convertLinks(fullContent);

                const localImagePath = path.join(
                    THEORY_IMAGES_DIR,
                    "signs",
                    `${sign.code}.png`,
                );
                let imageUrl = `/images/theory/signs/${sign.code}.png`;

                if (!fs.existsSync(localImagePath) && sign.imgSrc) {
                    imageUrl = `https://vodiy.ua${sign.imgSrc}`;
                }

                items.push({
                    code: sign.code,
                    title: `Знак ${sign.code}`,
                    shortDescription: sign.description,
                    content: fullContent,
                    imageUrl: imageUrl,
                });

                await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
                const localImagePath = path.join(
                    THEORY_IMAGES_DIR,
                    "signs",
                    `${sign.code}.png`,
                );
                let imageUrl = `/images/theory/signs/${sign.code}.png`;

                if (!fs.existsSync(localImagePath) && sign.imgSrc) {
                    imageUrl = `https://vodiy.ua${sign.imgSrc}`;
                }

                items.push({
                    code: sign.code,
                    title: `Знак ${sign.code}`,
                    shortDescription: sign.description,
                    content: "",
                    imageUrl: imageUrl,
                });
            }
        }

        return {
            type: "road-signs",
            slug: `signs-category-${categoryId}`,
            categoryId: categoryId,
            title: categoryName,
            description: `Категорія ${categoryId}. ${categoryName}`,
            items: items,
            order: categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private async parseMarkingCategory(
        categoryId: number,
        categoryName: string,
    ): Promise<any> {
        const url = `${BASE_URL}/rozmitka/${categoryId}/`;
        const html = await this.fetchTheoryPage(url);
        const $ = cheerio.load(html);

        const markingLinks: {
            code: string;
            href: string;
            description: string;
            imgSrc: string;
        }[] = [];

        $(".mark-inside li a").each((_, element) => {
            const $el = $(element);
            const href = $el.attr("href") || "";

            const match = href.match(/^([\d\.]+)\/?$/);
            if (match) {
                const markingCode = match[1];
                const fullText = $el.find("span span").last().text().trim();
                const descMatch = fullText.match(/Розмітка\s+[\d\.]+\s*(.*)$/);
                const description = descMatch
                    ? descMatch[1].replace(/^\(|\)$/g, "").trim()
                    : fullText;
                const imgSrc = $el.find("img").attr("src") || "";

                if (
                    markingCode &&
                    !markingLinks.find((i) => i.code === markingCode)
                ) {
                    markingLinks.push({
                        code: markingCode,
                        href: `${BASE_URL}/rozmitka/${categoryId}/${markingCode}/`,
                        description: description || fullText,
                        imgSrc: imgSrc,
                    });
                }
            }
        });

        const items: any[] = [];
        for (const marking of markingLinks) {
            try {
                const detailHtml = await this.fetchTheoryPage(marking.href);
                const $detail = cheerio.load(detailHtml);

                const contentBlock = $detail(".mark_markpage_block");
                let fullContent = "";

                contentBlock.find("p").each((_, p) => {
                    fullContent += $detail(p).html() || "";
                });

                fullContent = this.convertLinks(fullContent);

                const localImagePath = path.join(
                    THEORY_IMAGES_DIR,
                    "marking",
                    `${marking.code}.png`,
                );
                let imageUrl = `/images/theory/marking/${marking.code}.png`;

                if (!fs.existsSync(localImagePath) && marking.imgSrc) {
                    imageUrl = `https://vodiy.ua${marking.imgSrc}`;
                }

                items.push({
                    code: marking.code,
                    title: `Розмітка ${marking.code}`,
                    shortDescription: marking.description,
                    content: fullContent,
                    imageUrl: imageUrl,
                });

                await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
                const localImagePath = path.join(
                    THEORY_IMAGES_DIR,
                    "marking",
                    `${marking.code}.png`,
                );
                let imageUrl = `/images/theory/marking/${marking.code}.png`;

                if (!fs.existsSync(localImagePath) && marking.imgSrc) {
                    imageUrl = `https://vodiy.ua${marking.imgSrc}`;
                }

                items.push({
                    code: marking.code,
                    title: `Розмітка ${marking.code}`,
                    shortDescription: marking.description,
                    content: "",
                    imageUrl: imageUrl,
                });
            }
        }

        return {
            type: "road-markings",
            slug: `markings-category-${categoryId}`,
            categoryId: categoryId,
            title: categoryName,
            description: `Категорія ${categoryId}. ${categoryName}`,
            items: items,
            order: categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private classifyQuestion(question: {
        text: string;
        explanation: string;
    }): string {
        const fullText =
            `${question.text} ${question.explanation}`.toLowerCase();

        const scores: { slug: string; score: number }[] = [];

        for (const [slug, keywords] of Object.entries(TOPIC_KEYWORDS)) {
            let score = 0;
            for (const keyword of keywords) {
                if (fullText.includes(keyword.toLowerCase())) {
                    score++;
                }
            }
            scores.push({ slug, score });
        }

        scores.sort((a, b) => b.score - a.score);
        return scores[0].score > 0 ? scores[0].slug : "general";
    }

    async startImport(): Promise<string> {
        const importLogsCollection = await getImportLogsCollection();

        const runningImport = await importLogsCollection.findOne({
            status: "running",
        });
        if (runningImport) {
            throw new Error("An import is already running");
        }

        const importLog: Omit<ImportLog, "_id"> = {
            startedAt: new Date(),
            status: "running",
            questionsImported: 0,
            imagesDownloaded: 0,
            errors: [],
            logs: [],
        };

        const result = await importLogsCollection.insertOne(importLog as any);
        const jobId = result.insertedId.toString();

        this.currentLog = { ...importLog, _id: jobId } as ImportLog;
        this.logs = [];

        this.runImport(jobId).catch((err) => {
            logger.error(`Import job ${jobId} failed in background:`, {
                error: err,
            });
        });

        return jobId;
    }

    private async runImport(jobId: string): Promise<void> {
        const importLogsCollection = await getImportLogsCollection();
        const questionsCollection = await getQuestionsCollection();
        const topicsCollection = await getTopicsCollection();

        try {
            this.log("Starting PDR questions import...");

            const allQuestions: Partial<Question>[] = [];

            for (let ticketNum = 1; ticketNum <= TOTAL_TICKETS; ticketNum++) {
                try {
                    this.log(`Parsing ticket ${ticketNum}/${TOTAL_TICKETS}...`);
                    const html = await this.fetchTicketPage(ticketNum);
                    const questions = this.parseVodiyQuestions(html, ticketNum);

                    this.log(
                        `  Found ${questions.length} questions in ticket ${ticketNum}`,
                    );
                    allQuestions.push(...questions);

                    await importLogsCollection.updateOne(
                        { _id: new ObjectId(jobId) as any },
                        {
                            $set: {
                                questionsImported: allQuestions.length,
                                logs: this.logs,
                            },
                        },
                    );

                    await new Promise((resolve) => setTimeout(resolve, 300));
                } catch (error: any) {
                    const errMsg = `Failed to parse ticket ${ticketNum}: ${error.message}`;
                    this.log(errMsg);
                    await importLogsCollection.updateOne(
                        { _id: new ObjectId(jobId) as any },
                        { $push: { errors: errMsg } as any },
                    );
                }
            }

            this.log(`Total questions parsed: ${allQuestions.length}`);

            this.log("Checking for duplicates...");
            const existingQuestions = await questionsCollection
                .find({}, { projection: { questionId: 1, contentHash: 1 } })
                .toArray();
            const existingMap = new Map<string, string>();
            existingQuestions.forEach((q) => {
                if (q.questionId && q.contentHash) {
                    existingMap.set(q.questionId, q.contentHash);
                }
            });

            const questionsToProcess = allQuestions.filter((q) => {
                const existingHash = existingMap.get(q.questionId!);
                return !existingHash || existingHash !== q.contentHash;
            });

            this.log(
                `Found ${questionsToProcess.length} new or updated questions to process.`,
            );

            if (questionsToProcess.length === 0) {
                this.log("No new questions to process. Import finished.");
                await importLogsCollection.updateOne(
                    { _id: new ObjectId(jobId) as any },
                    {
                        $set: {
                            status: "completed",
                            completedAt: new Date(),
                            questionsImported: 0,
                            imagesDownloaded: 0,
                            logs: this.logs,
                        },
                    },
                );
                return;
            }

            this.log("Downloading images...");
            let imagesDownloaded = 0;

            if (!fs.existsSync(IMAGES_DIR)) {
                fs.mkdirSync(IMAGES_DIR, { recursive: true });
            }

            for (const question of questionsToProcess) {
                if (question.imageUrl && question.imageUrl.startsWith("http")) {
                    try {
                        const localPath = await this.downloadImage(
                            question.imageUrl,
                            question.questionId!,
                        );
                        if (localPath) {
                            question.imageUrl = localPath;
                            imagesDownloaded++;
                        }
                    } catch (error) {}
                }
            }

            this.log(`Downloaded ${imagesDownloaded} images`);

            this.log("Saving questions to database...");

            for (const question of questionsToProcess) {
                question.topic = this.classifyQuestion({
                    text: question.text || "",
                    explanation: question.explanation || "",
                });
                question.difficulty = 3;

                await questionsCollection.updateOne(
                    { questionId: question.questionId },
                    { $set: question },
                    { upsert: true },
                );
            }

            this.log("Updating topic counts...");
            const topics = await topicsCollection.find({}).toArray();

            for (const topic of topics) {
                const count = await questionsCollection.countDocuments({
                    topic: topic.slug,
                });
                await topicsCollection.updateOne(
                    { _id: topic._id },
                    { $set: { questionCount: count, updatedAt: new Date() } },
                );
            }

            await importLogsCollection.updateOne(
                { _id: new ObjectId(jobId) as any },
                {
                    $set: {
                        status: "completed",
                        completedAt: new Date(),
                        questionsImported: allQuestions.length,
                        imagesDownloaded,
                        logs: this.logs,
                    },
                },
            );

            this.log(
                `✅ Import completed! ${allQuestions.length} questions, ${imagesDownloaded} images`,
            );
        } catch (error: any) {
            this.log(`❌ Import failed: ${error.message}`);

            await importLogsCollection.updateOne(
                { _id: new ObjectId(jobId) as any },
                {
                    $set: {
                        status: "failed",
                        completedAt: new Date(),
                        logs: this.logs,
                    },
                    $push: { errors: error.message },
                },
            );
        }
    }

    private async fetchTicketPage(ticketNumber: number): Promise<string> {
        const url = `${BASE_URL}/pdr/test/?complect=6&bilet=${ticketNumber}`;

        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7",
            },
            timeout: 30000,
        });

        return response.data;
    }

    private parseVodiyQuestions(
        html: string,
        ticketNumber: number,
    ): Partial<Question>[] {
        const $ = cheerio.load(html);
        const questions: Partial<Question>[] = [];

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

                const $questionContainer = $(node).parent();

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

                let $mainContainer = $questionContainer;
                for (let i = 0; i < 5; i++) {
                    $mainContainer = $mainContainer.next();
                    if (
                        $mainContainer.attr("class")?.includes("select_ticket")
                    ) {
                        break;
                    }
                }

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

                const options: { id: string; text: string }[] = [];
                let correctAnswer = "A";
                const $ticketRight = $mainContainer.find(".ticket_right");

                if ($ticketRight.length) {
                    $ticketRight.find("label.label_raio").each((idx, label) => {
                        const $label = $(label);

                        const $input = $label.find('input[type="radio"]');
                        const isCorrect = $input.attr("rel") === "rt1";
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
                                text: optionText,
                            });
                        }
                    });
                }

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

                if (questionText && options.length >= 2) {
                    const questionData = {
                        questionId: `T${ticketNumber}Q${questions.length + 1}`,
                        ticketNumber,
                        questionNumber: questions.length + 1,
                        text: questionText,
                        imageUrl,
                        options,
                        correctAnswer,
                        explanation: explanation || "",
                        category: "ПДР України",
                    };

                    const contentToHash = JSON.stringify({
                        text: questionData.text,
                        options: questionData.options,
                        correctAnswer: questionData.correctAnswer,
                        explanation: questionData.explanation,
                        imageUrl: questionData.imageUrl,
                    });
                    const contentHash = crypto
                        .createHash("md5")
                        .update(contentToHash)
                        .digest("hex");

                    questions.push({
                        ...questionData,
                        contentHash,
                    });
                }
            });

        return questions;
    }

    private async downloadImage(
        imageUrl: string,
        questionId: string,
    ): Promise<string | null> {
        try {
            const response = await axios.get(imageUrl, {
                responseType: "arraybuffer",
                timeout: 30000,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                },
            });

            let ext = path.extname(new URL(imageUrl).pathname);
            if (!ext) {
                const contentType = response.headers["content-type"];
                if (
                    contentType?.includes("jpeg") ||
                    contentType?.includes("jpg")
                ) {
                    ext = ".jpg";
                } else if (contentType?.includes("png")) {
                    ext = ".png";
                } else if (contentType?.includes("webp")) {
                    ext = ".webp";
                } else {
                    ext = ".jpg";
                }
            }

            const filename = `${questionId}${ext}`;
            const filepath = path.join(IMAGES_DIR, filename);

            fs.writeFileSync(filepath, response.data);

            return `/images/questions/${filename}`;
        } catch (error) {
            return null;
        }
    }

    async getImportStatus(jobId: string): Promise<ImportLog | null> {
        const importLogsCollection = await getImportLogsCollection();

        const log = await importLogsCollection.findOne({
            _id: new ObjectId(jobId) as any,
        });

        return log as ImportLog | null;
    }

    async getImportLogs(
        page: number = 1,
        limit: number = 20,
    ): Promise<{ logs: ImportLog[]; total: number }> {
        const importLogsCollection = await getImportLogsCollection();
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            importLogsCollection
                .find({})
                .sort({ startedAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            importLogsCollection.countDocuments({}),
        ]);

        return { logs: logs as ImportLog[], total };
    }
}

export const parserService = new ParserService();

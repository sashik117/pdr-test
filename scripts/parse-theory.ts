import axios from "axios";
import * as cheerio from "cheerio";
import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/pdr-ukraine";
const BASE_URL = "https://vodiy.ua";
const IMAGES_DIR = path.join(__dirname, "../backend/public/images/theory");

// Ensure images directory exists
function ensureImagesDir() {
    const dirs = [
        path.join(IMAGES_DIR, "signs"),
        path.join(IMAGES_DIR, "marking"),
        path.join(IMAGES_DIR, "questions"),
        path.join(IMAGES_DIR, "pdr"),
    ];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    }
}

// Download image and return local path
async function downloadImage(imageUrl: string): Promise<string> {
    try {
        // Parse URL to get path
        let urlPath: string;
        if (imageUrl.startsWith("http")) {
            const url = new URL(imageUrl);
            urlPath = url.pathname;
        } else {
            urlPath = imageUrl;
        }

        // Skip if not a media URL
        if (!urlPath.includes("/media/")) {
            return imageUrl;
        }

        // Determine local path based on URL structure
        // /media/uploads/signs/1.1.png -> /images/theory/signs/1.1.png
        // /media/uploads/marking/1.1.png -> /images/theory/marking/1.1.png
        // /media/questions/pdr/1.10.1.jpg -> /images/theory/pdr/1.10.1.jpg
        // /media/questions/123.jpg -> /images/theory/questions/123.jpg

        let localRelPath: string;
        const filename = path.basename(urlPath);

        if (urlPath.includes("/uploads/signs/")) {
            localRelPath = `signs/${filename}`;
        } else if (urlPath.includes("/uploads/marking/") || urlPath.includes("/rozmitka/")) {
            localRelPath = `marking/${filename}`;
        } else if (urlPath.includes("/questions/pdr/")) {
            localRelPath = `pdr/${filename}`;
        } else {
            localRelPath = `questions/${filename}`;
        }

        const localPath = path.join(IMAGES_DIR, localRelPath);
        const localUrlPath = `/images/theory/${localRelPath}`;

        // Check if already downloaded
        if (fs.existsSync(localPath)) {
            return localUrlPath;
        }

        // Download image
        const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`;

        const response = await axios({
            method: "GET",
            url: fullUrl,
            responseType: "stream",
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        await pipeline(response.data, createWriteStream(localPath));
        console.log(`    Downloaded: ${filename}`);

        return localUrlPath;
    } catch (error) {
        console.error(`    Failed to download: ${imageUrl}`);
        return imageUrl; // Return original on failure
    }
}

// Convert internal links to local routes
function convertLinks(html: string): string {
    // Convert vodiy.ua links to local routes
    // https://vodiy.ua/pdr/2/#21 -> /theory/rules/2#21
    // /pdr/2/#21 -> /theory/rules/2#21
    // /znaky/3/3.1/ -> /theory/road-signs/3/3.1
    // /rozmitka/1/1.13/ -> /theory/road-markings/1/1.13

    let result = html;

    // PDR chapter links: /pdr/N/#section or https://vodiy.ua/pdr/N/#section
    result = result.replace(
        /href="(?:https?:\/\/vodiy\.ua)?\/pdr\/(\d+)\/?(?:#(\d+))?"/g,
        'href="/theory/rules/$1#$2"'
    );

    // Road signs links: /znaky/N/X.X/ or tooltips
    result = result.replace(
        /href="(?:https?:\/\/vodiy\.ua)?\/znaky\/(\d+)\/([^"\/]+)\/?"(?:\s+oldtitle="[^"]*")?(?:\s+title="[^"]*")?/g,
        'href="/theory/road-signs/$1/$2"'
    );

    // Road markings links: /rozmitka/N/X.X/
    result = result.replace(
        /href="(?:https?:\/\/vodiy\.ua)?\/rozmitka\/(\d+)\/([^"\/]+)\/?"(?:\s+oldtitle="[^"]*")?(?:\s+title="[^"]*")?/g,
        'href="/theory/road-markings/$1/$2"'
    );

    // External documentation links (keep as-is but add target="_blank")
    result = result.replace(
        /href="(https?:\/\/zakon\.rada\.gov\.ua[^"]*)"/g,
        'href="$1" target="_blank" rel="noopener noreferrer"'
    );

    return result;
}

// Process HTML content to download images and fix links
async function processHtml(html: string): Promise<string> {
    if (!html) return html;

    let result = html;

    // Find all image src attributes (both relative and absolute vodiy.ua URLs)
    const imgRegex = /src="([^"]+)"/g;
    const matches: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
        const url = match[1];
        // Match both /media/ and https://vodiy.ua/media/
        if (url.includes("/media/") || url.includes("vodiy.ua")) {
            matches.push(url);
        }
    }

    // Download unique images
    const uniqueImages = [...new Set(matches)];
    const imageMap = new Map<string, string>();

    for (const imgUrl of uniqueImages) {
        const localPath = await downloadImage(imgUrl);
        imageMap.set(imgUrl, localPath);
    }

    // Replace image URLs
    for (const [original, local] of imageMap) {
        result = result.split(original).join(local);
    }

    // Convert links
    result = convertLinks(result);

    // Clean up data attributes and tooltips
    result = result.replace(/\s+data-hasqtip="[^"]*"/g, "");
    result = result.replace(/\s+oldtitle="[^"]*"/g, "");
    result = result.replace(/\s+title=""\s*/g, " ");

    return result;
}

// Fetch HTML content with retry logic
async function fetchPage(url: string, retries = 3): Promise<string> {
    console.log(`Fetching: ${url}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7",
                },
                timeout: 30000,
            });
            return response.data;
        } catch (error) {
            console.log(`  Attempt ${attempt}/${retries} failed`);
            if (attempt === retries) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
    }
    throw new Error("Failed to fetch page");
}

// Parse main page to get all chapter links
async function getChapterLinks(): Promise<ChapterLink[]> {
    console.log("Fetching chapter list from main page...");

    const html = await fetchPage(`${BASE_URL}/pdr/`);
    const $ = cheerio.load(html);
    const chapters: ChapterLink[] = [];

    $(".switch_contetn_1 ol li a").each((index, element) => {
        const $link = $(element);
        const href = $link.attr("href") || "";
        const title = $link.text().trim();

        // Extract chapter ID from href like "/pdr/1/"
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

    console.log(`✓ Found ${chapters.length} chapters\n`);
    return chapters;
}

// Parse a single chapter page
async function parseChapter(chapterLink: ChapterLink): Promise<TheoryChapter> {
    const html = await fetchPage(chapterLink.href);
    const $ = cheerio.load(html);

    const sections: TheorySection[] = [];

    // Parse each text_box element
    const textBoxes = $("#elems .text_box").toArray();

    for (const element of textBoxes) {
        const $box = $(element);

        // Get section number (e.g., "1.1", "1.2")
        const sectionNumber = $box.find(".number a").first().text().trim();
        const sectionId = $box.find(".number a").attr("name") || sectionNumber.replace(".", "");

        // Get the content span (second span, after .number)
        const $contentSpan = $box.find("> span").last();

        // Clone to avoid modifying original
        const $clonedContent = $contentSpan.clone();

        // Extract comment separately
        const $commentDiv = $clonedContent.find(".collapse");
        let comment = "";
        if ($commentDiv.length > 0) {
            // Get comment HTML with images
            comment = $commentDiv.html() || "";
            $commentDiv.remove();
        }

        // Remove comment button from main content
        $clonedContent.find(".button_comment").remove();
        $clonedContent.find("script").remove();

        // Get main content HTML
        let content = $clonedContent.html() || "";

        // Process content - download images and fix links
        content = await processHtml(content);
        if (comment) {
            comment = await processHtml(comment);
        }

        // Extract local image paths
        const images: string[] = [];
        const imageRegex = /src="(\/images\/theory\/[^"]+)"/g;
        let match;

        while ((match = imageRegex.exec(content)) !== null) {
            images.push(match[1]);
        }
        while ((match = imageRegex.exec(comment)) !== null) {
            images.push(match[1]);
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

    // Create slug from chapter ID
    const slug = `chapter-${chapterLink.chapterId}`;

    const chapter: TheoryChapter = {
        type: "pdr-chapter",
        slug: slug,
        chapterId: chapterLink.chapterId,
        title: chapterLink.title,
        description: `Розділ ${chapterLink.chapterId}. ${chapterLink.title}`,
        sections: sections,
        order: chapterLink.chapterId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    console.log(`  ✓ Chapter ${chapterLink.chapterId}: ${chapterLink.title} - ${sections.length} sections`);

    return chapter;
}

async function main() {
    console.log("╔══════════════════════════════════════════════════════╗");
    console.log("║   PDR Theory Parser - vodiy.ua Edition v3            ║");
    console.log("║   With signs, markings, images and link conversion   ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");

    // Ensure images directory exists
    ensureImagesDir();

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("✓ Connected to MongoDB\n");

    const db = client.db();
    const theoryCollection = db.collection("theory_content");

    let totalItems = 0;
    let totalImages = 0;

    try {
        // Parse PDR chapters
        console.log("═".repeat(50));
        console.log("Parsing PDR Chapters");
        console.log("═".repeat(50) + "\n");

        const chapterLinks = await getChapterLinks();
        const chapters: TheoryChapter[] = [];

        for (const chapterLink of chapterLinks) {
            try {
                const chapter = await parseChapter(chapterLink);
                chapters.push(chapter);

                // Count images
                for (const section of chapter.sections) {
                    totalImages += section.images.length;
                }

                // Wait between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`  ✗ Error parsing chapter ${chapterLink.chapterId}:`, error);
            }
        }

        if (chapters.length > 0) {
            // Delete existing PDR chapters
            await theoryCollection.deleteMany({ type: "pdr-chapter" });

            // Insert new chapters
            await theoryCollection.insertMany(chapters);
            totalItems += chapters.length;

            console.log(`\n✓ Saved ${chapters.length} PDR chapters`);
        }

        // Parse Road Signs
        console.log("\n" + "═".repeat(50));
        console.log("Parsing Road Signs");
        console.log("═".repeat(50) + "\n");

        const signCategories = [
            { id: 1, name: "Попереджувальні знаки" },
            { id: 2, name: "Знаки пріоритету" },
            { id: 3, name: "Заборонні знаки" },
            { id: 4, name: "Наказові знаки" },
            { id: 5, name: "Інформаційно-вказівні знаки" },
            { id: 6, name: "Знаки сервісу" },
            { id: 7, name: "Таблички до дорожніх знаків" },
        ];

        const signs: any[] = [];
        for (const category of signCategories) {
            try {
                const categoryData = await parseSignCategory(category.id, category.name);
                signs.push(categoryData);
                console.log(`  ✓ Category ${category.id}: ${category.name} - ${categoryData.items?.length || 0} signs`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`  ✗ Error parsing sign category ${category.id}:`, error);
            }
        }

        if (signs.length > 0) {
            await theoryCollection.deleteMany({ type: "road-signs" });
            await theoryCollection.insertMany(signs);
            totalItems += signs.length;
            console.log(`\n✓ Saved ${signs.length} sign categories`);
        }

        // Parse Road Markings
        console.log("\n" + "═".repeat(50));
        console.log("Parsing Road Markings");
        console.log("═".repeat(50) + "\n");

        const markingCategories = [
            { id: 1, name: "Горизонтальна розмітка" },
            { id: 2, name: "Вертикальна розмітка" },
        ];

        const markings: any[] = [];
        for (const category of markingCategories) {
            try {
                const categoryData = await parseMarkingCategory(category.id, category.name);
                markings.push(categoryData);
                console.log(`  ✓ Category ${category.id}: ${category.name} - ${categoryData.items?.length || 0} markings`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`  ✗ Error parsing marking category ${category.id}:`, error);
            }
        }

        if (markings.length > 0) {
            await theoryCollection.deleteMany({ type: "road-markings" });
            await theoryCollection.insertMany(markings);
            totalItems += markings.length;
            console.log(`\n✓ Saved ${markings.length} marking categories`);
        }

    } catch (error) {
        console.error("✗ Fatal error:", error);
    } finally {
        await client.close();
        console.log("✓ MongoDB connection closed");
    }

    console.log("\n╔══════════════════════════════════════════════════════╗");
    console.log(`║  ✓ Parsing complete! ${totalItems} items total  `);
    console.log("╚══════════════════════════════════════════════════════╝\n");
}

// Parse road sign category with detail pages
async function parseSignCategory(categoryId: number, categoryName: string): Promise<any> {
    const url = `${BASE_URL}/znaky/${categoryId}/`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const signLinks: { code: string, href: string, description: string, imgSrc: string }[] = [];

    // Find all sign items in the .mark-inside container
    $(".mark-inside li a").each((_, element) => {
        const $el = $(element);
        const href = $el.attr("href") || "";

        // Relative URLs like "7.1.1/" - extract the code
        const match = href.match(/^([\d\.]+)\/?$/);
        if (match) {
            const signCode = match[1];
            const codeFromMark = $el.find("mark").text().trim();
            const description = $el.find("span span").last().text().trim();
            const imgSrc = $el.find("img").attr("src") || "";

            if (signCode && !signLinks.find(i => i.code === signCode)) {
                signLinks.push({
                    code: signCode,
                    href: `${BASE_URL}/znaky/${categoryId}/${signCode}/`,
                    description: description,
                    imgSrc: imgSrc,
                });
            }
        }
    });

    // Fetch detail pages for each sign
    const items: any[] = [];
    for (const sign of signLinks) {
        try {
            const detailHtml = await fetchPage(sign.href);
            const $detail = cheerio.load(detailHtml);

            // Get full content from .mark_markpage_block
            const contentBlock = $detail(".mark_markpage_block");
            let fullContent = "";

            // Get all paragraphs
            contentBlock.find("p").each((_, p) => {
                fullContent += $detail(p).html() || "";
            });

            // Convert links in content
            fullContent = convertLinks(fullContent);

            items.push({
                code: sign.code,
                title: `Знак ${sign.code}`,
                shortDescription: sign.description,
                content: fullContent,
                imageUrl: sign.imgSrc ? `https://vodiy.ua${sign.imgSrc}` : `/images/theory/signs/${sign.code}.png`,
                localImageUrl: `/images/theory/signs/${sign.code}.png`,
            });

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            // If detail page fails, use basic info
            items.push({
                code: sign.code,
                title: `Знак ${sign.code}`,
                shortDescription: sign.description,
                content: "",
                imageUrl: sign.imgSrc ? `https://vodiy.ua${sign.imgSrc}` : `/images/theory/signs/${sign.code}.png`,
                localImageUrl: `/images/theory/signs/${sign.code}.png`,
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

// Parse road marking category with detail pages
async function parseMarkingCategory(categoryId: number, categoryName: string): Promise<any> {
    const url = `${BASE_URL}/rozmitka/${categoryId}/`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const markingLinks: { code: string, href: string, description: string, imgSrc: string }[] = [];

    // Find all marking items in the .mark-inside container
    $(".mark-inside li a").each((_, element) => {
        const $el = $(element);
        const href = $el.attr("href") || "";

        // Relative URLs like "1.1/" - extract the code
        const match = href.match(/^([\d\.]+)\/?$/);
        if (match) {
            const markingCode = match[1];
            const fullText = $el.find("span span").last().text().trim();
            const descMatch = fullText.match(/Розмітка\s+[\d\.]+\s*(.*)$/);
            const description = descMatch ? descMatch[1].replace(/^\(|\)$/g, '').trim() : fullText;
            const imgSrc = $el.find("img").attr("src") || "";

            if (markingCode && !markingLinks.find(i => i.code === markingCode)) {
                markingLinks.push({
                    code: markingCode,
                    href: `${BASE_URL}/rozmitka/${categoryId}/${markingCode}/`,
                    description: description || fullText,
                    imgSrc: imgSrc,
                });
            }
        }
    });

    // Fetch detail pages for each marking
    const items: any[] = [];
    for (const marking of markingLinks) {
        try {
            const detailHtml = await fetchPage(marking.href);
            const $detail = cheerio.load(detailHtml);

            // Get full content from .mark_markpage_block
            const contentBlock = $detail(".mark_markpage_block");
            let fullContent = "";

            // Get all paragraphs
            contentBlock.find("p").each((_, p) => {
                fullContent += $detail(p).html() || "";
            });

            // Convert links in content
            fullContent = convertLinks(fullContent);

            items.push({
                code: marking.code,
                title: `Розмітка ${marking.code}`,
                shortDescription: marking.description,
                content: fullContent,
                imageUrl: marking.imgSrc ? `https://vodiy.ua${marking.imgSrc}` : `/images/theory/marking/${marking.code}.png`,
                localImageUrl: `/images/theory/marking/${marking.code}.png`,
            });

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            // If detail page fails, use basic info
            items.push({
                code: marking.code,
                title: `Розмітка ${marking.code}`,
                shortDescription: marking.description,
                content: "",
                imageUrl: marking.imgSrc ? `https://vodiy.ua${marking.imgSrc}` : `/images/theory/marking/${marking.code}.png`,
                localImageUrl: `/images/theory/marking/${marking.code}.png`,
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

main().catch(console.error);


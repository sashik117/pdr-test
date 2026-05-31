import { getTheoryContentCollection, TheoryContent } from "../utils/db";

export interface TheoryTypeInfo {
    type: string;
    title: string;
    count: number;
}

export interface TheoryItemDTO {
    id: string;
    type: string;
    slug: string;
    title: string;
    description: string;
    imageUrl: string | null;
    categoryId: string;
    categoryName: string;
    order: number;
    itemCount: number;
    chapterId?: number;
    items?: any[];
}

export interface TheoryDetailsDTO {
    id: string;
    type: string;
    slug: string;
    title: string;
    description: string;
    imageUrl: string | null;
    categoryId: string;
    categoryName: string;
    order: number;
    chapterId?: number;
    sections?: any[];
    items?: any[];
}

export class TheoryService {
    async getTheoryList(type?: string): Promise<{
        theoryTypes?: TheoryTypeInfo[];
        type?: string;
        content?: TheoryItemDTO[];
        grouped?: Record<string, TheoryItemDTO[]>;
    }> {
        const theoryCollection = await getTheoryContentCollection();

        const filter: Record<string, unknown> = {};
        if (type) filter.type = type;

        const content = await theoryCollection
            .find(filter)
            .sort({ order: 1 })
            .toArray();

        const grouped = content.reduce(
            (acc: Record<string, TheoryItemDTO[]>, item) => {
                if (!acc[item.type]) {
                    acc[item.type] = [];
                }

                const itemCount =
                    item.sections?.length || item.items?.length || 0;

                acc[item.type].push({
                    id: item._id?.toString() || "",
                    type: item.type,
                    slug: item.slug,
                    title: item.title,
                    description: item.description || "",
                    imageUrl: item.imageUrl || null,
                    categoryId: item.categoryId || "",
                    categoryName: item.categoryName || "",
                    order: item.order || 0,
                    itemCount: itemCount,
                    chapterId: item.chapterId,
                    items:
                        item.type === "road-signs" ||
                        item.type === "road-markings"
                            ? item.items
                            : undefined,
                });
                return acc;
            },
            {},
        );

        if (type) {
            return {
                type,
                content: grouped[type] || [],
            };
        }

        return {
            theoryTypes: [
                {
                    type: "pdr-chapter",
                    title: "Правила дорожнього руху",
                    count: grouped["pdr-chapter"]?.length || 0,
                },
                {
                    type: "road-signs",
                    title: "Дорожні знаки",
                    count: grouped["road-signs"]?.length || 0,
                },
                {
                    type: "road-markings",
                    title: "Дорожня розмітка",
                    count: grouped["road-markings"]?.length || 0,
                },
            ],
            grouped,
        };
    }

    async getTheoryBySlug(slug: string): Promise<TheoryDetailsDTO | null> {
        const theoryCollection = await getTheoryContentCollection();
        const item = await theoryCollection.findOne({ slug });

        if (!item) return null;

        return {
            id: item._id?.toString() || "",
            type: item.type,
            slug: item.slug,
            title: item.title,
            description: item.description || "",
            imageUrl: item.imageUrl || null,
            categoryId: item.categoryId || "",
            categoryName: item.categoryName || "",
            order: item.order || 0,
            chapterId: item.chapterId,
            sections: item.sections || [],
            items: item.items || [],
        };
    }
}

export const theoryService = new TheoryService();

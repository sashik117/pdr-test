import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "ПДР Тест | Підготовка до іспиту з правил дорожнього руху України",
    description:
        "Безкоштовна підготовка до іспиту з ПДР України. Всі офіційні білети, тренувальні тести та докладні пояснення.",
    keywords: [
        "ПДР",
        "правила дорожнього руху",
        "тест",
        "іспит",
        "Україна",
        "водійські права",
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="uk">
            <body className="font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

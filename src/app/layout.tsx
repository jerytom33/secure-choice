import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "Secure Choice | Insurance & Financial Consultancy Services",
  description: "Secure Choice is a leading financial consultancy firm in Trivandrum. We offer expert guidance on Life Insurance, Health Insurance, General Insurance, Financial Planning, and Claim Assistance.",
  keywords: "Secure Choice, Insurance Trivandrum, Health Insurance, Life Insurance, General Insurance, Financial Advisor, Claim Assistance, Balasubramani S",
  authors: [{ name: "Secure Choice" }],
  robots: "index, follow",
  openGraph: {
    title: "Secure Choice | Expert Insurance & Financial Consultancy",
    description: "Get customized life, health, and general insurance solutions with dedicated claim support from Secure Choice.",
    type: "website",
    locale: "en_IN",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-dark text-white">
        {children}
      </body>
    </html>
  );
}

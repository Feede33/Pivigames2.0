import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameFlix - Stream Your Favorite Games",
  description: "Unlimited games, movies, and more",
};

type Locale = 'es' | 'en';

export async function generateStaticParams() {
  return [
    { locale: 'es' as const },
    { locale: 'en' as const },
    { locale: 'pt' as const },
    { locale: 'fr' as const },
    { locale: 'de' as const },
    { locale: 'it' as const },
    { locale: 'ru' as const },
    { locale: 'ja' as const },
    { locale: 'ko' as const },
    { locale: 'zh' as const },
    { locale: 'ar' as const },
  ];
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params;
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

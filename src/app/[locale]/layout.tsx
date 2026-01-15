import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { LocaleUpdater } from "@/components/LocaleUpdater"

export const metadata: Metadata = {
  title: "Pegasusgames - Stream Your Favorite Games",
  description: "Unlimited games, netflix style",
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
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <LocaleUpdater />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

'use client';

import * as React from "react";
import { usePathname, useRouter, useParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Locale } from '@/lib/i18n';

// Mapeo de idiomas con sus nombres nativos y banderas
const languages: { code: Locale; name: string; nativeName: string; flag: string }[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) || 'es';
  
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const switchLanguage = (newLocale: Locale) => {
    // Reemplazar el locale en la URL
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-muted/50 transition">
        <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="text-xs md:text-sm">{currentLanguage.flag}</span>
      </button>
      
      {/* Dropdown con ScrollArea */}
      <div className="absolute right-0 mt-2 w-48 md:w-56 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <ScrollArea className="h-64 md:h-80 rounded-lg">
          <div className="p-3 md:p-4">
            <h4 className="mb-3 md:mb-4 text-xs md:text-sm leading-none font-medium flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Select Language
            </h4>
            {languages.map((lang, index) => (
              <React.Fragment key={lang.code}>
                <button
                  onClick={() => switchLanguage(lang.code)}
                  className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg hover:bg-muted/50 transition text-left ${
                    currentLocale === lang.code ? 'bg-muted/30 font-semibold' : ''
                  }`}
                >
                  <span className="text-base md:text-xl">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate">{lang.nativeName}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{lang.name}</p>
                  </div>
                  {currentLocale === lang.code && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
                {index < languages.length - 1 && (
                  <Separator className="my-1.5 md:my-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

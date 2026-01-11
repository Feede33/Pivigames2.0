'use client';

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

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

interface LanguageSelectorProps {
  currentLocale: Locale;
}

export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (locale: Locale) => {
    // Extraer el path sin el locale actual
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    const newPath = `/${locale}${pathWithoutLocale}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-12 z-50">
      {/* Botón de idioma */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 hover:bg-accent transition-all duration-300 shadow-lg"
      >
        <Globe className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="text-2xl">{currentLanguage.flag}</span>
        <span className="text-sm font-semibold">{currentLanguage.nativeName}</span>
      </button>

      {/* Modal de selección */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu de idiomas */}
          <div className="absolute bottom-20 right-0 z-50 w-[280px] bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-border">
            <div className="p-4">
              <h4 className="mb-4 text-sm leading-none font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Seleccionar Idioma
              </h4>
              
              <ScrollArea className="h-[320px] w-full rounded-md">
                <div className="pr-4">
                  {languages.map((lang, index) => (
                    <React.Fragment key={lang.code}>
                      <button
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left ${
                          currentLocale === lang.code ? 'bg-accent/50' : ''
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{lang.nativeName}</p>
                          <p className="text-xs text-muted-foreground">{lang.name}</p>
                        </div>
                        {currentLocale === lang.code && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </button>
                      {index < languages.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

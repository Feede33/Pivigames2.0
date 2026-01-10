'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

const languages = {
  es: { name: 'Español', flag: '🇪🇸' },
  en: { name: 'English', flag: '🇺🇸' },
  pt: { name: 'Português', flag: '🇧🇷' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  zh: { name: '中文', flag: '🇨🇳' },
  ar: { name: 'العربية', flag: '🇸🇦' },
};

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) || 'es';

  const switchLanguage = (newLocale: Locale) => {
    // Reemplazar el locale en la URL
    const segments = pathname.split('/');
    segments[1] = newLocale; // El locale está en la segunda posición
    const newPath = segments.join('/');
    router.push(newPath);
    router.refresh(); // Forzar recarga para actualizar el contenido
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition">
        <Globe className="w-4 h-4" />
        <span className="text-sm">{languages[currentLocale].flag}</span>
      </button>
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-48 max-h-96 overflow-y-auto bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {(Object.keys(languages) as Locale[]).map((locale) => (
          <button
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${
              locale === currentLocale ? 'bg-muted/30 font-semibold' : ''
            }`}
          >
            <span>{languages[locale].flag}</span>
            <span>{languages[locale].name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

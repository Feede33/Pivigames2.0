'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { proxySteamImage } from '@/lib/image-proxy';
import type { TranslationKeys } from '@/lib/i18n';

type SteamSpecialEnriched = {
  id: number;
  name: string;
  discount_percent: number;
  original_price: number;
  final_price: number;
  currency: string;
  header_image: string;
  capsule_image: string;
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  hasDownloadLink?: boolean;
  downloadLink?: string | null;
};

type Props = {
  specials: SteamSpecialEnriched[];
  loading: boolean;
  t: any; // Acepta cualquier objeto de traducción
  onSpecialClick: (special: SteamSpecialEnriched, event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function SteamOffers({ specials, loading, t, onSpecialClick }: Props) {
  const [offersScroll, setOffersScroll] = useState(0);

  const scrollOffers = (direction: 'left' | 'right') => {
    const container = document.getElementById('offers-scroll');
    if (container) {
      const scrollAmount = 484;
      const newScroll =
        direction === 'left'
          ? Math.max(0, offersScroll - scrollAmount)
          : offersScroll + scrollAmount;

      container.scrollTo({ left: newScroll, behavior: 'smooth' });
      setOffersScroll(newScroll);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const realPrice = price / 100;
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      ARS: 'AR$',
      MXN: 'MX$',
      BRL: 'R$',
      CLP: 'CLP$',
      COP: 'COL$',
      PEN: 'S/',
      UYU: 'UY$',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${realPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <section className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-9 w-96 bg-gradient-to-r from-purple-900/40 to-violet-900/40 rounded-lg animate-pulse"></div>
            <div className="h-4 w-64 bg-purple-900/30 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[460px]">
              <div className="relative rounded-xl overflow-hidden mb-4 border border-purple-900/30">
                <div className="w-[460px] h-[215px] bg-gradient-to-br from-purple-900/40 to-violet-900/40 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (specials.length === 0) {
    return null;
  }

  return (
    <section className="relative group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            {t.offers.title}
          </h3>
          <p className="text-muted-foreground text-sm">{t.offers.subtitle}</p>
        </div>
      </div>

      <div
        id="offers-scroll"
        className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide scroll-smooth pl-3"
      >
        {specials.map((special) => (
          <div
            key={special.id}
            className="flex-shrink-0 w-[460px] group/card cursor-pointer"
            onClick={(e) => onSpecialClick(special, e)}
          >
            <div className="relative rounded-xl overflow-hidden mb-4 shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-[1.02] border border-white/5">
              {/* Imagen principal */}
              <div className="w-[460px] h-[215px] bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
                <img
                  src={proxySteamImage(special.header_image)}
                  alt={special.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity duration-300"></div>
              </div>

              {/* Badge de descuento */}
              <div className="absolute top-4 left-4 z-20">
                <div className="relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 px-3 py-2 rounded-md shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-md"></div>
                  <div className="relative flex flex-col items-center">
                    <span className="text-[10px] font-bold text-green-100 uppercase tracking-wider leading-none">
                      {t.offers.save}
                    </span>
                    <span className="text-2xl font-black text-white leading-none mt-0.5">
                      {special.discount_percent}%
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-md border-2 border-white/30"></div>
                </div>
              </div>

              {/* Badge de disponibilidad */}
              {special.hasDownloadLink && (
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50"></div>
                    <span className="relative bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t.offers.available}
                    </span>
                  </div>
                </div>
              )}

              {/* Plataformas */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {special.platforms.windows && (
                  <span className="bg-black/80 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-white/10 shadow-lg">
                    <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6.555 1.375 0 2.237v5.45h6.555V1.375zM0 13.795l6.555.933V8.313H0v5.482zm7.278-5.4.026 6.378L16 16V8.395H7.278zM16 0 7.33 1.244v6.414H16V0z" />
                    </svg>
                    Win
                  </span>
                )}
                {special.platforms.mac && (
                  <span className="bg-black/80 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-white/10 shadow-lg">
                    <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z" />
                    </svg>
                    Mac
                  </span>
                )}
              </div>
            </div>

            {/* Título y precio */}
            <div className="space-y-2 px-1">
              <h4 className="font-bold text-base line-clamp-2 group-hover/card:text-green-400 transition-colors duration-300">
                {special.name}
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground line-through opacity-60">
                    {formatPrice(special.original_price, special.currency)}
                  </span>
                  <span className="text-lg font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    {formatPrice(special.final_price, special.currency)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                  {t.offers.save}{' '}
                  {formatPrice(special.original_price - special.final_price, special.currency)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={() => scrollOffers('left')}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 group/btn opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-green-500/30 group-hover/btn:border-green-400 shadow-2xl flex items-center justify-center transition-all duration-300">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 rounded-full border-2 border-green-400/0 group-hover/btn:border-green-400/50 group-hover/btn:scale-110 transition-all duration-300"></div>
          <ChevronLeft
            className="w-8 h-8 text-green-400 relative z-10 group-hover/btn:text-green-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
            strokeWidth={3}
          />
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
          </div>
        </div>
        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/90 backdrop-blur-sm text-green-400 text-sm font-bold px-3 py-1.5 rounded-lg border border-green-500/30 whitespace-nowrap shadow-xl">
            {t.offers.viewPrevious}
          </div>
        </div>
      </button>

      <button
        onClick={() => scrollOffers('right')}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 group/btn opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-blue-500/30 group-hover/btn:border-blue-400 shadow-2xl flex items-center justify-center transition-all duration-300">
          <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-blue-500/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/0 group-hover/btn:border-blue-400/50 group-hover/btn:scale-110 transition-all duration-300"></div>
          <ChevronRight
            className="w-8 h-8 text-blue-400 relative z-10 group-hover/btn:text-blue-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            strokeWidth={3}
          />
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
          </div>
        </div>
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/90 backdrop-blur-sm text-blue-400 text-sm font-bold px-3 py-1.5 rounded-lg border border-blue-500/30 whitespace-nowrap shadow-xl">
            {t.offers.viewMore}
          </div>
        </div>
      </button>
    </section>
  );
}

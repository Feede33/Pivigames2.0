import { Star } from 'lucide-react';
import PriceCard from './PriceCard';
import { getSteamLanguage } from '@/lib/steam-languages';

type SteamData = {
  price: string | null;
  is_free: boolean;
  price_info: {
    currency: string;
    discount_percent: number;
    initial_formatted: string | null;
    final_formatted: string | null;
  } | null;
  genres: string[];
  metacritic: number | null;
  developers: string[];
  publishers: string[];
  release_date: string | null;
  current_price: string | null;
  lowest_recorded_price: string | null;
  steam_appid: number;
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  categories: string[];
  languages: string[];
};

type UserLocation = {
  country: string;
  country_code: string;
  steam_country_code: string;
  currency?: string;
};

type Props = {
  loadingSteam: boolean;
  steamData: SteamData | null;
  userLocation: UserLocation | null;
  gameGenre: string;
  gameRating: number;
  gameYear?: number;
  locale: string;
  styles: any;
  t: any;
};

export default function Sidebar({
  loadingSteam,
  steamData,
  userLocation,
  gameGenre,
  gameRating,
  gameYear,
  locale,
  styles,
  t,
}: Props) {
  return (
    <div style={styles.sidebar.spacing}>
      {/* Price Card */}
      <PriceCard loadingSteam={loadingSteam} steamData={steamData} userLocation={userLocation} styles={styles} t={t} />

      {/* Game info */}
      {loadingSteam ? (
        <div className="space-y-2 md:space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 md:h-5 bg-gray-700 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          <p style={styles.sidebar.info} className="text-gray-500">
            <span>{t.modal.genre} </span>
            <span className="text-white">{steamData?.genres?.length ? steamData.genres.join(', ') : gameGenre}</span>
          </p>
          <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
            <span>{t.modal.rating} </span>
            <span className="text-white flex items-center gap-1">
              <Star
                fill="yellow"
                stroke="yellow"
                strokeWidth={0.5}
                size={12}
                className="xs:w-3.5 xs:h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
              />
              {steamData?.metacritic ? `${steamData.metacritic}/100 (Metacritic)` : `${gameRating}/10`}
            </span>
          </p>
          <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
            <span>{t.modal.developer} </span>
            <span className="text-white">
              {steamData?.developers?.length ? steamData.developers.join(', ') : t.modal.notAvailable || 'N/A'}
            </span>
          </p>
          <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
            <span>{t.modal.publisher} </span>
            <span className="text-white">
              {steamData?.publishers?.length ? steamData.publishers.join(', ') : t.modal.notAvailable || 'N/A'}
            </span>
          </p>
          <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
            <span>{t.modal.release} </span>
            <span className="text-white">{steamData?.release_date || gameYear || new Date().getFullYear()}</span>
          </p>
          <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
            <span>{t.modal.priceHistory} </span>
            {steamData?.current_price && steamData?.lowest_recorded_price ? (
              <span className="text-white text-[10px] xs:text-xs sm:text-xs md:text-sm">
                <a
                  href={`https://steamdb.info/app/${steamData.steam_appid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors cursor-pointer underline decoration-dotted"
                >
                  {t.modal.currentPrice} {steamData.current_price}
                </a>
                {' | '}
                <a
                  href={`https://steamdb.info/app/${steamData.steam_appid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors cursor-pointer underline decoration-dotted"
                >
                  {t.modal.lowestPrice} {steamData.lowest_recorded_price}
                </a>
              </span>
            ) : (
              <span className="text-white">{t.modal.notAvailable}</span>
            )}
          </p>
        </div>
      )}

      {/* Platforms */}
      <div>
        <h4 className="text-gray-400 text-[10px] xs:text-xs sm:text-xs md:text-sm mb-1 xs:mb-1.5 sm:mb-1.5 md:mb-2">
          {t.modal.availableOn}
        </h4>
        {loadingSteam ? (
          <div className="h-3.5 xs:h-4 sm:h-4 md:h-5 w-16 xs:w-20 sm:w-22 md:w-24 bg-gray-700 animate-pulse rounded" />
        ) : (
          <div className="flex gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 text-[10px] xs:text-xs sm:text-xs md:text-sm text-gray-300">
            {steamData?.platforms ? (
              <>
                {steamData.platforms.windows && <span title="Windows">Windows</span>}
                {steamData.platforms.mac && <span title="Mac">Mac</span>}
                {steamData.platforms.linux && <span title="Linux">Linux</span>}
              </>
            ) : (
              <span>PC</span>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <h4 className="text-gray-400 text-[10px] xs:text-xs sm:text-xs md:text-sm mb-1 xs:mb-1.5 sm:mb-1.5 md:mb-2">
          {t.modal.tags}
        </h4>
        {loadingSteam ? (
          <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-1.5 md:gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 xs:h-5 sm:h-5 md:h-6 w-10 xs:w-12 sm:w-14 md:w-16 bg-gray-700 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-1.5 md:gap-2">
            {steamData?.categories?.length ? (
              steamData.categories.slice(0, 8).map((category, index) => (
                <span key={index} style={styles.sidebar.tag} className="bg-[#333] text-gray-300 rounded">
                  {category}
                </span>
              ))
            ) : (
              <>
                <span style={styles.sidebar.tag} className="bg-[#333] text-gray-300 rounded">
                  Action
                </span>
                <span style={styles.sidebar.tag} className="bg-[#333] text-gray-300 rounded">
                  Adventure
                </span>
                <span style={styles.sidebar.tag} className="bg-[#333] text-gray-300 rounded">
                  Open World
                </span>
                <span style={styles.sidebar.tag} className="bg-[#333] text-gray-300 rounded">
                  RPG
                </span>
                <span style={styles.sidebar.tag} className="bg-[#333] text-gray-300 rounded">
                  Story Rich
                </span>
                <span style={styles.sidebar.tag} className="bg-[#333] text-gray-300 rounded">
                  Multiplayer
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Languages */}
      <div>
        <h4 style={styles.sidebar.info} className="text-gray-400 mb-1.5 md:mb-2">
          {t.modal.languages}
        </h4>
        {loadingSteam ? (
          <div className="space-y-1.5 md:space-y-2">
            <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-full" />
            <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-2/3" />
          </div>
        ) : (
          <p style={styles.sidebar.info} className="text-gray-300">
            {steamData?.languages?.length
              ? steamData.languages.slice(0, 10).join(', ')
              : 'English, Spanish, French, German, Japanese, Korean, Chinese'}
          </p>
        )}
      </div>

      {/* Social */}
      <div>
        <h4 style={styles.sidebar.info} className="text-gray-400 mb-1.5 md:mb-2">
          {t.modal.share}
        </h4>
        <div style={styles.content.gap} className="flex flex-wrap">
          <button style={styles.sidebar.button} className="bg-[#333] hover:bg-[#444] text-white rounded transition-colors">
            {t.modal.discord}
          </button>
          <button style={styles.sidebar.button} className="bg-[#333] hover:bg-[#444] text-white rounded transition-colors">
            {t.modal.facebook}
          </button>
          <button style={styles.sidebar.button} className="bg-[#333] hover:bg-[#444] text-white rounded transition-colors">
            {t.modal.copyLink}
          </button>
        </div>
      </div>

      {/* Buy on Steam Widget */}
      {loadingSteam ? (
        <div className="flex justify-center mt-4 xs:mt-5 sm:mt-6 md:mt-8">
          <div className="w-full max-w-[646px] h-[150px] xs:h-[170px] sm:h-[180px] md:h-[190px] bg-gray-700 animate-pulse rounded-lg" />
        </div>
      ) : steamData ? (
        <div className="flex justify-center mt-4 xs:mt-5 sm:mt-6 md:mt-8 overflow-hidden">
          <iframe
            src={`https://store.steampowered.com/widget/${steamData.steam_appid}/?l=${getSteamLanguage(locale)}`}
            className="w-full max-w-[646px] scale-90 xs:scale-95 sm:scale-100"
            width="646"
            height="190"
            frameBorder="0"
          />
        </div>
      ) : null}
    </div>
  );
}

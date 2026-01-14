import { MapPinCheck } from 'lucide-react';
import Snowfall from 'react-snowfall';

type SteamData = {
  price: string | null;
  is_free: boolean;
  price_info: {
    currency: string;
    discount_percent: number;
    initial_formatted: string | null;
    final_formatted: string | null;
  } | null;
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
  styles: any;
  t: any;
};

export default function PriceCard({ loadingSteam, steamData, userLocation, styles, t }: Props) {
  if (loadingSteam) {
    return (
      <div
        style={styles.sidebar.priceCard}
        className="relative overflow-hidden bg-gradient-to-br from-gray-700/20 via-gray-600/10 to-gray-700/20 border border-gray-600/30"
      >
        <div className="flex items-center justify-between gap-2 xs:gap-3 sm:gap-4 md:gap-6 mb-2 xs:mb-3 sm:mb-3.5 md:mb-4">
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
            <div className="w-0.5 xs:w-0.5 sm:w-0.5 md:w-1 h-5 xs:h-6 sm:h-7 md:h-8 bg-gray-600 animate-pulse rounded-full"></div>
            <div className="h-2.5 xs:h-3 sm:h-3.5 md:h-4 w-10 xs:w-12 sm:w-14 md:w-16 bg-gray-600 animate-pulse rounded"></div>
          </div>
          <div className="h-5 xs:h-6 sm:h-7 md:h-8 w-16 xs:w-20 sm:w-22 md:w-24 bg-gray-600 animate-pulse rounded-full"></div>
        </div>
        <div className="h-7 xs:h-8 sm:h-9 md:h-10 w-20 xs:w-24 sm:w-28 md:w-32 bg-gray-600 animate-pulse rounded mb-1 xs:mb-1.5 sm:mb-1.5 md:mb-2"></div>
        <div className="h-2 xs:h-2.5 sm:h-2.5 md:h-3 w-14 xs:w-16 sm:w-18 md:w-20 bg-gray-600 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!steamData?.price) {
    return null;
  }

  return (
    <div
      style={styles.sidebar.priceCard}
      className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border border-green-400/30 backdrop-blur-sm"
    >
      <Snowfall
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent"></div>
      <div style={styles.content.gap} className="relative flex items-center justify-between">
        <div style={styles.content.gap} className="flex items-center">
          <div className="w-0.5 md:w-1 h-6 md:h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></div>
          <h4 style={styles.sidebar.priceTitle} className="text-gray-300 font-bold tracking-wider uppercase">
            {t.modal.price}
          </h4>
        </div>
        {userLocation && (
          <span
            style={styles.sidebar.priceTitle}
            className="flex items-center gap-1 md:gap-2 text-emerald-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-2 md:px-4 py-1 md:py-2 rounded-full border border-green-400/20 backdrop-blur-sm shadow-lg shadow-green-500/10"
          >
            <MapPinCheck className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
            <span className="font-medium hidden sm:inline">{userLocation.country}</span>
          </span>
        )}
      </div>

      {steamData.is_free ? (
        <div style={styles.sidebar.priceAmount} className="font-bold text-green-400 mt-2">
          {t.modal.free}
        </div>
      ) : steamData.price_info ? (
        <div>
          {steamData.price_info.discount_percent > 0 ? (
            <div className="mt-1.5 md:mt-2 space-y-1.5 md:space-y-2">
              <div style={styles.content.gap} className="flex items-center">
                <span
                  style={styles.sidebar.priceDiscount}
                  className="bg-green-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded font-bold"
                >
                  -{steamData.price_info.discount_percent}%
                </span>
                <span style={styles.text.sm} className="text-gray-400 line-through">
                  {steamData.price_info.initial_formatted}
                </span>
              </div>
              <div style={styles.sidebar.priceAmount} className="font-bold text-green-400">
                {steamData.price_info.final_formatted}
              </div>
            </div>
          ) : (
            <div style={styles.sidebar.priceAmount} className="font-bold text-white mt-2">
              {steamData.price_info.final_formatted || steamData.price}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xl md:text-2xl font-bold text-white mt-2">{steamData.price}</div>
      )}

      {steamData.price_info && (
        <p style={styles.sidebar.priceTitle} className="text-gray-400 mt-1.5 md:mt-2">
          {t.modal.priceIn} {steamData.price_info.currency}
        </p>
      )}
    </div>
  );
}

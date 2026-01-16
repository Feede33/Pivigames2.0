type SteamData = {
  metacritic: number | null;
  release_year: number | null;
  required_age: number;
};

type Props = {
  loadingSteam: boolean;
  steamData: SteamData | null;
  steamError: string | null;
  gameRating: number;
  gameYear?: number;
  styles: any;
  t: any;
};

export default function InfoBadges({ loadingSteam, steamData, steamError, gameRating, gameYear, styles, t }: Props) {
  return (
    <div style={{ ...styles.content.gap, ...styles.content.spacing }} className="flex items-center flex-wrap">
      {loadingSteam ? (
        <>
          <div className="h-5 w-20 bg-gray-700 animate-pulse rounded" />
          <div className="h-4 w-12 bg-gray-700 animate-pulse rounded" />
          <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
          <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
          <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
        </>
      ) : (
        <>
          <span className="text-green-500 font-bold text-sm md:text-[15px]">
            {steamData?.metacritic 
              ? `${steamData.metacritic}% Rating` 
              : gameRating > 0 
                ? `${Math.round(gameRating * 10)}% Rating` 
                : 'N/A'}
          </span>
          <span className="text-gray-400 text-xs md:text-sm">
            {steamData?.release_year || gameYear || new Date().getFullYear()}
          </span>
          <span className="border border-gray-500 px-1 md:px-1.5 py-0.5 text-[10px] md:text-xs text-gray-300">
            {steamData?.required_age ? `${steamData.required_age}+` : '13+'}
          </span>
          <span className="border border-gray-500 px-1 md:px-1.5 py-0.5 text-[10px] md:text-xs text-gray-300">HD</span>
          <span className="border border-gray-500 px-1 md:px-1.5 py-0.5 text-[10px] md:text-xs text-gray-300">5.1</span>
          {steamError && (
            <span className="text-yellow-500 text-[10px] md:text-xs ml-2" title={steamError}>
              ⚠ {t.modal.limitedInfo || 'Info limitada'}
            </span>
          )}
        </>
      )}
    </div>
  );
}

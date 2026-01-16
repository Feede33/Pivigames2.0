import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function NoSteamGamesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export function LocaleUpdater() {
  const params = useParams();
  const locale = params?.locale as string;

  useEffect(() => {
    if (locale && typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}

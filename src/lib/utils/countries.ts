import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { useLocale } from 'next-intl';

countries.registerLocale(en);

export const alpha3ToAlpha2 = (code: string) => {
  if (!code) return '';

  try {
    const upperCode = code.toUpperCase();
    const result = countries.alpha3ToAlpha2(upperCode);

    const specialCases: Record<string, string> = {
      ENG: 'GB',
      SCO: 'GB',
      WAL: 'GB',
      NIR: 'GB',
      XKX: 'XK',
      TWN: 'TW',
      HKG: 'HK',
      MAC: 'MO',
      GER: 'DE',
      FIJ: 'FJ',
      BAH: 'BH',
      RSA: 'RS',
      TPE: 'TW',
      PAR: 'PY',
      MAS: 'MY',
      PUR: 'PR',
      NED: 'NL',
      DEN: 'DK',
      ZIM: 'ZW',
      UAE: 'AE',
      SUI: 'CH',
      CHI: 'CL',
      POR: 'PT',
    };

    if (specialCases[upperCode]) {
      return specialCases[upperCode];
    }

    return result || null;
  } catch (error) {
    console.warn(`Failed to convert country code: ${code}`, error);
    return null;
  }
};

export const useGetCountryName = () => {
  const e = useLocale();
  const getCountryName = (code: string) => {
    const v = alpha3ToAlpha2(code) as string;
    return countries.getName(v, e) || v;
  };

  return { getCountryName };
};

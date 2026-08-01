import type { CityDef } from '@/lib/types';

/**
 * Cities the feed can be read through.
 *
 * `geo` is the code Google Trends actually accepts, and `geoLevel` says how
 * precise that code is — because Trends does not report every city. Berlin,
 * Hamburg and Vienna are federal states or city-states, so a real city-level
 * code exists; Munich is only reportable as Bavaria, and for a few countries the
 * finest available breakdown is the country itself. The app states which one it
 * is rather than implying every reading is city-level.
 *
 * `geoName` is the name of that Trends region when it is not the city itself, so
 * the disclosure can read "Munich maps to Bavaria (DE-BY)".
 */
export const CITIES: CityDef[] = [
  // Germany
  {
    id: 'berlin',
    name: 'Berlin',
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-BE',
    geoLevel: 'city',
  },
  {
    id: 'hamburg',
    name: 'Hamburg',
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-HH',
    geoLevel: 'city',
  },
  {
    id: 'bremen',
    name: 'Bremen',
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-HB',
    geoLevel: 'city',
  },
  {
    id: 'munich',
    name: 'Munich',
    aliases: ['München', 'Muenchen'],
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-BY',
    geoLevel: 'region',
    geoName: 'Bavaria',
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-HE',
    geoLevel: 'region',
    geoName: 'Hesse',
  },
  {
    id: 'cologne',
    name: 'Cologne',
    aliases: ['Köln', 'Koeln'],
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-NW',
    geoLevel: 'region',
    geoName: 'North Rhine-Westphalia',
  },
  {
    id: 'dusseldorf',
    name: 'Düsseldorf',
    aliases: ['Dusseldorf'],
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-NW',
    geoLevel: 'region',
    geoName: 'North Rhine-Westphalia',
  },
  {
    id: 'stuttgart',
    name: 'Stuttgart',
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-BW',
    geoLevel: 'region',
    geoName: 'Baden-Württemberg',
  },
  {
    id: 'leipzig',
    name: 'Leipzig',
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-SN',
    geoLevel: 'region',
    geoName: 'Saxony',
  },
  {
    id: 'dresden',
    name: 'Dresden',
    countryName: 'Germany',
    countryCode: 'DE',
    geo: 'DE-SN',
    geoLevel: 'region',
    geoName: 'Saxony',
  },

  // Rest of Europe
  {
    id: 'vienna',
    name: 'Vienna',
    aliases: ['Wien'],
    countryName: 'Austria',
    countryCode: 'AT',
    geo: 'AT-9',
    geoLevel: 'city',
  },
  {
    id: 'zurich',
    name: 'Zürich',
    aliases: ['Zurich'],
    countryName: 'Switzerland',
    countryCode: 'CH',
    geo: 'CH-ZH',
    geoLevel: 'region',
    geoName: 'Canton of Zürich',
  },
  {
    id: 'geneva',
    name: 'Geneva',
    aliases: ['Genève', 'Genf'],
    countryName: 'Switzerland',
    countryCode: 'CH',
    geo: 'CH-GE',
    geoLevel: 'region',
    geoName: 'Canton of Geneva',
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    countryName: 'Netherlands',
    countryCode: 'NL',
    geo: 'NL-NH',
    geoLevel: 'region',
    geoName: 'North Holland',
  },
  {
    id: 'rotterdam',
    name: 'Rotterdam',
    countryName: 'Netherlands',
    countryCode: 'NL',
    geo: 'NL-ZH',
    geoLevel: 'region',
    geoName: 'South Holland',
  },
  {
    id: 'brussels',
    name: 'Brussels',
    aliases: ['Bruxelles', 'Brussel'],
    countryName: 'Belgium',
    countryCode: 'BE',
    geo: 'BE-BRU',
    geoLevel: 'city',
  },
  {
    id: 'paris',
    name: 'Paris',
    countryName: 'France',
    countryCode: 'FR',
    geo: 'FR-IDF',
    geoLevel: 'region',
    geoName: 'Île-de-France',
  },
  {
    id: 'lyon',
    name: 'Lyon',
    countryName: 'France',
    countryCode: 'FR',
    geo: 'FR-ARA',
    geoLevel: 'region',
    geoName: 'Auvergne-Rhône-Alpes',
  },
  {
    id: 'marseille',
    name: 'Marseille',
    countryName: 'France',
    countryCode: 'FR',
    geo: 'FR-PAC',
    geoLevel: 'region',
    geoName: "Provence-Alpes-Côte d'Azur",
  },
  {
    id: 'london',
    name: 'London',
    countryName: 'United Kingdom',
    countryCode: 'GB',
    geo: 'GB-ENG',
    geoLevel: 'region',
    geoName: 'England',
  },
  {
    id: 'manchester',
    name: 'Manchester',
    countryName: 'United Kingdom',
    countryCode: 'GB',
    geo: 'GB-ENG',
    geoLevel: 'region',
    geoName: 'England',
  },
  {
    id: 'edinburgh',
    name: 'Edinburgh',
    countryName: 'United Kingdom',
    countryCode: 'GB',
    geo: 'GB-SCT',
    geoLevel: 'region',
    geoName: 'Scotland',
  },
  {
    id: 'dublin',
    name: 'Dublin',
    countryName: 'Ireland',
    countryCode: 'IE',
    geo: 'IE',
    geoLevel: 'country',
    geoName: 'Ireland',
  },
  {
    id: 'madrid',
    name: 'Madrid',
    countryName: 'Spain',
    countryCode: 'ES',
    geo: 'ES-MD',
    geoLevel: 'region',
    geoName: 'Community of Madrid',
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    countryName: 'Spain',
    countryCode: 'ES',
    geo: 'ES-CT',
    geoLevel: 'region',
    geoName: 'Catalonia',
  },
  {
    id: 'valencia',
    name: 'Valencia',
    countryName: 'Spain',
    countryCode: 'ES',
    geo: 'ES-VC',
    geoLevel: 'region',
    geoName: 'Valencian Community',
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    aliases: ['Lisboa'],
    countryName: 'Portugal',
    countryCode: 'PT',
    geo: 'PT-11',
    geoLevel: 'region',
    geoName: 'Lisbon District',
  },
  {
    id: 'porto',
    name: 'Porto',
    aliases: ['Oporto'],
    countryName: 'Portugal',
    countryCode: 'PT',
    geo: 'PT-13',
    geoLevel: 'region',
    geoName: 'Porto District',
  },
  {
    id: 'milan',
    name: 'Milan',
    aliases: ['Milano'],
    countryName: 'Italy',
    countryCode: 'IT',
    geo: 'IT-25',
    geoLevel: 'region',
    geoName: 'Lombardy',
  },
  {
    id: 'rome',
    name: 'Rome',
    aliases: ['Roma'],
    countryName: 'Italy',
    countryCode: 'IT',
    geo: 'IT-62',
    geoLevel: 'region',
    geoName: 'Lazio',
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    countryName: 'Sweden',
    countryCode: 'SE',
    geo: 'SE-AB',
    geoLevel: 'region',
    geoName: 'Stockholm County',
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    aliases: ['København', 'Kobenhavn'],
    countryName: 'Denmark',
    countryCode: 'DK',
    geo: 'DK-84',
    geoLevel: 'region',
    geoName: 'Capital Region',
  },
  {
    id: 'oslo',
    name: 'Oslo',
    countryName: 'Norway',
    countryCode: 'NO',
    geo: 'NO-03',
    geoLevel: 'city',
  },
  {
    id: 'helsinki',
    name: 'Helsinki',
    countryName: 'Finland',
    countryCode: 'FI',
    geo: 'FI-18',
    geoLevel: 'region',
    geoName: 'Uusimaa',
  },
  {
    id: 'warsaw',
    name: 'Warsaw',
    aliases: ['Warszawa'],
    countryName: 'Poland',
    countryCode: 'PL',
    geo: 'PL',
    geoLevel: 'country',
    geoName: 'Poland',
  },
  {
    id: 'krakow',
    name: 'Kraków',
    aliases: ['Krakow', 'Cracow'],
    countryName: 'Poland',
    countryCode: 'PL',
    geo: 'PL',
    geoLevel: 'country',
    geoName: 'Poland',
  },
  {
    id: 'prague',
    name: 'Prague',
    aliases: ['Praha'],
    countryName: 'Czechia',
    countryCode: 'CZ',
    geo: 'CZ',
    geoLevel: 'country',
    geoName: 'Czechia',
  },
  {
    id: 'budapest',
    name: 'Budapest',
    countryName: 'Hungary',
    countryCode: 'HU',
    geo: 'HU',
    geoLevel: 'country',
    geoName: 'Hungary',
  },
  {
    id: 'bucharest',
    name: 'Bucharest',
    aliases: ['București'],
    countryName: 'Romania',
    countryCode: 'RO',
    geo: 'RO',
    geoLevel: 'country',
    geoName: 'Romania',
  },
  {
    id: 'athens',
    name: 'Athens',
    aliases: ['Athina'],
    countryName: 'Greece',
    countryCode: 'GR',
    geo: 'GR',
    geoLevel: 'country',
    geoName: 'Greece',
  },
  {
    id: 'sofia',
    name: 'Sofia',
    countryName: 'Bulgaria',
    countryCode: 'BG',
    geo: 'BG',
    geoLevel: 'country',
    geoName: 'Bulgaria',
  },
  {
    id: 'tallinn',
    name: 'Tallinn',
    countryName: 'Estonia',
    countryCode: 'EE',
    geo: 'EE',
    geoLevel: 'country',
    geoName: 'Estonia',
  },
  {
    id: 'vilnius',
    name: 'Vilnius',
    countryName: 'Lithuania',
    countryCode: 'LT',
    geo: 'LT',
    geoLevel: 'country',
    geoName: 'Lithuania',
  },
  {
    id: 'ljubljana',
    name: 'Ljubljana',
    countryName: 'Slovenia',
    countryCode: 'SI',
    geo: 'SI',
    geoLevel: 'country',
    geoName: 'Slovenia',
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    aliases: ['İstanbul'],
    countryName: 'Türkiye',
    countryCode: 'TR',
    geo: 'TR-34',
    geoLevel: 'region',
    geoName: 'Istanbul Province',
  },

  // Americas
  {
    id: 'new-york',
    name: 'New York',
    aliases: ['NYC', 'New York City'],
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-NY',
    geoLevel: 'region',
    geoName: 'New York State',
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    aliases: ['SF', 'Bay Area'],
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-CA',
    geoLevel: 'region',
    geoName: 'California',
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    aliases: ['LA'],
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-CA',
    geoLevel: 'region',
    geoName: 'California',
  },
  {
    id: 'seattle',
    name: 'Seattle',
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-WA',
    geoLevel: 'region',
    geoName: 'Washington State',
  },
  {
    id: 'austin',
    name: 'Austin',
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-TX',
    geoLevel: 'region',
    geoName: 'Texas',
  },
  {
    id: 'chicago',
    name: 'Chicago',
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-IL',
    geoLevel: 'region',
    geoName: 'Illinois',
  },
  {
    id: 'boston',
    name: 'Boston',
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-MA',
    geoLevel: 'region',
    geoName: 'Massachusetts',
  },
  {
    id: 'miami',
    name: 'Miami',
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-FL',
    geoLevel: 'region',
    geoName: 'Florida',
  },
  {
    id: 'denver',
    name: 'Denver',
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-CO',
    geoLevel: 'region',
    geoName: 'Colorado',
  },
  {
    id: 'washington-dc',
    name: 'Washington, D.C.',
    aliases: ['DC', 'Washington'],
    countryName: 'United States',
    countryCode: 'US',
    geo: 'US-DC',
    geoLevel: 'city',
  },
  {
    id: 'toronto',
    name: 'Toronto',
    countryName: 'Canada',
    countryCode: 'CA',
    geo: 'CA-ON',
    geoLevel: 'region',
    geoName: 'Ontario',
  },
  {
    id: 'montreal',
    name: 'Montréal',
    aliases: ['Montreal'],
    countryName: 'Canada',
    countryCode: 'CA',
    geo: 'CA-QC',
    geoLevel: 'region',
    geoName: 'Quebec',
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    countryName: 'Canada',
    countryCode: 'CA',
    geo: 'CA-BC',
    geoLevel: 'region',
    geoName: 'British Columbia',
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    aliases: ['CDMX', 'Ciudad de México'],
    countryName: 'Mexico',
    countryCode: 'MX',
    geo: 'MX-CMX',
    geoLevel: 'city',
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    aliases: ['Sao Paulo'],
    countryName: 'Brazil',
    countryCode: 'BR',
    geo: 'BR-SP',
    geoLevel: 'region',
    geoName: 'São Paulo State',
  },
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    aliases: ['Rio'],
    countryName: 'Brazil',
    countryCode: 'BR',
    geo: 'BR-RJ',
    geoLevel: 'region',
    geoName: 'Rio de Janeiro State',
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    countryName: 'Argentina',
    countryCode: 'AR',
    geo: 'AR-C',
    geoLevel: 'city',
  },
  {
    id: 'bogota',
    name: 'Bogotá',
    aliases: ['Bogota'],
    countryName: 'Colombia',
    countryCode: 'CO',
    geo: 'CO-DC',
    geoLevel: 'city',
  },
  {
    id: 'santiago',
    name: 'Santiago',
    countryName: 'Chile',
    countryCode: 'CL',
    geo: 'CL-RM',
    geoLevel: 'region',
    geoName: 'Santiago Metropolitan',
  },

  // Asia, Middle East, Africa, Oceania
  {
    id: 'singapore',
    name: 'Singapore',
    countryName: 'Singapore',
    countryCode: 'SG',
    geo: 'SG',
    geoLevel: 'city',
  },
  {
    id: 'hong-kong',
    name: 'Hong Kong',
    countryName: 'Hong Kong',
    countryCode: 'HK',
    geo: 'HK',
    geoLevel: 'city',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    aliases: ['Tokio'],
    countryName: 'Japan',
    countryCode: 'JP',
    geo: 'JP-13',
    geoLevel: 'city',
  },
  {
    id: 'osaka',
    name: 'Osaka',
    countryName: 'Japan',
    countryCode: 'JP',
    geo: 'JP-27',
    geoLevel: 'region',
    geoName: 'Osaka Prefecture',
  },
  {
    id: 'seoul',
    name: 'Seoul',
    countryName: 'South Korea',
    countryCode: 'KR',
    geo: 'KR-11',
    geoLevel: 'city',
  },
  {
    id: 'taipei',
    name: 'Taipei',
    countryName: 'Taiwan',
    countryCode: 'TW',
    geo: 'TW',
    geoLevel: 'country',
    geoName: 'Taiwan',
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    countryName: 'Thailand',
    countryCode: 'TH',
    geo: 'TH',
    geoLevel: 'country',
    geoName: 'Thailand',
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    countryName: 'Indonesia',
    countryCode: 'ID',
    geo: 'ID-JK',
    geoLevel: 'city',
  },
  {
    id: 'manila',
    name: 'Manila',
    countryName: 'Philippines',
    countryCode: 'PH',
    geo: 'PH',
    geoLevel: 'country',
    geoName: 'Philippines',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    aliases: ['Bombay'],
    countryName: 'India',
    countryCode: 'IN',
    geo: 'IN-MH',
    geoLevel: 'region',
    geoName: 'Maharashtra',
  },
  {
    id: 'bangalore',
    name: 'Bangalore',
    aliases: ['Bengaluru'],
    countryName: 'India',
    countryCode: 'IN',
    geo: 'IN-KA',
    geoLevel: 'region',
    geoName: 'Karnataka',
  },
  {
    id: 'delhi',
    name: 'Delhi',
    aliases: ['New Delhi'],
    countryName: 'India',
    countryCode: 'IN',
    geo: 'IN-DL',
    geoLevel: 'city',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    geo: 'AE-DU',
    geoLevel: 'region',
    geoName: 'Dubai Emirate',
  },
  {
    id: 'tel-aviv',
    name: 'Tel Aviv',
    countryName: 'Israel',
    countryCode: 'IL',
    geo: 'IL-TA',
    geoLevel: 'region',
    geoName: 'Tel Aviv District',
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    countryName: 'South Africa',
    countryCode: 'ZA',
    geo: 'ZA-WC',
    geoLevel: 'region',
    geoName: 'Western Cape',
  },
  {
    id: 'lagos',
    name: 'Lagos',
    countryName: 'Nigeria',
    countryCode: 'NG',
    geo: 'NG-LA',
    geoLevel: 'region',
    geoName: 'Lagos State',
  },
  {
    id: 'nairobi',
    name: 'Nairobi',
    countryName: 'Kenya',
    countryCode: 'KE',
    geo: 'KE',
    geoLevel: 'country',
    geoName: 'Kenya',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    countryName: 'Australia',
    countryCode: 'AU',
    geo: 'AU-NSW',
    geoLevel: 'region',
    geoName: 'New South Wales',
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    countryName: 'Australia',
    countryCode: 'AU',
    geo: 'AU-VIC',
    geoLevel: 'region',
    geoName: 'Victoria',
  },
  {
    id: 'brisbane',
    name: 'Brisbane',
    countryName: 'Australia',
    countryCode: 'AU',
    geo: 'AU-QLD',
    geoLevel: 'region',
    geoName: 'Queensland',
  },
  {
    id: 'auckland',
    name: 'Auckland',
    countryName: 'New Zealand',
    countryCode: 'NZ',
    geo: 'NZ-AUK',
    geoLevel: 'region',
    geoName: 'Auckland Region',
  },
];

/** The city the feed opens on. Berlin, because that is where the data was gathered. */
export const DEFAULT_CITY: CityDef = CITIES[0];

/** Shown before the user types anything: cities a solo builder is likely to be in. */
export const SUGGESTED_CITY_IDS = [
  'berlin',
  'london',
  'lisbon',
  'amsterdam',
  'barcelona',
  'paris',
  'new-york',
  'san-francisco',
  'munich',
  'vienna',
  'warsaw',
  'bangalore',
];

const COUNTRY_NAMES: Record<string, string> = CITIES.reduce<Record<string, string>>((acc, city) => {
  if (city.countryCode && !acc[city.countryCode]) acc[city.countryCode] = city.countryName;
  return acc;
}, {});

export function countryNameOf(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

/**
 * Diacritics are folded by hand rather than with `normalize`, which is not
 * dependable across the JS engines this app runs on. Typing "munchen", "München"
 * or "Munich" all have to find the same row.
 */
const FOLD: Record<string, string> = {
  á: 'a',
  à: 'a',
  â: 'a',
  ä: 'a',
  ã: 'a',
  å: 'a',
  ç: 'c',
  é: 'e',
  è: 'e',
  ê: 'e',
  ë: 'e',
  í: 'i',
  ì: 'i',
  î: 'i',
  ï: 'i',
  ı: 'i',
  ñ: 'n',
  ó: 'o',
  ò: 'o',
  ô: 'o',
  ö: 'o',
  õ: 'o',
  ø: 'o',
  ú: 'u',
  ù: 'u',
  û: 'u',
  ü: 'u',
  ý: 'y',
  ÿ: 'y',
  ß: 'ss',
  ș: 's',
  ş: 's',
  ț: 't',
};

export function fold(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((char) => FOLD[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function findCity(id: string): CityDef | undefined {
  return CITIES.find((city) => city.id === id);
}

/** Prefers the catalog entry over a stored copy, so code updates reach old state. */
export function resolveCity(stored: CityDef): CityDef {
  return findCity(stored.id) ?? stored;
}

function haystack(city: CityDef): string[] {
  return [city.name, ...(city.aliases ?? []), city.countryName].map(fold);
}

/**
 * Ranked matches for what the user typed. Name and alias prefixes win, then any
 * substring, then the country name — so "germany" lists German cities.
 */
export function searchCities(query: string, limit = 10): CityDef[] {
  const needle = fold(query);
  if (needle.length === 0) return [];

  const scored: { city: CityDef; score: number }[] = [];

  for (const city of CITIES) {
    const fields = haystack(city);
    const names = fields.slice(0, fields.length - 1);
    const country = fields[fields.length - 1];

    let score = 0;
    if (names.some((field) => field === needle)) score = 5;
    else if (names.some((field) => field.startsWith(needle))) score = 4;
    else if (names.some((field) => field.includes(needle))) score = 3;
    else if (country.startsWith(needle)) score = 2;
    else if (country.includes(needle)) score = 1;

    if (score > 0) scored.push({ city, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name))
    .slice(0, limit)
    .map((entry) => entry.city);
}

/**
 * A city the catalog does not know. Trends needs a region code, so a custom
 * entry has none: the curve is modelled and source links open worldwide. That is
 * stated in the UI instead of being papered over with a guessed geo code.
 */
export function customCity(name: string): CityDef {
  const label = name.trim().replace(/\s+/g, ' ');
  return {
    id: `custom:${fold(label).replace(/\s+/g, '-')}`,
    name: label,
    countryName: '',
    countryCode: '',
    geo: '',
    geoLevel: 'world',
    custom: true,
  };
}

export function isCustomCity(city: CityDef): boolean {
  return city.custom === true;
}

export interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  countryCode: string;
  coordinates?: { latitude: number; longitude: number };
  aliases?: string[];
  isBase?: boolean;
}

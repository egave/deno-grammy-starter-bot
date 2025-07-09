import { DEFAULTS } from '../config.ts'

export function convertToLocalTime(utcDateString: string, 
    returnAsDate: boolean = false, 
    languageTag: string = DEFAULTS.CONFIG.LANGUAGE.LANGUAGE_TAG, 
    timezone: string = DEFAULTS.CONFIG.LANGUAGE.TIMEZONE): string | Date {
    // Convert the stored UTC string to a Date object
    const utcDate = new Date(utcDateString);

    // Convert to local time as a formatted string
    const options = { ...localeOptions_ymd_hm, timeZone: timezone };
    const localTimeString = utcDate.toLocaleString(languageTag, options);

    if (returnAsDate) {
        // Extract day, month, year, hours, minutes, seconds
        const [day, month, year, hour, minute, second] = localTimeString
            .replace(/[\u202F\u00A0]/g, '') // Remove non-breaking spaces
            .match(/\d+/g)!.map(Number);

        // Return as a Date object in Paris time
        return new Date(year, month - 1, day, hour, minute, second);
    }

    // Return as a formatted Paris time string
    return localTimeString;
}

export function nowUTC(): string {
    const now = new Date();
    return now.toISOString();
}

export function formatToISOString(
    year: number,
    numericMonth: number, // 0-indexed (JS Date style)
    tripDepartureDay: string | number,
    tripDepartureHour: string | number,
    tripDepartureMinute: string | number
): string {
    // Convert inputs to numbers and pad with leading zeros where needed
    const month = String(numericMonth + 1).padStart(2, '0'); // 1-indexed for ISO
    const day = String(parseInt(String(tripDepartureDay))).padStart(2, '0');
    const hour = String(parseInt(String(tripDepartureHour))).padStart(2, '0');
    const minute = String(parseInt(String(tripDepartureMinute))).padStart(2, '0');

    // Construct ISO string
    return `${year}-${month}-${day}T${hour}:${minute}:00.000Z`;
}

export function formatDateKeys(date: Date): { yyyy: string; yyyymm: string; yyyymmdd: string } {
    const yyyy = date.getFullYear().toString();
    const yyyymm = `${yyyy}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const yyyymmdd = `${yyyymm}${date.getDate().toString().padStart(2, '0')}`;

    return { yyyy, yyyymm, yyyymmdd };
}

// Formatting date for trip startDateTime
// In this case we use timeZone: 'UTC' because we stored the date in UTC
// and want to display this date without timezone conversions 
export const tripDateFormat = new Intl.DateTimeFormat(DEFAULTS.CONFIG.LANGUAGE.LANGUAGE_TAG, {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC', // MUST BE 'UTC' for accurate display of 'startDateTime' field
});

// Formatting date for booking object
export const bookingDateFormat = new Intl.DateTimeFormat(DEFAULTS.CONFIG.LANGUAGE.LANGUAGE_TAG, {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: DEFAULTS.CONFIG.LANGUAGE.TIMEZONE
});

// Formatting date for banned object
export const bannedDateFormat = new Intl.DateTimeFormat(DEFAULTS.CONFIG.LANGUAGE.LANGUAGE_TAG, {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: DEFAULTS.CONFIG.LANGUAGE.TIMEZONE
});

export const localeOptions_ymd: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: DEFAULTS.CONFIG.LANGUAGE.TIMEZONE
  };

// Request a weekday along with a long date
export const localeOptions_ymd_hm: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: DEFAULTS.CONFIG.LANGUAGE.TIMEZONE, // Assurez-vous d'utiliser le bon fuseau horaire
  };

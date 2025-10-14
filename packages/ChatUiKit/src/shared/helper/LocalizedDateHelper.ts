import { Language } from "../resources/CometChatLocalizeNew/type";
import { getCometChatTranslation } from "../resources/CometChatLocalizeNew/LocalizationManager";
import dayjs from 'dayjs';
import 'dayjs/locale/en';      // English
import 'dayjs/locale/hi';      // Hindi
import 'dayjs/locale/ja';      // Japanese
import 'dayjs/locale/ko';      // Korean
import 'dayjs/locale/ru';      // Russian
import 'dayjs/locale/pt';      // Portuguese
import 'dayjs/locale/es';      // Spanish
import 'dayjs/locale/fr';      // French
import 'dayjs/locale/de';      // German
import 'dayjs/locale/it';      // Italian
import 'dayjs/locale/tr';      // Turkish
import 'dayjs/locale/zh';      // Chinese (Simplified)
import 'dayjs/locale/zh-tw';   // Chinese (Traditional)
import 'dayjs/locale/ms';      // Malay
import 'dayjs/locale/sv';      // Swedish
import 'dayjs/locale/lt';      // Lithuanian
import 'dayjs/locale/hu';      // Hungarian
import 'dayjs/locale/nl';      // Dutch
// Import other languages as needed

// Dayjs plugins
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
// Initialize plugins
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
import * as RNLocalize from 'react-native-localize';

const t = getCometChatTranslation();

export class LocalizedDateHelper {
    public static patterns = {
        timeFormat: "timeFormat",
        dayDateFormat: "dayDateFormat",
        dayWeekDayDateFormat: "dayWeekDayDateFormat",
        dayWeekDayDateTimeFormat: "dayWeekDayDateTimeFormat",
        dayDateTimeFormat: "dayDateTimeFormat",
        callBubble: "callBubble",
        callLogs: "callLogs",
        relativeMinutes: "relativeMinutes",
        conversationDate: "conversationDate",
    } as const;

    /**
     * Maps language codes to full locale codes and numeral systems
     */
    public getLocaleConfig(locale: Language): { localeCode: string, dateFormattingLocale: string, dayJsLocale: string } {
        // Map language codes to full locale codes
        const localeMap: Record<string, string> = {
            'en': 'en',  
            'en-IN': 'en',      // English (India)
            'en-US': 'en-US',      // English (United States)
            'en-GB': 'en-GB',   // English (United Kingdom)
            'nl': 'nl-NL',      // Dutch
            'fr': 'fr-FR',      // French
            'de': 'de-DE',      // German
            'hi': 'hi-IN',      // Hindi
            'it': 'it-IT',      // Italian
            'ja': 'ja-JP',      // Japanese
            'ko': 'ko-KR',      // Korean
            'pt': 'pt-PT',      // Portuguese
            'ru': 'ru-RU',      // Russian
            'es': 'es-ES',      // Spanish
            'tr': 'tr-TR',      // Turkish
            'zh': 'zh-CN',      // Chinese (Simplified)
            'zh-tw': 'zh-TW',   // Chinese (Traditional)
            'ms': 'ms-MY',      // Malay
            'sv': 'sv-SE',      // Swedish
            'lt': 'lt-LT',      // Lithuanian
            'hu': 'hu-HU',      // Hungarian
        };

        // Map to dayjs locale codes (usually simpler than full locale codes)
        const dayJsLocaleMap: Record<string, string> = {
            'en-IN': 'en',
            'en-GB': 'en-gb',
            'zh-tw': 'zh-tw',
            // Most other languages use their basic code in dayjs
        };

        return {
            localeCode: localeMap[locale] || locale,
            dateFormattingLocale: LocalizedDateHelper.getFullLocaleForDateFormatting(locale),
            dayJsLocale: dayJsLocaleMap[locale] || locale
        };
    }

    /**
    * Check if the locale prefers 12-hour clock format
    */

    private shouldUse12HourClock(locale: Language): boolean {
    const twelveHourLocales = [
        'en-US', 'en-GB', 'en',
        'hi-IN', 'hi',
        'ms-MY', 'ms'
    ];

    const { localeCode, dayJsLocale } = this.getLocaleConfig(locale);

    if (twelveHourLocales.includes(localeCode)) {
        return true;
    }

    const isKnownToDayjs =
        Boolean(dayjs.Ls[dayJsLocale]) || Boolean(dayjs.Ls[localeCode]);

    if (!isKnownToDayjs) {
        return true;
    }
    return false;
}


    /**
 * Format time using dayjs
 */
    private formatTime(date: Date, locale: Language): string {
        const { dayJsLocale } = this.getLocaleConfig(locale);

        // Apply locale to Day.js
        dayjs.locale(dayJsLocale);

        // Decide between 12-hour and 24-hour
        const use12Hour = this.shouldUse12HourClock(locale);

        // Build format string
        const formatString = use12Hour ? "h:mm A" : "HH:mm";

        // Return formatted time (with localized AM/PM if available in locale)
        return dayjs(date).format(formatString);
   } 

    /**
 * Gets the full locale tag needed for date formatting
 * This extends simple language codes to include region information
 */
    public static getFullLocaleForDateFormatting(language: Language): string {
        // If we have a language that includes region (like en-US), use it directly
        if (language.includes('-')) {
            return language;
        }

        // DEFAULT MAPPINGS - Always use these explicit mappings instead of device detection
        const defaultRegionMap: Record<string, string> = {
            'en': 'en-IN',   // Default English to IN format (DD/MM/YYYY)
            'en-IN': 'en-IN',
            'en-US': 'en-US',
            'en-GB': 'en-GB',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'pt': 'pt-BR',
            'it': 'it-IT',
            'ru': 'ru-RU',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'hi': 'hi-IN',
            'ms': 'ms-MY',
            'sv': 'sv-SE',
            'lt': 'lt-LT',
            'hu': 'hu-HU',
        };

        // Return the mapped region or construct a default one
        return defaultRegionMap[language] || `${language}-${language.toUpperCase()}`;
    }
    /**
 * Format date specifically for conversation list
 */ 
    private formatConversationDate(date: Date, locale: Language): string {
        const { dateFormattingLocale, dayJsLocale } = this.getLocaleConfig(locale);

        // Set dayjs locale for weekday names
        dayjs.locale(dayJsLocale);

        const now = dayjs();
        const messageDate = dayjs(date);
        const startOfToday = now.startOf('day');

        // Today - show just the time with AM/PM (maintain existing behavior)
        if (messageDate.isAfter(startOfToday)) {
            return this.formatTime(date, locale);
        }

        // Yesterday (maintain existing behavior)
        if (messageDate.isAfter(startOfToday.subtract(1, 'day'))) {
            return t("YESTERDAY");
        }


        // For dates older than current week, use locale-appropriate date format
        try {
            // Use Intl.DateTimeFormat with the full locale tag for proper date formatting
            const options: Intl.DateTimeFormatOptions = {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric' 
            };

            const formatter = new Intl.DateTimeFormat(dateFormattingLocale, options);
            const formattedDate = formatter.format(date);

            return formattedDate
              
              
        } catch (error) {
            console.warn('Error formatting date with Intl.DateTimeFormat:', error);
            return ""
        }
    }

    /**
     * Format date for date separators (more detailed than conversation list)
     */
    private formatDateSeparator(date: Date, locale: Language): string {
        const { dayJsLocale } = this.getLocaleConfig(locale);

        // Set dayjs locale
        dayjs.locale(dayJsLocale);

        const now = dayjs();
        const messageDate = dayjs(date);
        const startOfToday = now.startOf('day');

        // Today
        if (messageDate.isAfter(startOfToday)) {
            return t("TODAY");
        }

        // Yesterday
        if (messageDate.isAfter(startOfToday.subtract(1, 'day'))) {
            return t("YESTERDAY");
        }

        // Within current week (show weekday)
        if (messageDate.isAfter(startOfToday.subtract(6, 'day'))) {
            // Use dayjs for weekday name
            return messageDate.format('dddd'); 
        }

        // Older messages, show full date
        const formattedDate = messageDate.format('D MMM, YYYY');
        return formattedDate
    }

    /**
     * Format date and time together
     */
    private formatDateTimeWithSeparator(date: Date, locale: Language): string {
        const { dayJsLocale } = this.getLocaleConfig(locale);

        // Set dayjs locale
        dayjs.locale(dayJsLocale);

        const now = dayjs();
        const messageDate = dayjs(date);
        const startOfToday = now.startOf('day');
        const time = this.formatTime(date, locale);

        // Today
        if (messageDate.isAfter(startOfToday)) {
            return `${t("TODAY")} ${time}`;
        }

        // Yesterday
        if (messageDate.isAfter(startOfToday.subtract(1, 'day'))) {
            return `${t("YESTERDAY")} ${time}`;
        }

        // Within current week
        if (messageDate.isAfter(startOfToday.subtract(6, 'day'))) {
            return `${messageDate.format('dddd')} ${time}`;
        }

        // Older messages
        const formattedDate = messageDate.format('D MMM, YYYY');
        return `${formattedDate} ${time}`;
    }

    /**
     * Public method to get formatted date according to pattern
     */
    getFormattedDate(timestamp: number, pattern: string, locale: Language = "en"): string {
        const date = new Date(timestamp);

        switch (pattern) {
            case LocalizedDateHelper.patterns.timeFormat:
                return this.formatTime(date, locale);
            case LocalizedDateHelper.patterns.dayDateFormat:
            case LocalizedDateHelper.patterns.dayWeekDayDateFormat:
                return this.formatDateSeparator(date, locale);

            case LocalizedDateHelper.patterns.dayWeekDayDateTimeFormat:
            case LocalizedDateHelper.patterns.dayDateTimeFormat:
                return this.formatDateTimeWithSeparator(date, locale);

            case LocalizedDateHelper.patterns.conversationDate:
                return this.formatConversationDate(date, locale);

            case LocalizedDateHelper.patterns.callBubble:
            case LocalizedDateHelper.patterns.callLogs: 
                const { dayJsLocale } = this.getLocaleConfig(locale);
                dayjs.locale(dayJsLocale);
                const use12Hour = this.shouldUse12HourClock(locale);
                const formatString = use12Hour ? "D MMM, h:mm A" : "D MMM, HH:mm";
                return dayjs(date).format(formatString);
            default:
                return this.formatDateSeparator(date, locale);
        }
    }
}

export const localizedDateHelperInstance = new LocalizedDateHelper();
import de from './resources/de/translation.json';
import en from './resources/en/translation.json';
import es from './resources/es/translation.json';
import fr from './resources/fr/translation.json';
import hi from './resources/hi/translation.json';
import hu from './resources/hu/translation.json';
import lt from './resources/lt/translation.json';
import ms from './resources/ms/translation.json';
import pt from './resources/pt/translation.json';
import ru from './resources/ru/translation.json';
import sv from './resources/sv/translation.json';
import zh from './resources/zh/translation.json';
import zhTw from './resources/zh-tw/translation.json'; 
import ja from './resources/ja/translation.json';
import ko from './resources/ko/translation.json';
import tr from './resources/tr/translation.json';
import nl from './resources/nl/translation.json';
import it from './resources/it/translation.json';   
import { Language } from './type';


export type TranslationKey = keyof typeof en;


const defaultTranslations = {
    de,
    en,
    es,
    fr,
    hi,
    hu,
    lt,
    ms,
    pt,
    ru,
    sv,
    zh,
    ja,
    ko,
    tr,
    nl,
    it,
    "zh-tw":zhTw,
    "en-IN" : en,
    "en-GB" : en,
    "en-US" : en,
} as const;


export type SupportedLanguage = keyof typeof defaultTranslations;

export interface CustomTranslations {
    [languageCode: string]: {
        [key: string]: string;
    };
}


export const translate = (
    language: Language,
    key: string,
    customTranslations?: CustomTranslations,
    fallbackLanguage: Language = 'en'
): string => {

    if (customTranslations?.[language]?.[key]) {
        return customTranslations[language][key];
    }


    const defaultTranslation = defaultTranslations[language as SupportedLanguage];
    if (defaultTranslation && key in defaultTranslation) {
        return defaultTranslation[key as TranslationKey];
    }


    if (language !== fallbackLanguage && customTranslations?.[fallbackLanguage]?.[key]) {
        return customTranslations[fallbackLanguage][key];
    }


    if (language !== fallbackLanguage) {
        const fallbackTranslation = defaultTranslations[fallbackLanguage as SupportedLanguage];
        if (fallbackTranslation && key in fallbackTranslation) {
            return fallbackTranslation[key as TranslationKey];
        }
    }


    console.warn(`Missing translation for key: ${key} in language: ${language} and fallback: ${fallbackLanguage}`);
    return key;
};


export const getAvailableLanguages = (): SupportedLanguage[] => {
    return Object.keys(defaultTranslations) as SupportedLanguage[];
};

export default defaultTranslations;
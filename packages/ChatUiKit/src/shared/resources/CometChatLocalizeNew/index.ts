import { getCometChatTranslation, getCurrentLanguage } from './LocalizationManager'
import { CometChatI18nProvider } from './CometChatI18nProvider';
import { useCometChatTranslation } from './useCometChatTranslationHook';
import {
    translate,
    getAvailableLanguages,
    type TranslationKey,
    type SupportedLanguage,
    type CustomTranslations
} from './CometChatLocalizationHelper';
import type { CometChatLocalizeContextType, Language } from './type';

export {
    getCometChatTranslation,
    getCurrentLanguage,
    CometChatI18nProvider,
    useCometChatTranslation,
    translate,
    getAvailableLanguages,
    type TranslationKey,
    type SupportedLanguage,
    type CustomTranslations,
    type CometChatLocalizeContextType,
    type Language
} 
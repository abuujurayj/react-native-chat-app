import { translate } from './CometChatLocalizationHelper';
import { Language } from './type';


class LocalizationManager {
    private static instance: LocalizationManager;
    private currentLanguage: Language = 'en';
    private customTranslations?: any;
    private fallbackLanguage: Language = 'en';
    private isProviderActive: boolean = false;

    static getInstance(): LocalizationManager {
        if (!LocalizationManager.instance) {
            LocalizationManager.instance = new LocalizationManager();
        }
        return LocalizationManager.instance;
    }


    setLanguage(language: Language, translations?: any, fallback?: Language) {
        this.currentLanguage = language;
        this.customTranslations = translations;
        this.isProviderActive = true; 
        if (fallback) {
            this.fallbackLanguage = fallback;
        }
    }

    getCurrentLanguage(): Language {
        return this.currentLanguage;
    }


    translate(key: string): string {

        if (!this.isProviderActive) {
            return translate('en', key, undefined, 'en');
        }


        return translate(this.currentLanguage, key, this.customTranslations, this.fallbackLanguage);
    }

    markProviderInactive() {
        this.isProviderActive = false;
    }
}


export const t = (key: string): string => {
    return LocalizationManager.getInstance().translate(key);
};


export const setGlobalLanguage = (language: Language, translations?: any, fallback?: Language) => {
    LocalizationManager.getInstance().setLanguage(language, translations, fallback);
};

export const getCometChatTranslation = () => {
    return t
}

export const getCurrentLanguage = (): Language => {
    return LocalizationManager.getInstance().getCurrentLanguage();
};
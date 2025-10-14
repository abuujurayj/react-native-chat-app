import React, { ReactNode, useState, useEffect, useMemo, useCallback } from "react";
import { getAvailableLanguages, translate } from "./CometChatLocalizationHelper";
import { CometChatLocalizeContext } from "./CometChatLocalizeContext";
import { setGlobalLanguage } from './LocalizationManager';
import * as RNLocalize from 'react-native-localize';
import { Language } from "./type";

interface CometChatI18nProviderProps {
    children: ReactNode;
    selectedLanguage?: Language;
    autoDetectLanguage?: boolean;
    fallbackLanguage?: Language;
    translations?: {
        [languageCode: string]: {
            [key: string]: string;
        };
    };
}

const getDeviceLanguage = (): Language => {
    try {
        const locales = RNLocalize.getLocales();
        if (Array.isArray(locales) && locales.length > 0) {
            const code = locales[0].languageCode as Language;
            console.log(locales[0], " device language detected");
            return code;
        }
    } catch (error) {
        console.warn('Error getting device language:', error);
    }
    return 'en';
};



export const CometChatI18nProvider = ({
    children,
    selectedLanguage,
    autoDetectLanguage = true,
    fallbackLanguage = 'en',
    translations
}: CometChatI18nProviderProps) => {
    const [language, setLanguage] = useState<Language>(() => {
        if (selectedLanguage) {
            console.log(selectedLanguage, " selected language provided");
            const availableLanguages = getAvailableLanguages();
            const customLanguages = translations ? Object.keys(translations) : [];
            const allAvailableLanguages = [...availableLanguages, ...customLanguages];


            if (allAvailableLanguages.includes(selectedLanguage)) {
                return selectedLanguage;
            } else {

                console.warn(`Language '${selectedLanguage}' not found. Using fallback: ${fallbackLanguage}`);
                return fallbackLanguage;
            }
        } else if (autoDetectLanguage) {
            console.log("Using device language");
            return getDeviceLanguage();
        }
        return fallbackLanguage;
    });

    useEffect(() => {
        if (selectedLanguage) {
            console.log(selectedLanguage, " selected language changed via props");
            const availableLanguages = getAvailableLanguages();
            const customLanguages = translations ? Object.keys(translations) : [];
            const allAvailableLanguages = [...availableLanguages, ...customLanguages];

            if (allAvailableLanguages.includes(selectedLanguage)) {
                setLanguage(selectedLanguage);
                console.log(selectedLanguage, " language set from props");
            } else {
                console.warn(`Language '${selectedLanguage}' not found (set via prop). Using fallback: ${fallbackLanguage}`);
                setLanguage(fallbackLanguage);
            }
        } else if (autoDetectLanguage) {
            console.log("Auto-detecting device language");
            setLanguage(getDeviceLanguage());
        }
    }, [selectedLanguage, autoDetectLanguage, fallbackLanguage, translations]);


    useEffect(() => {
        setGlobalLanguage(language, translations, fallbackLanguage);
    }, [language, translations, fallbackLanguage]);


    const t = useCallback((key: string): string => {
        return translate(language, key, translations, fallbackLanguage);
    }, [language, translations, fallbackLanguage]);


    const contextValue = useMemo(() => ({
        language,
        t,
    }), [language, t]);

    return (
        <CometChatLocalizeContext.Provider value={contextValue}>
            {children}
        </CometChatLocalizeContext.Provider>
    );
};
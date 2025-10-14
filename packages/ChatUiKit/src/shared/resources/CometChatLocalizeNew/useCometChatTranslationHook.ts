import { useContext } from "react";
import { CometChatLocalizeContext } from "./CometChatLocalizeContext";
import { getAvailableLanguages, translate } from "./CometChatLocalizationHelper";

export const useCometChatTranslation = () => {
    const context = useContext(CometChatLocalizeContext);


    if (!context) {
        console.warn('useCometChatTranslation used outside provider, using fallback translations');

        return {
            language: 'en' as const,
            t: (key: string) => translate('en', key, undefined, 'en'), 
            availableLanguages: getAvailableLanguages(),
        };
    }


    return {
        ...context,
        availableLanguages: getAvailableLanguages(),
    };
};

import { useMemo } from "react";
import { useCometChatTranslation } from "../resources/CometChatLocalizeNew";
import { localizedDateHelperInstance } from "./../helper/LocalizedDateHelper";

/**
 * Hook to use localized date formatting with current language
 */
export const useLocalizedDate = () => {
    const { language } = useCometChatTranslation();

    return useMemo(() => ({
        formatDate: (timestamp: number, pattern: string): string => {
            return localizedDateHelperInstance.getFormattedDate(timestamp, pattern, language);
        }
    }), [language]);
};
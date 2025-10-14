import React, { createContext } from 'react';
import { CometChatLocalizeContextType } from './type';
import { translate } from './CometChatLocalizationHelper';

const fallbackTranslate = (key: string): string => {
    console.warn(`Translation function called outside of CometChatI18nProvider for key: ${key}. Using fallback.`);
    return translate('en', key, undefined, 'en');
};

const defaultContextValue: CometChatLocalizeContextType = {
    language: 'en',
    t: fallbackTranslate, 
};

export const CometChatLocalizeContext = createContext<CometChatLocalizeContextType>(defaultContextValue);
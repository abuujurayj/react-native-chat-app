export type Language = string; 

export type CometChatLocalizeContextType = {
    language: Language;
    t: (key: string) => string;
};


/**
 * Search related enums and constants for CometChatSearch component
 */

/**
 * Enum for different search scopes
 */
export enum CometChatSearchScope {
  Conversations = "conversations",
  Messages = "messages",
  All = "all"
}

/**
 * Enum for different search filters
 */
export enum CometChatSearchFilter {
  Conversations = "conversations",
  Messages = "messages",
  Unread = "unread",
  Groups = "groups",
  Photos = "photos",
  Videos = "videos",
  Audio = "audio",
  Documents = "documents",
  Links = "links"
}

/**
 * Enum for component states
 */
export enum States {
  loading = "loading",
  loaded = "loaded",
  empty = "empty",
  error = "error"
}

/**
 * Interface for search filter items
 */
export interface CometChatSearchFilterItem {
  id: CometChatSearchFilter;
  title: string;
  active?: boolean;
}
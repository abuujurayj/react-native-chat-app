import { CometChat } from "@cometchat/chat-sdk-react-native";
import React, { JSX } from "react";
import { ColorValue, StyleProp, Text, TextStyle } from "react-native";
import { CometChatUIKit } from "../../CometChatUiKit";
import {
  MentionsTargetElement,
  MentionsType,
  MentionsVisibility,
} from "../../constants/UIKitConstants";
import { CometChatUIEventHandler, CometChatUIEvents } from "../../events";
import { SuggestionItem } from "../../views/CometChatSuggestionList";
import { CometChatTextFormatter } from "../CometChatTextFormatter";
import { CometChatTheme } from "../../../theme/type";
import { deepMerge } from "../../helper/helperFunctions";
import { getCometChatTranslation } from "../../resources/CometChatLocalizeNew/LocalizationManager";

const t = getCometChatTranslation();

/**
 * Represents the CometChatMentionsFormatter class.
 * This class extends the CometChatTextFormatter class and provides methods for handling mentions in text.
 * @extends CometChatTextFormatter
 */

type MentionsSubStyle = {
  textStyle?: TextStyle;
  selfTextStyle?: TextStyle;
};

type MentionContext = "composer" | "conversation" | "incoming" | "outgoing";

function isCometChatTheme(t: unknown): t is CometChatTheme {
  return (
    !!t &&
    typeof t === "object" &&
    "typography" in t &&
    "color" in t &&
    typeof (t as any).typography === "object" &&
    typeof (t as any).color === "object"
  );
}

export class CometChatMentionsFormatter extends CometChatTextFormatter {
  /**
   * List of users for mentions.
   */
  protected SuggestionItems: Array<SuggestionItem> = [];

  /**
   * List of searched data.
   */
  protected searchData: Array<SuggestionItem> = [];

  /**
   * Stores the formatting style for mentions.
   */
  protected mentionsStyle: CometChatTheme["mentionsStyle"];

  /**
   * Default search request object to fetch users or group members.
   */
  private searchRequest?: CometChat.UsersRequest | CometChat.GroupMembersRequest;

  /**
   * Custom request object to fetch users or group members.
   */
  private customRequest?: CometChat.UsersRequestBuilder | CometChat.GroupMembersRequestBuilder;

  private composerStyle: MentionsSubStyle;
  private conversationStyle: MentionsSubStyle;
  private incomingBubbleStyle: MentionsSubStyle;
  private outgoingBubbleStyle: MentionsSubStyle;
  private currentContext: MentionContext = "incoming";
  private resolveStyle(isSelf: boolean): TextStyle {
    let style: MentionsSubStyle;
    switch (this.currentContext) {
      case "composer":
        style = this.composerStyle;
        break;
      case "conversation":
        style = this.conversationStyle;
        break;
      case "outgoing":
        style = this.outgoingBubbleStyle;
        break;
      default:
        style = this.incomingBubbleStyle;
    }
    return isSelf ? (style.selfTextStyle ?? {}) : (style.textStyle ?? {});
  }

  /**
   * Limit of unique users to be added in the composer.
   */
  protected limit: number = 10;

  /**
   * visibleIn property to determine where the mentions should be visible.
   * @type {MentionsVisibility}
   * @default MentionsVisibility.both
   */
  protected visibleIn: MentionsVisibility = MentionsVisibility.both;

  /**
   * type property to determine the type of mention list.
   * @type {MentionsType}
   * @default MentionsType.usersAndGroupMembers
   */
  protected type: MentionsType = MentionsType.usersAndGroupMembers;

  /**
   * type property to determine the type of mention list.
   * @type {MentionsType}
   * @default MentionsType.usersAndGroupMembers
   */
  protected target: MentionsTargetElement = MentionsTargetElement.textbubble;

  protected textStyle: any = {};

  /**
   * Initializes a new CometChatMentionsFormatter.
   * @param {CometChat.User} loggedInUser - The user who is currently logged in.
   */
  constructor(themeOrUser?: CometChatTheme | CometChat.User, loggedInUser?: CometChat.User) {
    super();
    this.regexPattern = /<@uid:(.*?)>/g;
    this.trackCharacter = "@";

    const theme = isCometChatTheme(themeOrUser) ? themeOrUser : undefined;
    this.loggedInUser = isCometChatTheme(themeOrUser)
      ? loggedInUser
      : (themeOrUser as CometChat.User | undefined);

    const fallback: MentionsSubStyle = {
      textStyle: { fontWeight: "700", fontSize: 14, lineHeight: 19.6, color: "#6852D6" },
      selfTextStyle: { fontWeight: "700", fontSize: 14, lineHeight: 19.6, color: "#FFAB00" },
    };

    const fromTheme = (c: ColorValue): MentionsSubStyle => {
      const baseStyle = theme?.typography?.body?.bold || {};
      return {
        textStyle: { ...baseStyle, color: c },
        selfTextStyle: { ...baseStyle, color: theme?.color?.warning || "#FFAB00" },
      };
    };

    this.incomingBubbleStyle = theme ? fromTheme(theme.color.receiveBubbleTextHighlight) : fallback;
    this.outgoingBubbleStyle = theme ? fromTheme(theme.color.sendBubbleTextHighlight) : fallback;
    this.composerStyle = this.incomingBubbleStyle; // reasonable defaults
    this.conversationStyle = this.incomingBubbleStyle;
  }

  /**
   * Sets the message object.
   *
   * @param {CometChat.BaseMessage} messageObject - The message object to be set.
   */
  setMessage(messageObject: CometChat.BaseMessage) {
    this.messageObject = messageObject;

    let mentionedUsers =
      (messageObject?.getMentionedUsers && messageObject?.getMentionedUsers()) || [];
    let cometchatUIUserArray: Array<SuggestionItem> =
      this.convertCCUsersToSuggestionsItem(mentionedUsers);

    this.setSuggestionItems(cometchatUIUserArray);
  }

  setTargetElement(target: MentionsTargetElement) {
    this.target = target;
  }

  setTextStyle(textStyle: any) {
    this.textStyle = textStyle;
  }

  handlePreMessageSend(message: CometChat.TextMessage): CometChat.TextMessage {
    let CCUsers = this.getSuggestionItems().map((item) => {
      let user = new CometChat.User(item.id);
      user.setAvatar(item?.leadingIconUrl!);
      user.setName(item?.name!);
      return user;
    });
    message.setMentionedUsers(CCUsers);
    return message;
  }

  handleComposerPreview(message: CometChat.TextMessage): void {
    let users = this.convertCCUsersToSuggestionsItem(message.getMentionedUsers());
    this.setSuggestionItems(users);
  }

  private convertCCUsersToSuggestionsItem(users: CometChat.User[]) {
    return users.map((item: CometChat.User) => {
      return new SuggestionItem({
        id: item?.getUid(),
        name: item?.getName(),
        promptText: "@" + item?.getName(),
        trackingCharacter: "@",
        underlyingText: `<@uid:${item?.getUid()}>`,
        leadingIconUrl: item?.getAvatar(),
        hideLeadingIcon: false,
      });
    });
  }

  /**
   * Sets the search request builder.
   * @param requestBuilder - The request builder to set.
   */
  setSearchRequestBuilder(
    requestBuilder: CometChat.UsersRequestBuilder | CometChat.GroupMembersRequestBuilder
  ) {
    this.customRequest = requestBuilder;
  }

  private shouldLoadLocalData(searchKey?: string) {
    if (this.getUniqueUsersList().size >= this.limit) {
      let data = searchKey
        ? [...this.SuggestionItems].filter(
            (item) =>
              item.name?.toLowerCase().includes(searchKey.trim().toLowerCase()) ||
              item.id.toLowerCase().includes(searchKey.trim().toLowerCase())
          )
        : [...this.SuggestionItems];
      this.searchData = [...data];
      this.setSearchData(this.searchData);
      return true;
    }
    return false;
  }

  search(searchKey: string): void {
    if (this.shouldLoadLocalData(searchKey)) return;
    let requestBuilder =
      this.customRequest ||
      (this.group && this.type === MentionsType.usersAndGroupMembers
        ? new CometChat.GroupMembersRequestBuilder(this.group.getGuid())
        : new CometChat.UsersRequestBuilder());

    this.searchRequest = requestBuilder.setLimit(10).setSearchKeyword(searchKey).build();

    this.searchData = [];
    this.fetchNext(true);
  }

  fetchNext(freshCall?: boolean): void | null {
    if (this.getUniqueUsersList().size >= this.limit) return;
    this.searchRequest?.fetchNext &&
      this.searchRequest
        ?.fetchNext()
        .then((users: CometChat.User[]) => {
          let structuredData = this.convertCCUsersToSuggestionsItem(users);
          this.searchData = freshCall
            ? [...structuredData]
            : [...this.searchData, ...structuredData];
          this.setSearchData(this.searchData);
        })
        .catch((err) => {
          console.log("searchRequest fetchNext failed:", err);
          this.setSearchData(this.searchData);
        });
  }

  setSearchData(data: Array<SuggestionItem>) {
    this.searchData = [...data];
    CometChatUIEventHandler.emitUIEvent(CometChatUIEvents.ccSuggestionData, {
      id: this.composerId,
      data: [...this.searchData],
    });
  }

  /**
   * Sets the limit of unique users to be added in the composer.
   */
  setLimit(limit: number) {
    this.limit = limit;
  }

  /**
   * Retrieves the limit of unique users to be added in the composer.
   */
  getLimit() {
    return this.limit;
  }

  /**
   * Retrieves the unique users list.
   */
  getUniqueUsersList(): Set<number | string> {
    // A Set to store unique user IDs
    const uniqueUserIds: Set<number | string> = new Set();

    // Populate the Set with user IDs from the existing user list
    this.SuggestionItems.forEach((user) => uniqueUserIds.add(user.id));

    return uniqueUserIds;
  }

  /**
   * Retrieves the message object.
   *
   * @returns {CometChat.BaseMessage} - The current message object.
   */
  getMessage(): CometChat.BaseMessage {
    return this.messageObject;
  }

  /**
   * Sets the regex pattern for matching text.
   *
   * @param {<RegExp>} regexPattern - Regex patterns.
   */
  setRegexPattern = (regexPattern: RegExp) => {
    this.regexPattern = regexPattern;
  };

  /**
   * Gets the regex pattern for matching text.
   */
  getRegexPattern = () => {
    return this.regexPattern;
  };

  /**
   * Retrieves the SuggestionItems.
   *
   * @returns {Array<SuggestionItem>} - The current SuggestionItems.
   */
  getSuggestionItems(): Array<SuggestionItem> {
    return this.SuggestionItems;
  }

  /**
   * Sets the SuggestionItems.
   *
   * @param {Array<SuggestionItem>} SuggestionItems - The SuggestionItems to be set.
   */
  setSuggestionItems(SuggestionItems: Array<SuggestionItem>) {
    this.SuggestionItems = [...SuggestionItems];
  }

  /**
   * Retrieves the mentions style.
   *
   * @returns {CometChatTheme["mentionsStyle"]} - The current mentions style.
   */
  getMentionsStyle(): CometChatTheme["mentionsStyle"] {
    return this.mentionsStyle;
  }

  setComposerMentionStyle(s: MentionsSubStyle) {
    this.composerStyle = deepMerge(this.composerStyle, s);
    return this;
  }
  setConversationMentionStyle(s: MentionsSubStyle) {
    this.conversationStyle = deepMerge(this.conversationStyle, s);
    return this;
  }
  setIncomingBubbleMentionStyle(s: MentionsSubStyle) {
    this.incomingBubbleStyle = deepMerge(this.incomingBubbleStyle, s);
    return this;
  }
  setOutgoingBubbleMentionStyle(s: MentionsSubStyle) {
    this.outgoingBubbleStyle = deepMerge(this.outgoingBubbleStyle, s);
    return this;
  }

  /** maintain back-compat */
  setMentionsStyle(patch?: CometChatTheme["mentionsStyle"]) {
    if (!patch) return this;
    const apply = (dst: MentionsSubStyle) => deepMerge(dst, patch);
    this.setIncomingBubbleMentionStyle(apply(this.incomingBubbleStyle))
      .setOutgoingBubbleMentionStyle(apply(this.outgoingBubbleStyle))
      .setComposerMentionStyle(apply(this.composerStyle))
      .setConversationMentionStyle(apply(this.conversationStyle));
    return this;
  }

  /** called from data-sources */
  setContext(ctx: MentionContext) {
    this.currentContext = ctx;
    return this;
  }

  getFormattedText(
    inputText: string | null | JSX.Element,
    textStyle?: StyleProp<TextStyle>
  ): string | JSX.Element {
    if (!inputText) {
      return "";
    }
    let formattedText = this.addMentionsView(inputText, textStyle);
    return formattedText;
  }

  temp!: Function;

  setOnMentionClick(callBack: (message: CometChat.BaseMessage, uid: string) => void) {
    // callBack(this.messageObject, "uid");
    this.temp = callBack;
  }

  /**
   * Emits the event for mention click.
   * @param {any} event - The event object.
   * @param {string} uid - The user id.
   */
  private onMentionClick = (event: any, uid: string) => {
    if (this.temp) {
      this.temp(this.messageObject, uid);
      return;
    }
  };

  /**
   * This function adds the mention view to the input text.
   *
   * @param {string} inputText - The input text where the view needs to be added.
   * @returns {string} - The modified input text.
   */
  protected addMentionsView(
    inputText: string | JSX.Element,
    textStyle: StyleProp<TextStyle> = {}
  ): any {
    if (typeof inputText === "string") {
      let mentions: JSX.Element[] = [];

      if (this.SuggestionItems) {
        const userRegistry: { [key: string]: string } = {};
        for (let i = 0; i < this.SuggestionItems?.length; i++) {
          const userUid = this.SuggestionItems[i].id;
          const userName = this.SuggestionItems[i].promptText;
          userRegistry[userUid] = userName!;
        }

        // Define the regex pattern
        const regex = this.getRegexPattern();

        // Break the string into segments split by the regex
        let match;
        let lastIndex = 0;
        let segments: any[] = [];

        while ((match = regex.exec(inputText)) !== null) {
          // Add preceding non-UID segment, if any
          if (match.index > lastIndex) {
            segments.push(inputText.slice(lastIndex, match.index));
          }

          // Add UID segment
          segments.push(match[1]);

          // Update lastIndex
          lastIndex = match.index + match[0].length;
        }

        // Append trailing non-UID segment, if any
        if (lastIndex < inputText.length) {
          segments.push(inputText.slice(lastIndex));
        }

        // Now create an array of JSX elements from the segments
        const elements = segments.map((segment, index) => {
          // Check if segment is a UID
          if (userRegistry.hasOwnProperty(segment)) {
            let _loggedInUser = this.loggedInUser || CometChatUIKit.loggedInUser;

            const isSelf = _loggedInUser?.getUid() === segment;
            const isOutgoing =
              this.messageObject?.getSender()?.getUid() === _loggedInUser?.getUid();

            if (this.target === MentionsTargetElement.textbubble) {
              // Only for bubbles – keep whatever was set for conversation & composer
              this.setContext(isOutgoing ? "outgoing" : "incoming");
            }
            const textStyle = this.resolveStyle(isSelf);
            let onPressProp = this.temp
              ? { onPress: (event: any) => this.onMentionClick(event, segment) }
              : {};

            if (this.target === MentionsTargetElement.textbubble) {
              return (
                // <View>
                <Text suppressHighlighting={true} key={index} {...onPressProp} style={[textStyle]}>
                  {userRegistry[segment]}
                </Text>
                // </View>
              );
            }

            //conv
            return (
              <Text suppressHighlighting={true} key={index} {...onPressProp} style={[textStyle]}>
                {userRegistry[segment]}
              </Text>
            );
          } else {
            if (this.target === MentionsTargetElement.textbubble)
              return (
                // <View>
                <Text key={index} style={{ ...this.textStyle }}>
                  {segment}
                </Text>
                // </View>
              );

            //conv
            return (
              <Text key={index} style={{ ...this.textStyle }}>
                {segment}
              </Text>
            );
          }
        });

        if (elements.length > 0)
          return <Text style={textStyle}>{elements.map((item) => item)}</Text>;
      }
      return inputText;
    } else if (React.isValidElement(inputText)) {
      // inputText is a React element
      if ((inputText as React.ReactElement<any>).props.children) {
        // If the React element have children, we map over these children
        // and call addMentionsView recursively for each child.
        return React.cloneElement(inputText as React.ReactElement<any>, {
          children: React.Children.map(
            (inputText as React.ReactElement<any>).props.children,
            (child) => {
              return this.addMentionsView(child);
            }
          ),
        });
      } else {
        // If the React element does not have children, return it as is
        return inputText;
      }
    } else {
      throw new Error(`Unsupported inputText type: ${typeof inputText}`);
    }
  }

  /**
   * Sets the type of mention list.
   * @param type - The type of mention list.
   */
  setType(type: MentionsType) {
    this.type = type;
  }

  /**
   * Sets the visibleIn property to determine where the mentions should be visible.
   * @param visibleIn - The visibleIn property to set.
   */
  setVisibleIn(visibleIn: MentionsVisibility) {
    this.visibleIn = visibleIn;
  }

  /**
   * Retrieves the visibleIn property to determine where the mentions should be visible.
   */
  getVisibleIn() {
    return this.visibleIn;
  }

  /**
   * Retrieves the type of mention list.
   */
  getType() {
    return this.type;
  }

  getErrorString() {
    return `${t("MENTION_UPTO")} ${this.limit} ${
      this.limit === 1 ? t("TIME") : t("TIMES")
    } ${t("AT_A_TIME")}.`;
  }
}

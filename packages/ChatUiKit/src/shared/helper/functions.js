import { useCometChatTranslation } from "../resources/CometChatLocalizeNew";
import { localizedDateHelperInstance } from "./LocalizedDateHelper";
import dayjs from "dayjs";

export const CheckPropertyExists = (obj, propkey) => {
    return Object.prototype.hasOwnProperty.call(obj, propkey);
}

/**
 * Returns extention data object or null if extention data not found.
 * @param {object} message - message Object from SDK
 * @param {string} extentionKey extention tobe searched
 * @returns object or null.
 */
 export const getExtensionData = (message, extentionKey) => {
    if (message?.metadata) {
        var injectedObject = message.metadata["@injected"];
        if (injectedObject != null && injectedObject.hasOwnProperty("extensions")) {
            var extensionsObject = injectedObject["extensions"];
            if (
                extensionsObject != null &&
                extensionsObject.hasOwnProperty(extentionKey)
            ) {
                return extensionsObject[extentionKey];
            }
        }
    }
    return null;
}

export const getMetadataByKey = (message, metadataKey) => {
    if (message.hasOwnProperty("metadata")) {
        const metadata = message["metadata"];
        if (metadata.hasOwnProperty(metadataKey)) {
            return metadata[metadataKey];
        }
    }

    return null;
};

export function getLastSeenTime(timestamp) {
  try {
    if (timestamp === null || timestamp === undefined) return t("OFFLINE");

    // Convert to milliseconds if in seconds
    if (String(timestamp).length === 10) timestamp *= 1000;

    // Get user's current language from the translation hook
    const { language,t } = useCometChatTranslation();

    // Set the appropriate Day.js locale
    dayjs.locale(language);

    const now = dayjs();
    const lastSeenTime = dayjs(timestamp);
    const diffInMinutes = now.diff(lastSeenTime, "minute");
    const diffInHours = now.diff(lastSeenTime, "hour");
    const diffInDays = now.diff(lastSeenTime, "day");

    // For very recent times (< 1 min) → "a few seconds ago"
    if (diffInMinutes < 1) {
      const relativeTimeString = lastSeenTime.fromNow();
      // Day.js will give "a few seconds ago" localized
      return `${t("LAST_SEEN")} ${relativeTimeString}`;
    }

    // For times less than 24 hours → relative ("X minutes ago", "X hours ago")
    if (diffInHours < 24) {
      const relativeTimeString = lastSeenTime.fromNow();
      return `${t("LAST_SEEN")} ${relativeTimeString}`;
    }

    // For yesterday with time
    if (diffInDays === 1) {
      const timeFormat = localizedDateHelperInstance.getFormattedDate(
        timestamp,
        "timeFormat",
        language
      );
      return `${t("LAST_SEEN")} ${t("YESTERDAY")} ${timeFormat}`;
    }

    // For dates within the past week → weekday + time
    if (diffInDays < 7) {
      const formattedDate = localizedDateHelperInstance.getFormattedDate(
        timestamp,
        "dayWeekDayDateTimeFormat",
        language
      );
      return `${t("LAST_SEEN")} ${formattedDate}`;
    }

    // Older dates → full date + time
    return `${t("LAST_SEEN")} ${localizedDateHelperInstance.getFormattedDate(
      timestamp,
      "dayDateTimeFormat",
      language
    )}`;
  } catch (e) {
    console.log(e);
    return "";
  }
}

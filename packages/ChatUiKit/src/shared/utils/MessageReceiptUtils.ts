import { MessageReceipt } from "../constants/UIKitConstants";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { getModerationStatus } from "./MessageUtils";

/**
 * Utility helper for deriving a message receipt status from a BaseMessage instance.
 */
export const MessageReceiptUtils = {
  getReceiptStatus(message: CometChat.BaseMessage | undefined): MessageReceipt {
    if (!message) return MessageReceipt.WAIT;

    // Moderation status (if available)
    const moderationStatus = getModerationStatus(message);
    if (moderationStatus === "disapproved") return MessageReceipt.ERROR;
    if (moderationStatus === "pending") return MessageReceipt.WAIT;

    // Explicit error markers
    const hasError = (message as any)?.error || (message as any)?.metadata?.error;
    if (hasError) return MessageReceipt.ERROR;

    // Deleted messages treated as error for receipts
    if ((message as any)?.deletedAt) return MessageReceipt.ERROR;

    if ((message as any)?.readAt) return MessageReceipt.READ;
    if ((message as any)?.deliveredAt) return MessageReceipt.DELIVERED;
    if ((message as any)?.sentAt) return MessageReceipt.SENT;

    return MessageReceipt.WAIT;
  },
};

export default MessageReceiptUtils;

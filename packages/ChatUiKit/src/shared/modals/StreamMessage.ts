import { CometChat } from '@cometchat/chat-sdk-react-native';
import { MessageCategoryConstants, streamMessageTypes } from '../constants/UIKitConstants';

export class StreamMessage extends CometChat.AIAssistantMessage {

  constructor(receiverId: string, receiverType: string, text: string, category?: string) {
    super(receiverId, receiverType);
    this.setType(streamMessageTypes.run_started);
    this.category = (category ?? MessageCategoryConstants.stream) as CometChat.MessageCategory;
    (this as any).text = text;
  }
}
import React, { memo, useContext, useState, useCallback } from "react";
import { View, ViewProps } from "react-native";
import { BubbleStyles } from "../../../theme/type";
import { MessageBubbleAlignmentType } from "../../base/Types";

export interface CometChatMessageBubbleInterface {
  /**
   * The id of the message bubble.
   * @type string
   */
  id: string;
  /**
   * The leading view of the message bubble.
   * @type () => JSX.Element
   */
  LeadingView?: JSX.Element | null;
  /**
   * The header view of the message bubble.
   * @type JSX.Element
   */
  HeaderView?: JSX.Element | null;
  /**
   * The status info view of the message bubble.
   * @type JSX.Element
   */
  StatusInfoView?: JSX.Element | null;
  /**
   * The reply view of the message bubble.
   * @type JSX.Element
   */
  ReplyView?: JSX.Element | null;
  /**
   * The bottom view of the message bubble.
   * @type JSX.Element
   */
  BottomView?: JSX.Element | null;
  /**
   * The content view of the message bubble.
   * @type JSX.Element
   */
  ContentView?: JSX.Element | null;
  /**
   * The thread view of the message bubble.
   * @type JSX.Element
   */
  ThreadView?: JSX.Element | null;
  /**
   * The footer view of the message bubble.
   * @type JSX.Element
   */
  FooterView?: JSX.Element | ((params: {maxContentWidth: number}) => JSX.Element) | null;
  /**
   * The alignment of the message bubble.
   * @type MessageBubbleAlignmentType
   */
  alignment?: MessageBubbleAlignmentType;
  /**
   * The style of the message bubble.
   * @type BaseStyleInterface
   */
  style?: BubbleStyles;
}

export const CometChatMessageBubble = memo(
  ({
    HeaderView,
    StatusInfoView,
    ReplyView,
    ContentView,
    FooterView,
    LeadingView,
    BottomView,
    ThreadView,
    alignment,
    id,
    style,
  }: CometChatMessageBubbleInterface) => {
    const [_width, setWidth] = useState<number | undefined>();


    const handleLayout = useCallback(
      (event: any) => {
        const { width: newWidth } = event.nativeEvent.layout;

        // Update width only if it has changed
        if (newWidth !== _width) {
          setWidth(newWidth);
        }
      },
      [_width]
    );

    return (
      <View
        // key={id}
        style={{
          width: "100%",
          alignItems:
            alignment === "right" ? "flex-end" : alignment === "left" ? "flex-start" : alignment,
        }}
      >
        <View
          style={
            {
              flexDirection: "row",
            } as ViewProps
          }
        >
          {LeadingView && LeadingView}
          <View style={{ marginStart: 4, maxWidth: "80%" } as ViewProps}>
            {HeaderView && HeaderView}
            <View style={{ ...style?.containerStyle }} onLayout={handleLayout}>
              {ReplyView && ReplyView}
              {ContentView && ContentView}
              {StatusInfoView && StatusInfoView}
              {BottomView && BottomView}
            </View>
            {_width && (
              <View style={{ maxWidth: _width }}>
                {FooterView
                  ? typeof FooterView === "function"
                    ? FooterView({ maxContentWidth: _width }) // Call the function if FooterView is a function
                    : FooterView // Render the JSX element directly if it's not a function
                  : null}
              </View>
            )}
            {ThreadView && ThreadView}
          </View>
        </View>
      </View>
    );
  }
);

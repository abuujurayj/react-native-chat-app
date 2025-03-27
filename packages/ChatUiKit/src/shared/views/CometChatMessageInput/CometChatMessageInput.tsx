import React, { RefObject } from "react";
import {
  ColorValue,
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../../theme";
import { localize } from "../../resources/CometChatLocalize";
import { CometChatTheme } from "../../../theme/type";
import { CometChatUIEventHandler, CometChatUIEvents } from "../../events";
import { ViewAlignment } from "../../constants/UIKitConstants";

export interface CometChatMessageInputInterface {
  /**
   *
   *
   * @type {string}
   * @description text for the input
   */
  text?: string;
  /**
   *
   *
   * @type {string}
   * @description placeholder text
   */
  placeHolderText?: string;
  /**
   *
   *
   * @description callback when input state changes
   */
  onChangeText?: (arg0: string) => void;
  style?: CometChatTheme["messageComposerStyles"]["messageInputStyles"];
  /**
   *
   *
   * @type {number}
   * @description max height for the input
   */
  maxHeight?: number;
  /**
   *
   *
   * @type {React.FC}
   * @description React component for Secondary button
   */
  SecondaryButtonView?: JSX.Element;
  /**
   *
   *
   * @type {React.FC}
   * @description React component for Auxiliary button
   */
  AuxiliaryButtonView?: JSX.Element;
  /**
   *
   *
   * @type {('left' | 'right')}
   * @description Placement for Auxiliary button
   */
  auxiliaryButtonAlignment?: "left" | "right";
  /**
   *
   *
   * @type {React.FC}
   * @description React component for Primary button
   */
  PrimaryButtonView?: React.FC;
  /**
   *
   *
   * @description callback for onSelectionChange
   */
  onSelectionChange?: (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;
  /**
   *
   *
   * @type {RefObject<any>}
   * @description ref of {TextInput}
   */
  messageInputRef?: RefObject<any>;
}
export const CometChatMessageInput = (props: CometChatMessageInputInterface) => {
  const theme = useTheme();
  const {
    text = "",
    placeHolderText = localize("ENTER_YOUR_MESSAGE_HERE"),
    onChangeText,
    style,
    SecondaryButtonView,
    AuxiliaryButtonView,
    auxiliaryButtonAlignment = "left",
    PrimaryButtonView,
    onSelectionChange,
    messageInputRef,
  } = props;

  return (
    <View style={style?.containerStyle as ViewStyle}>
      <TextInput
        ref={messageInputRef}
        style={style?.textStyle as TextStyle}
        onChangeText={onChangeText}
        placeholderTextColor={style?.placeHolderTextColor as ColorValue}
        multiline
        textAlignVertical='top'
        placeholder={placeHolderText}
        onSelectionChange={onSelectionChange}
        onFocus={() => {
          CometChatUIEventHandler.emitUIEvent(CometChatUIEvents.hidePanel, {
            alignment: ViewAlignment.composerBottom,
            child: () => null, // Hide the panel content.
          });
        }}
      >
        {text}
      </TextInput>
      <View style={style?.dividerStyle as ViewStyle} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderTopColor: theme.color.background1,
          paddingHorizontal: 12,
          paddingBottom: 8,
          paddingTop: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.spacing.s4 }}>
          {SecondaryButtonView}
          {auxiliaryButtonAlignment === "left" && AuxiliaryButtonView}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.spacing.s4 }}>
          {auxiliaryButtonAlignment === "right" && AuxiliaryButtonView}
          {PrimaryButtonView && <PrimaryButtonView />}
        </View>
      </View>
    </View>
  );
};

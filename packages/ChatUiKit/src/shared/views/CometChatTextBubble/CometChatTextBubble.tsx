import React, { useLayoutEffect, useState, useRef, useCallback } from "react";
import {
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
  LayoutChangeEvent,
  TextLayoutEvent,
} from "react-native";
import {
  CometChatMentionsFormatter,
  CometChatTextFormatter,
  CometChatUrlsFormatter,
} from "../../formatters";
import { useCometChatTranslation } from "../../resources/CometChatLocalizeNew";
import { t } from "../../resources/CometChatLocalizeNew/LocalizationManager";

export interface CometChatTextBubbleInterface {
  /*** text to be shown */
  text?: string;
  textStyle?: StyleProp<TextStyle>;
  /** text container style */
  textContainerStyle?: StyleProp<ViewStyle>;
  textFormatters?: Array<
    CometChatMentionsFormatter | CometChatUrlsFormatter | CometChatTextFormatter
  >;
  /** number of lines to collapse to (default 4) */
  collapseLines?: number;
  /** style for the toggle container */
  toggleContainerStyle?: StyleProp<ViewStyle>;
  /** style for the toggle text */
  toggleTextStyle?: StyleProp<TextStyle>;
}

export const CometChatTextBubble = (props: CometChatTextBubbleInterface) => {
  const { textContainerStyle } = props;

  return (
    <View style={textContainerStyle}>
      <CometChatTextBubbleText {...props} />
    </View>
  );
};

/**
 * CometChatTextBubbleText
 *
 * - measure by actual container width (onLayout) so both iOS and Android measure correctly
 * - robust measurement cache keyed by text+width so we don't re-measure unnecessarily
 */
export const CometChatTextBubbleText = (
  props: Omit<CometChatTextBubbleInterface, "textContainerStyle">
) => {
  const { t } = useCometChatTranslation();
  const {
    text = "",
    textFormatters,
    textStyle,
    collapseLines = 4,
    toggleContainerStyle,
    toggleTextStyle,
  } = props;

  const [formattedText, setFormattedText] = useState<string>(text);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState(false);

  // store container width for accurate measurement
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  /**
   * measuredCache helps avoid re-measuring if the same text+width was already measured.
   * Structure: { key: string } where key = `${text}::${width}`
   */
  const measuredCacheRef = useRef<Record<string, boolean>>({});

  // Only recompute formattedText when the text or textFormatters actually change.
  useLayoutEffect(() => {
    let finalText = text;
    if (textFormatters && textFormatters.length) {
      for (let i = 0; i < textFormatters.length; i++) {
        finalText = textFormatters[i].getFormattedText(finalText);
      }
    }

    // If text content actually changed, update formattedText and reset expansion.
    // Do NOT reset on other prop changes (so adding reaction won't collapse/lose toggle).
    if (finalText !== formattedText) {
      setFormattedText(finalText as string);
      setIsExpanded(false);
      // measurement cache can stay, but remove entries for previous text (optional)
      // measuredCacheRef.current = {}; // not required, we'll rely on keying by text+width
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    text /* only textFormatters intentionally omitted from deps if stable; if not stable include it */,
  ]);

  // handler to capture container width whenever layout changes
  const onContainerLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = Math.round(e.nativeEvent.layout.width);
      if (w && w !== containerWidth) {
        setContainerWidth(w);
        // Do NOT clear isExpanded here — measurement may change truncation but we want to
        // preserve user's expanded/collapsed state unless the text itself changed.
      }
    },
    [containerWidth]
  );

  // Called when hidden text is laid out; use it to determine lines count
  const onMeasuredTextLayout = (e: TextLayoutEvent) => {
    // We rely on containerWidth + formattedText as the measurement key
    const key = `${formattedText}::${containerWidth ?? 0}`;

    // If we've already measured this text at this width, skip
    if (measuredCacheRef.current[key]) return;

    const lines = e.nativeEvent.lines;
    const isNowTruncatable = !!(lines && lines.length > collapseLines);

    setIsTruncatable(isNowTruncatable);
    measuredCacheRef.current[key] = isNowTruncatable;
  };

  const toggle = () => setIsExpanded((v) => !v);

  /**
   * Hidden measurement `Text`:
   * - we render it only when we have containerWidth (so it can measure correctly)
   * - style uses same font metrics as visible text because it inherits textStyle
   * - opacity: 0 and position absolute so it does not affect layout
   *
   * Important: We key the hidden Text by formattedText + containerWidth so React remounts
   * it and triggers onTextLayout when either changes.
   */
  const hiddenTextKey = `${formattedText}::${containerWidth ?? 0}`;

  return (
    <View onLayout={onContainerLayout}>
      {/* Hidden measurement text: only meaningful after we know container width */}
      {containerWidth ? (
        <Text
          key={hiddenTextKey}
          // make sure the hidden text has same width as container
          style={[
            // width must be exact to get consistent wrapping on both platforms
            { position: "absolute", left: 0, top: -10000, width: containerWidth, opacity: 0 },
            textStyle as any,
          ]}
          onTextLayout={onMeasuredTextLayout}
          accessible={false}
          importantForAccessibility='no-hide-descendants'
        >
          {formattedText}
        </Text>
      ) : null}

      {/* Visible text */}
      <Text
        style={textStyle}
        numberOfLines={isExpanded ? undefined : collapseLines}
        ellipsizeMode='tail'
      >
        {formattedText}
      </Text>

      {/* Toggle (only when truncation is needed) */}
      {isTruncatable ? (
        <View style={[{ alignItems: "flex-end", marginTop: 6 }, toggleContainerStyle]}>
          <TouchableOpacity onPress={toggle} accessibilityRole='button'>
            <Text style={[{ alignSelf: "flex-end" }, textStyle, toggleTextStyle]}>
              {isExpanded ? t("SHOW_LESS") : t("READ_MORE")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};
export default CometChatTextBubble;

import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "../theme";
import type { ColorValue } from "react-native";
import { CometChatTheme } from "../theme/type";

/**
 * Animated skeleton placeholder mimicking chat history in CometChat UI‑Kit.
 *
 * The component respects the defaults provided by `theme.chatHistoryStyles.skeletonStyle`,
 * but every visual property can be **overridden per instance** using the
 * `style` prop.
 */
export interface SkeletonProps {
  /** Partial style overrides (theme fallback for omitted keys). */
  style?: Partial<SkeletonStyle>;
}

/** Alias for the skeleton style slice inside the theme. */
type SkeletonStyle = {
  backgroundColor?: ColorValue;
  linearGradientColors?: [string, string];
  shimmerBackgroundColor?: ColorValue;
  shimmerOpacity?: number;
  speed?: number;
  containerBackgroundColor?: ColorValue;
};

// ──────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ──────────────────────────────────────────────────────────────────────────────

function getStyleValue<K extends keyof SkeletonStyle>(
  key: K,
  overrides: Partial<SkeletonStyle> | undefined,
  theme: CometChatTheme
): NonNullable<SkeletonStyle[K]> {
  // Use userStyles as fallback since it's guaranteed to exist
  const fallbackSkeletonStyle = theme.userStyles.skeletonStyle;
  const themeValue = (theme as any).chatHistoryStyles?.skeletonStyle?.[key];
  return ((overrides?.[key] as SkeletonStyle[K]) ??
    themeValue ??
    fallbackSkeletonStyle[key]) as NonNullable<SkeletonStyle[K]>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Layout constants – adapted for chat history structure
// ──────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PADDING = 20;
const SECTION_HEADER_HEIGHT = 16;
const SECTION_SPACING = 25;
const MESSAGE_HEIGHT = 18;
const MESSAGE_SPACING = 32;
const SECTIONS_COUNT = 3;
const MESSAGES_PER_SECTION = 4;

/** Total height required for the SVG canvas */
const TOTAL_HEIGHT =
  SECTIONS_COUNT * (SECTION_HEADER_HEIGHT + SECTION_SPACING + MESSAGES_PER_SECTION * (MESSAGE_HEIGHT + MESSAGE_SPACING)) + 
  PADDING * 2;

// ──────────────────────────────────────────────────────────────────────────────
// SVG elements factory (memoized for perf)
// ──────────────────────────────────────────────────────────────────────────────

const useHistoryElements = (fill: ColorValue) =>
  useMemo(() => {
    const elements: React.ReactElement[] = [];
    let currentY = PADDING;

    // Chat history sections
    for (let sectionIndex = 0; sectionIndex < SECTIONS_COUNT; sectionIndex++) {
      // Section header (Today, Yesterday, etc.)
      elements.push(
        <Rect
          key={`section-${sectionIndex}`}
          x={PADDING}
          y={currentY}
          width={60 + sectionIndex * 20} // Varying widths for different date labels
          height={SECTION_HEADER_HEIGHT}
          rx={SECTION_HEADER_HEIGHT / 2}
          fill={fill as string}
        />
      );
      currentY += SECTION_HEADER_HEIGHT + SECTION_SPACING;

      // Messages in this section
      for (let messageIndex = 0; messageIndex < MESSAGES_PER_SECTION; messageIndex++) {
        const messageWidth = SCREEN_WIDTH - PADDING * 2 - (messageIndex * 30); // Varying message widths
        elements.push(
          <Rect
            key={`message-${sectionIndex}-${messageIndex}`}
            x={PADDING}
            y={currentY}
            width={Math.max(messageWidth, SCREEN_WIDTH * 0.4)} // Minimum width
            height={MESSAGE_HEIGHT}
            rx={MESSAGE_HEIGHT / 2}
            fill={fill as string}
          />
        );
        currentY += MESSAGE_HEIGHT + MESSAGE_SPACING;
      }
      currentY += 10; // Extra spacing between sections
    }

    return elements;
  }, [fill]);

// ──────────────────────────────────────────────────────────────────────────────
// Component Implementation
// ──────────────────────────────────────────────────────────────────────────────

export const Skeleton: React.FC<SkeletonProps> = ({ style }) => {
  const theme = useTheme();
  const get = <K extends keyof SkeletonStyle>(key: K) => getStyleValue(key, style, theme);

  // Shimmer animation ------------------------------------------
  const translate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const speed = get("speed");
    const duration = 1000 / speed;
    const loop = Animated.loop(
      Animated.timing(translate, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false, // SVG not yet compatible with native driver
      })
    );

    loop.start();
    return () => loop.stop();
  }, [get, translate]);

  const translateX = translate.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 2, SCREEN_WIDTH],
  });

  // Pre‑build elements (bottom gradient + top mask)
  const elementsGradient = useHistoryElements("url(#gradient)");
  const elementsSolid = useHistoryElements(String(get("backgroundColor")));

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: get("containerBackgroundColor") }}
    >
      {/* Bottom layer (gradient fill) */}
      <Svg
        height={TOTAL_HEIGHT}
        width={SCREEN_WIDTH}
        fill='none'
        preserveAspectRatio='xMidYMid meet'
      >
        <Defs>
          <LinearGradient
            id='gradient'
            x1='0'
            y1='0'
            x2={SCREEN_WIDTH}
            y2='0'
            gradientUnits='userSpaceOnUse'
          >
            {(() => {
              const colors = get("linearGradientColors");
              return [
                <Stop key={0} stopColor={colors[0]} />,
                <Stop key={1} offset='1' stopColor={colors[1]} />,
              ];
            })()}
          </LinearGradient>
        </Defs>
        {elementsGradient}
      </Svg>

      {/* Moving shimmer highlight (rendered twice for coverage) */}
      {[0, SCREEN_WIDTH / 2].map((offset) => (
        <Animated.View
          key={offset}
          style={[
            styles.shimmer,
            {
              transform: [
                { translateX: Animated.add(translateX, offset) },
                { translateY: -20 },
                { rotate: "15deg" },
              ],
              backgroundColor: get("shimmerBackgroundColor"),
              opacity: get("shimmerOpacity"),
            },
          ]}
        />
      ))}

      {/* Top mask – solid shapes clip the shimmer to elements */}
      <View style={StyleSheet.absoluteFill} pointerEvents='none'>
        <Svg
          height={TOTAL_HEIGHT}
          width={SCREEN_WIDTH}
          fill='none'
          preserveAspectRatio='xMidYMid meet'
        >
          {elementsSolid}
        </Svg>
      </View>
    </ScrollView>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shimmer: {
    position: "absolute",
    width: "25%", // thin bar for highlight
    top: 0,
    bottom: 0,
  },
});
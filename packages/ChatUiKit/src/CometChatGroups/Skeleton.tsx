import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "../theme";

const { width: screenWidth } = Dimensions.get("window");

// Constants for dimensions
const padding = 20;
const headerHeight = 35;
const separatorHeight = 1;
const contentRectHeight = 60;
const listItemHeight = 25; // Height for username
const listItemSubtitleHeight = 20; // Increased from 15 to 20 for subtitle
const listItemSubtitleSpacing = 10; // Increased from 5 to 10 for spacing between username and subtitle
const listItemSpacing = 30; // Increased from 54 to 60 for spacing between list items
const avatarRadius = 25; // Radius for avatar
const listItemCount = 14;

// Calculate the total height needed for the SVG
// const calculateTotalHeight = () => {
//   return (
//     padding + // Header Y position
//     headerHeight + // Header height
//     12 + // Spacing
//     separatorHeight + // Separator height
//     12 + // Spacing
//     contentRectHeight + // Content rectangle height
//     24 + // Spacing
//     listItemCount *
//       (listItemHeight + listItemSubtitleSpacing + listItemSubtitleHeight + listItemSpacing) // List items with updated spacing and height
//   );
// };
const calculateTotalHeight = () => {
  return (
    padding + // Top padding
    listItemCount *
      (listItemHeight + listItemSubtitleSpacing + listItemSubtitleHeight + listItemSpacing) // List items with updated spacing and height
  );
};

const SkeletonItemBottom = () => {
  const theme = useTheme();

  const totalHeight = calculateTotalHeight();

  return (
    <Svg height={totalHeight} width={screenWidth} fill='none' preserveAspectRatio='xMidYMid meet'>
      {/* Header Rectangle */}
      {/* <Rect
        x={padding + 5}
        y={padding}
        width={screenWidth * 0.5}
        height={headerHeight}
        rx={6}
        fill='url(#paint0_linear)'
      /> */}

      {/* Separator Line */}
      {/* <Rect
        x={padding}
        y={padding + headerHeight + 12} // 12 units spacing below header
        width={screenWidth - 2 * padding}
        height={separatorHeight}
        fill='#E0E0E0'
      /> */}

      {/* Content Rectangle with Semi-Circular Corners */}
      {/* <Rect
        x={padding}
        y={padding + headerHeight + 12 + separatorHeight + 12} // Position below separator with spacing
        width={screenWidth - 2 * padding}
        height={contentRectHeight}
        rx={contentRectHeight / 2} // Semi-circular corners
        ry={contentRectHeight / 2} // Ensures vertical radius matches
        fill='url(#paint0_linear)'
      /> */}

      {/* List Items */}
      {Array.from({ length: listItemCount }).map((_, index) => {
        // const itemY =
        //   padding +
        //   headerHeight +
        //   12 +
        //   separatorHeight +
        //   12 +
        //   contentRectHeight +
        //   24 +
        //   index *
        //     (listItemHeight + listItemSubtitleSpacing + listItemSubtitleHeight + listItemSpacing);
        const itemY =
          padding +
          index *
            (listItemHeight + listItemSubtitleSpacing + listItemSubtitleHeight + listItemSpacing) -
          10;

        return (
          <React.Fragment key={index}>
            {/* Avatar Circle */}
            <Circle
              cx={padding + avatarRadius}
              cy={itemY + avatarRadius}
              r={avatarRadius}
              fill='url(#paint0_linear)'
            />

            {/* Username Rectangle */}
            <Rect
              x={padding + 2 * avatarRadius + 12} // 12 units spacing after avatar
              y={itemY}
              width={screenWidth - (padding + 2 * avatarRadius + 12 + padding)}
              height={listItemHeight}
              rx={listItemHeight / 2} // Rounded corners matching height
              fill='url(#paint0_linear)'
            />

            {/* Subtitle Rectangle */}
            <Rect
              x={padding + 2 * avatarRadius + 12}
              y={itemY + listItemHeight + listItemSubtitleSpacing}
              width={(screenWidth - (padding + 2 * avatarRadius + 12 + padding)) * 0.6} // 60% width for subtitle
              height={listItemSubtitleHeight}
              rx={listItemSubtitleHeight / 2}
              fill='url(#paint0_linear)'
            />
          </React.Fragment>
        );
      })}

      {/* Gradient Definition */}
      <Defs>
        <LinearGradient
          id='paint0_linear'
          x1='0'
          y1='0'
          x2={screenWidth}
          y2='0'
          gradientUnits='userSpaceOnUse'
        >
          <Stop stopColor={theme.groupStyles.skeletonStyle.linearGradientColors[0]} />
          <Stop offset='1' stopColor={theme.groupStyles.skeletonStyle.linearGradientColors[1]} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

const SkeletonItemTop = () => {
  const theme = useTheme();

  const totalHeight = calculateTotalHeight();

  return (
    <Svg height={totalHeight} width={screenWidth} fill='none' preserveAspectRatio='xMidYMid meet'>
      {/* Header Rectangle */}
      {/* <Rect
        x={padding + 5}
        y={padding}
        width={screenWidth * 0.5}
        height={headerHeight}
        rx={6}
        fill={theme.groupStyles.skeletonStyle.backgroudColor}
      /> */}

      {/* Separator Line */}
      {/* <Rect
        x={padding}
        y={padding + headerHeight + 12} // 12 units spacing below header
        width={screenWidth - 2 * padding}
        height={separatorHeight}
        fill={theme.groupStyles.skeletonStyle.backgroudColor}
      /> */}

      {/* Content Rectangle with Semi-Circular Corners */}
      {/* <Rect
        x={padding}
        y={padding + headerHeight + 12 + separatorHeight + 12} // Position below separator with spacing
        width={screenWidth - 2 * padding}
        height={contentRectHeight}
        rx={contentRectHeight / 2} // Semi-circular corners
        ry={contentRectHeight / 2} // Ensures vertical radius matches
        fill={theme.groupStyles.skeletonStyle.backgroudColor}
      /> */}

      {/* List Items */}
      {Array.from({ length: listItemCount }).map((_, index) => {
        // const itemY =
        //   padding +
        //   headerHeight +
        //   12 +
        //   separatorHeight +
        //   12 +
        //   contentRectHeight +
        //   24 +
        //   index *
        //     (listItemHeight + listItemSubtitleSpacing + listItemSubtitleHeight + listItemSpacing);

        const itemY =
          padding +
          index *
            (listItemHeight + listItemSubtitleSpacing + listItemSubtitleHeight + listItemSpacing) -
          10;

        return (
          <React.Fragment key={index}>
            {/* Avatar Circle */}
            <Circle
              cx={padding + avatarRadius}
              cy={itemY + avatarRadius}
              r={avatarRadius}
              fill={theme.groupStyles.skeletonStyle.backgroudColor}
            />

            {/* Username Rectangle */}
            <Rect
              x={padding + 2 * avatarRadius + 12} // 12 units spacing after avatar
              y={itemY}
              width={screenWidth - (padding + 2 * avatarRadius + 12 + padding)}
              height={listItemHeight}
              rx={listItemHeight / 2} // Rounded corners matching height
              fill={theme.groupStyles.skeletonStyle.backgroudColor}
            />

            {/* Subtitle Rectangle */}
            <Rect
              x={padding + 2 * avatarRadius + 12}
              y={itemY + listItemHeight + listItemSubtitleSpacing}
              width={(screenWidth - (padding + 2 * avatarRadius + 12 + padding)) * 0.6} // 60% width for subtitle
              height={listItemSubtitleHeight}
              rx={listItemSubtitleHeight / 2}
              fill={theme.groupStyles.skeletonStyle.backgroudColor}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

export const Skeleton = () => {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      animatedValue.setValue(0);
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: (1 / theme.groupStyles.skeletonStyle.speed) * 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();
    };

    startShimmer();
  }, [animatedValue, theme.groupStyles.skeletonStyle.speed]);

  const shimmerTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth * 2, screenWidth],
  });

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.groupStyles.containerStyle.backgroundColor }}
    >
      <SkeletonItemBottom />
      <Animated.View
        style={[
          {
            transform: [
              { translateX: shimmerTranslateX },
              { translateY: -20 },
              { rotate: "15deg" },
            ],
          },
          styles.animatedView,
          {
            backgroundColor: theme.groupStyles.skeletonStyle.shimmerBackgroundColor,
            opacity: theme.groupStyles.skeletonStyle.shimmerOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          {
            transform: [
              {
                translateX: Animated.add(shimmerTranslateX, screenWidth / 2),
              },
              { translateY: -20 },
              { rotate: "15deg" },
            ],
          },
          styles.animatedView,
          {
            backgroundColor: theme.groupStyles.skeletonStyle.shimmerBackgroundColor,
            opacity: theme.groupStyles.skeletonStyle.shimmerOpacity,
          },
        ]}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <SkeletonItemTop />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  animatedView: {
    width: "25%",
    top: 0,
    bottom: 0,
    position: "absolute",
  },
});

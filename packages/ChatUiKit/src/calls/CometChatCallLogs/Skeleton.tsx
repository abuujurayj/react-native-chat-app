import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Defs, G, LinearGradient, Path, Stop, Rect } from "react-native-svg";
import { useTheme } from "../../theme";

const { width: screenWidth } = Dimensions.get("window");

const SkeletonItemBottom = () => {
  const theme = useTheme();

  return (
    <Svg
      height={screenWidth / 5}
      viewBox='0 0 360 72'
      fill='none'
      preserveAspectRatio='xMidYMid meet'
    >
      <Rect x='16' y='12' width='48' height='48' fill='url(#paint0_linear_4_115)' />
      <Rect x='76' y='15' width='160' height='22' fill='url(#paint0_linear_4_115)' />
      <Rect x='76' y='45' width='80' height='12' fill='url(#paint0_linear_4_115)' />
      <Rect x='312' y='20' width='32' height='32' fill='url(#paint0_linear_4_115)' />
      <Defs>
        <LinearGradient
          id='paint0_linear_4_115'
          x1={16}
          y1={36}
          x2={64}
          y2={36}
          gradientUnits='userSpaceOnUse'
        >
          <Stop stopColor={theme.conversationStyles.skeletonStyle.linearGradientColors[0]} />
          <Stop
            offset={1}
            stopColor={theme.conversationStyles.skeletonStyle.linearGradientColors[1]}
          />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

const SkeletonItemTop = () => {
  const theme = useTheme();

  return (
    <Svg height={screenWidth / 5} viewBox='0 0 360 72' fill='none'>
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d="M0 0H360V72H0V0ZM16 36C16 22.7452 26.7452 12 40 12C53.2548 12 64 22.7452 64 36C64 49.2548 53.2548 60 40 60C26.7452 60 16 49.2548 16 36ZM87 15C80.9249 15 76 19.9249 76 26C76 32.0751 80.9249 37 87 37H225C231.075 37 236 32.0751 236 26C236 19.9249 231.075 15 225 15H87ZM76 51C76 47.6863 78.6863 45 82 45H150C153.314 45 156 47.6863 156 51C156 54.3137 153.314 57 150 57H82C78.6863 57 76 54.3137 76 51ZM322 20C316.477 20 312 24.4772 312 30V42C312 47.5228 316.477 52 322 52H334C339.523 52 344 47.5228 344 42V30C344 24.4772 339.523 20 334 20H322Z"
        fill={theme.conversationStyles.containerStyle.backgroundColor}
      />
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
          duration: (1 / theme.conversationStyles.skeletonStyle.speed) * 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();
    };

    startShimmer();
  }, [animatedValue]);

  const shimmerTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth * 2, screenWidth],
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
      {new Array(20).fill(0).map((_, i) => {
        return <SkeletonItemBottom key={i} />;
      })}
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
            backgroundColor: theme.conversationStyles.skeletonStyle.shimmerBackgroundColor,
            opacity: theme.conversationStyles.skeletonStyle.shimmerOpacity,
          },
        ]}
      ></Animated.View>
      <Animated.View
        style={[
          {
            transform: [
              { translateX: Animated.add(shimmerTranslateX, screenWidth / 2) },
              { translateY: -20 },
              { rotate: "15deg" },
            ],
          },
          styles.animatedView,
          {
            backgroundColor: theme.conversationStyles.skeletonStyle.shimmerBackgroundColor,
            opacity: theme.conversationStyles.skeletonStyle.shimmerOpacity,
          },
        ]}
      ></Animated.View>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {new Array(20).fill(0).map((_, i) => {
          return <SkeletonItemTop key={i} />;
        })}
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

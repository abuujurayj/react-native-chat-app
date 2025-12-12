import {
  PropsWithChildren,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useColorScheme, Platform } from "react-native";
import { deepMerge } from "../shared/helper/helperFunctions";
import { DeepPartial } from "../shared/helper/types";
import { Brightness, CometChatThemeHelper } from "./CometChatThemeHelper";
import {
  CompThemeContext,
  ThemeContext,
  ThemeProviderValue,
} from "./context";
import { darkThemeMaker, lightThemeMaker } from "./default/default";
import { useThemeInternal } from "./hook";
import { CometChatTheme } from "./type";

export interface CometChatThemeProviderProps {
  theme?: DeepPartial<ThemeProviderValue>;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const CometChatThemeProvider = ({
  children,
  theme = {} as any,
}: PropsWithChildren<CometChatThemeProviderProps>) => {
  const rawScheme = useColorScheme();
  // For iOS, debounce the scheme value (300ms delay in this example).
  // For Android, use the raw value.
  const scheme =
    Platform.OS === "ios" ? useDebounce(rawScheme, 300) : rawScheme;

  const parentProviderTheme = useThemeInternal();
  const {
    mode = parentProviderTheme.mode,
    dark = parentProviderTheme.dark,
    light = parentProviderTheme.light,
  } = theme;

  const lightTheme = useMemo(() => {
    if (light) {
      const isColorAvailable = light.color !== undefined;
      const updatedColors = light.color
        ? CometChatThemeHelper.updateColors(
            light.color as Partial<CometChatTheme["color"]>,
            Brightness.LIGHT
          )
        : {} as any;
      const updatedSpacing = light.spacing
        ? CometChatThemeHelper.updateSpacing(light.spacing)
        : {} as any;

      // Create a new object cause react native will know the theme has changed
      const updatedLight = {
        ...light,
        color: updatedColors,
        spacing: updatedSpacing
      };
      const mergedTheme = deepMerge(parentProviderTheme.light, updatedLight);
      const defaultLightThemeWithOverridesApplied = isColorAvailable ? lightThemeMaker(
        mergedTheme.spacing as CometChatTheme["spacing"],
        mergedTheme.color as CometChatTheme["color"],
        mergedTheme.typography as CometChatTheme["typography"]
      ) : mergedTheme;
      return deepMerge(defaultLightThemeWithOverridesApplied, updatedLight);
    }
    return parentProviderTheme.light;
  }, [light, parentProviderTheme.light]);

  const darkTheme = useMemo(() => {
    if (dark) {
      const isColorAvailable = dark.color !== undefined;
      const updatedColors = dark.color
        ? CometChatThemeHelper.updateColors(
            dark.color as Partial<CometChatTheme["color"]>,
            Brightness.DARK
          )
        : {} as any;
      const updatedSpacing = dark.spacing
        ? CometChatThemeHelper.updateSpacing(dark.spacing)
        : {} as any;
      // Create a new object cause react native will know the theme has changed
      const updatedDark = {
        ...dark,
        color: updatedColors,
        spacing: updatedSpacing
      };
      const mergedTheme = deepMerge(parentProviderTheme.dark, updatedDark);
      const defaultDarkThemeWithOverridesApplied = isColorAvailable ? darkThemeMaker(
        mergedTheme.spacing as CometChatTheme["spacing"],
        mergedTheme.color as CometChatTheme["color"],
        mergedTheme.typography as CometChatTheme["typography"]
      ) : mergedTheme;
      return deepMerge(defaultDarkThemeWithOverridesApplied, updatedDark);
    }
    return parentProviderTheme.dark;
  }, [dark, parentProviderTheme.dark]);

  const themeValue = {
    light: lightTheme,
    dark: darkTheme,
    // Use the (conditionally) debounced scheme when determining the mode
    mode:
      mode === "auto"
        ? (typeof scheme === "string" ? scheme : "light")
        : mode,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export interface CometChatCompThemeProviderProps {
  theme?: DeepPartial<ThemeProviderValue["light"]>;
}

export const CometChatCompThemeProvider = ({
  children,
  theme = {} as any,
}: PropsWithChildren<CometChatCompThemeProviderProps>) => {
  return (
    <CompThemeContext.Provider value={theme}>
      {children}
    </CompThemeContext.Provider>
  );
};

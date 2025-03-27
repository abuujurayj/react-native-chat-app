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
import { darkThemeMaker, lightThemeMaker } from "./default";
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
  theme = {},
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
      const updatedColors = light.color
        ? CometChatThemeHelper.updateColors(
            light.color as Partial<CometChatTheme["color"]>,
            Brightness.LIGHT
          )
        : {};
      const updatedSpacing = light.spacing
        ? CometChatThemeHelper.updateSpacing(light.spacing)
        : {};
      light.color = updatedColors;
      light.spacing = updatedSpacing;
      const mergedTheme = deepMerge(parentProviderTheme.light, light);
      const defaultLightThemeWithOverridesApplied = lightThemeMaker(
        mergedTheme.spacing as CometChatTheme["spacing"],
        mergedTheme.color as CometChatTheme["color"],
        mergedTheme.typography as CometChatTheme["typography"]
      );
      return deepMerge(defaultLightThemeWithOverridesApplied, light);
    }
    return parentProviderTheme.light;
  }, [light, parentProviderTheme.light]);

  const darkTheme = useMemo(() => {
    if (dark) {
      const updatedColors = dark.color
        ? CometChatThemeHelper.updateColors(
            dark.color as Partial<CometChatTheme["color"]>,
            Brightness.DARK
          )
        : {};
      const updatedSpacing = dark.spacing
        ? CometChatThemeHelper.updateSpacing(dark.spacing)
        : {};
      dark.color = updatedColors;
      dark.spacing = updatedSpacing;
      const mergedTheme = deepMerge(parentProviderTheme.dark, dark);
      const defaultDarkThemeWithOverridesApplied = darkThemeMaker(
        mergedTheme.spacing as CometChatTheme["spacing"],
        mergedTheme.color as CometChatTheme["color"],
        mergedTheme.typography as CometChatTheme["typography"]
      );
      return deepMerge(defaultDarkThemeWithOverridesApplied, dark);
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
  theme = {},
}: PropsWithChildren<CometChatCompThemeProviderProps>) => {
  return (
    <CompThemeContext.Provider value={theme}>
      {children}
    </CompThemeContext.Provider>
  );
};

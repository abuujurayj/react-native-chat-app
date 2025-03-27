import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import { RequireAtLeastOne } from "../../helper/types";

// type ErrorEmptyViewProps = RequireAtLeastOne<{
//   title: string;
//   subTitle: string;
//   Icon?: JSX.Element;
//   tertiaryTitle?: string;
// }> & {
//   containerStyle?: StyleProp<ViewStyle>;
//   titleStyle?: StyleProp<TextStyle>;
//   subTitleStyle?: StyleProp<TextStyle>;
//   RetryView?: JSX.Element;
// };

type ErrorEmptyViewProps = {
  title?: string;
  subTitle?: string;
  Icon?: JSX.Element;
  tertiaryTitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subTitleStyle?: StyleProp<TextStyle>;
  RetryView?: JSX.Element;
};

export const ErrorEmptyView = (props: ErrorEmptyViewProps) => {
  const {
    title,
    subTitle,
    tertiaryTitle = "",
    Icon = null,
    containerStyle = {},
    titleStyle = {},
    subTitleStyle = {},
    RetryView = null,
  } = props;
  return (
    <View style={[containerStyle]}>
      {Icon}
      {title && <Text style={titleStyle}>{title}</Text>}
      {subTitle && <Text style={subTitleStyle}>{subTitle}</Text>}
      {tertiaryTitle && <Text style={subTitleStyle}>{tertiaryTitle}</Text>}
      {RetryView}
    </View>
  );
};

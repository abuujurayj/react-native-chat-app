import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItemInfo, View } from "react-native";
import { CometChatListItem } from "../CometChatListItem";
import { SuggestionItem } from "./SuggestionItem";
import { SuggestionListStyle } from "../../../theme/type";
import { Skeleton } from "./Skeleton";

export interface CometChatSuggestionListInterface {
  separatorColor?: string;
  /**
   * Array of selection items
   */
  data: Array<SuggestionItem>;
  listStyle: SuggestionListStyle;
  onPress: (item: SuggestionItem) => void;
  onEndReached?: () => void;
  loading?: boolean;
}

export const CometChatSuggestionList = (props: CometChatSuggestionListInterface) => {
  const { data, listStyle, onPress, onEndReached, loading } = props;

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setInitialLoad(false);
    }, 800);
  }, []);

  const _render = ({ item, index }: ListRenderItemInfo<SuggestionItem>) => {
    let shouldLoadAvatarName = item.hideLeadingIcon ? {} : { avatarName: item.name };
    return (
      <CometChatListItem
        key={index}
        id={item.id}
        title={item.name}
        avatarURL={item.leadingIconUrl ? { uri: item.leadingIconUrl } : undefined}
        containerStyle={listStyle?.listItemStyle.containerStyle}
        titleStyle={listStyle?.listItemStyle.titleStyle}
        avatarStyle={listStyle?.listItemStyle.avatarStyle}
        onPress={() => onPress(item)}
        {...shouldLoadAvatarName}
      />
    );
  };

  return (
    <View >
      {initialLoad ? (
        <View>
          <Skeleton />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={_render}
          onMomentumScrollEnd={(event) => {
            const contentOffsetY = event.nativeEvent.contentOffset.y; // The current scroll position
            const contentHeight = event.nativeEvent.contentSize.height; // Total height of the content
            const layoutHeight = event.nativeEvent.layoutMeasurement.height; // Height of the visible area

            if (contentOffsetY + layoutHeight >= contentHeight - 10) {
              onEndReached && onEndReached();
            }
          }}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps={"always"}
        />
      )}
      {!initialLoad && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
          }}
        >
          {loading && <ActivityIndicator animating={loading} />}
        </View>
      )}
    </View>
  );
};

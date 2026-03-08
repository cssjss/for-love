import { playerStore } from "@/stores/playerStore";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSnapshot } from "valtio";
import { favoriteStore, toggleFavorite } from "../stores/loveStrore";
import { searchStore } from "../stores/searchStore";
import MusicPlayerLitt from "./MusicplayLitt";
export default function MyFavoriteScreen() {
  const { favorites } = useSnapshot(favoriteStore);
  const [playerVisible, setPlayerVisible] = useState(false);
  const { height } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(height)).current;
  const navigation = useNavigation();
  const EXPANDED_Y = height * 0.3;
  const insets = useSafeAreaInsets();
  const handleDelete = (song: any) => {
    Alert.alert(
      "移除收藏",
      `确定要将《${song.name || song.title}》从喜欢列表中移除吗？`, // 弹窗内容
      [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "确定",
          style: "destructive",
          onPress: () => {
            toggleFavorite(song);
          },
        },
      ],
    );
  };

  // 手势系统
  const panResponder = useRef(
    PanResponder.create({
      // 当手指按下面板时，接管手势
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 为了防止误触，只有当用户垂直方向滑动超过 10 像素时，才接管手势
        return Math.abs(gestureState.dy) > 10;
      },

      // 滑动时：让 slideAnim 跟着动
      onPanResponderMove: (_, gestureState) => {
        // 只能往下滑 (dy > 0)。展开状态的位置是 EXPANDED_Y。
        if (gestureState.dy > 0) {
          slideAnim.setValue(EXPANDED_Y + gestureState.dy);
        }
      },

      // 手指抬起时：判断是关闭还是弹回
      onPanResponderRelease: (_, gestureState) => {
        // 如果往下滑动超过 150 像素，或者滑动速度很快
        if (gestureState.dy > 150 || gestureState.vy > 1.5) {
          // 判定为关闭
          setPlayerVisible(false);
          // 动画滑到底部隐藏
          Animated.timing(slideAnim, {
            toValue: height,
            duration: 250,
            useNativeDriver: true,
          }).start();
        } else {
          // 判定为取消关闭，弹回原位
          Animated.spring(slideAnim, {
            toValue: EXPANDED_Y,
            useNativeDriver: true,
            bounciness: 10, // 回弹效果
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: playerVisible ? EXPANDED_Y : height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [playerVisible]);
  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
        backgroundColor: "#d9d4d4",
      }}
    >
      {/* 顶部标题区 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image
            source={require("../assets/images/back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text style={styles.title}>我的喜欢</Text>
        <Text style={styles.count}>共 {favorites.length} 首</Text>
      </View>

      {/* 列表渲染区 */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>你还没有收藏任何歌曲哦~</Text>
          </View>
        ) : (
          favorites.map((song, index) => (
            <TouchableOpacity
              key={song.id}
              style={styles.songItem}
              activeOpacity={0.7}
              onPress={async () => {
                searchStore.onlyPlay = [...favorites];
                await searchStore.fetchMusicUrl(song.id);
                setPlayerVisible(true);
                searchStore.indexSelect = index;
                playerStore.index = index;
                playerStore.player();
                console.log("想要播放歌曲:", song.name);
              }}
            >
              <Text style={styles.index}>{index + 1}</Text>

              <View style={styles.songInfo}>
                <Text style={styles.name} numberOfLines={1}>
                  {song.name}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {song.artist}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(song)}>
                <Image
                  source={require("../assets/images/heart-fill.png")}
                  style={styles.likeIcon}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <Animated.View
        style={[
          styles.playerContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <MusicPlayerLitt onClose={() => setPlayerVisible(false)} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    borderRadius: 25,
    zIndex: 99,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  index: {
    width: 30,
    fontSize: 16,
    color: "#999",
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  artist: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
  likeIcon: {
    width: 20,
    height: 20,
    marginRight: 25,
  },
  backButton: {
    marginRight: 15,
    marginLeft: -10,
    padding: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  count: {
    fontSize: 14,
    color: "#999",
    marginLeft: 10,
    marginBottom: 3,
  },
});

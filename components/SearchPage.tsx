import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSnapshot } from "valtio";
import { playerStore } from "../stores/playerStore";
import {
  addSearchHistory,
  clearSearchHistory,
  searchHistoryStore,
} from "../stores/searchHistory";
import { searchStore } from "../stores/searchStore";
import MusicPlayerLitt from "./MusicplayLitt";
export default function SearchPage() {
  const snap = useSnapshot(searchStore);
  //获取手机高度
  const { height } = Dimensions.get("window");
  // const plst = useSnapshot(playerStore);
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [source, setSource] = useState<{ uri: string } | null>(null);
  const [playerVisible, setPlayerVisible] = useState(false);
  const formatName = (name?: string) => (name ? name : "暂无");
  const slideAnim = useRef(new Animated.Value(height)).current; // 初始在底部
  const { history } = useSnapshot(searchHistoryStore);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const EXPANDED_Y = height * 0.3;
  const insets = useSafeAreaInsets();
  // 点击返回
  const onBack = () => {
    navigation.goBack();
  };
  // 清空输入
  const clear = () => {
    setKeyword("");
    setSearched(false);
  };

  // 搜索功能
  const searchMusics = async (kw?: string) => {
    // 点击历史标签直接搜索
    const targetKw = typeof kw === "string" ? kw : keyword;
    if (!targetKw.trim()) return;
    // 如果是点击标签触发的，同步更新输入框的显示
    if (typeof kw === "string") setKeyword(kw);
    setLoading(true);
    setSearched(false);
    addSearchHistory(targetKw);
    await searchStore.searchMusic(targetKw);
    setLoading(false);
    setSearched(true);
  };

  // 播放音乐
  const playMusic = async (id: string, index: number) => {
    setLoading(true);
    await snap.fetchMusicUrl(id);
    setLoading(false);
    searchStore.indexSelect = index;
    playerStore.index = index;
    playerStore.player();
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
        backgroundColor: "rgba(255, 255, 255, 0.8)",
      }}
    >
      {/* 顶部搜索栏 */}
      <View style={styles.searchBar}>
        <TouchableOpacity style={styles.icon} onPress={onBack}>
          <Ionicons name="chevron-back" size={30} color="#1d1b1bff" />
        </TouchableOpacity>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="搜索你感兴趣的内容"
            placeholderTextColor="#999"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={() => searchMusics()}
            autoFocus
          />
        </View>

        {keyword.length > 0 && (
          <TouchableOpacity onPress={clear}>
            <Text style={styles.clear}>X</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* 仅在还没搜索出结果时，且有历史记录时显示 */}
      {!searched && history.length > 0 && (
        <View style={styles.historyBox}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>历史搜索</Text>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Ionicons name="trash-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.historyTags}>
            {/* 控制渲染数量：如果未展开，只切前 6 个；展开则渲染全部 */}
            {(showAllHistory ? history : history.slice(0, 6)).map(
              (item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tagItem}
                  onPress={() => searchMusics(item)} // 点击标签直接触发搜索
                >
                  <Text style={styles.tagText}>{item}</Text>
                </TouchableOpacity>
              ),
            )}

            {/* 只有记录超过 6 条，并且还没展开时，才显示“查看全部”按钮 */}
            {history.length > 6 && !showAllHistory && (
              <TouchableOpacity
                style={[styles.tagItem, styles.tagItemMore]}
                onPress={() => setShowAllHistory(true)}
              >
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {/* 加载动画 */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#409eff" />
        </View>
      )}
      {/* “你可能想搜” */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {searched && (
          <View style={styles.wantSearch}>
            <Text style={styles.wantTitle}>你可能想搜</Text>

            <View style={styles.suggestCard}>
              <Image
                source={
                  snap.onlyPlay[0]?.pic
                    ? { uri: snap.onlyPlay[0].pic }
                    : require("../assets/images/tt.jpg")
                }
                style={styles.suggestAvatar}
              />

              <View style={styles.suggestInfo}>
                <Text style={{ color: "#fff" }}>
                  音乐：{snap.onlyPlay[0]?.name || "暂无歌曲"} ＞
                </Text>
                <Text style={{ color: "#ccc", marginTop: 4 }}>
                  10w人关注 · {snap.onlyPlay?.length || "暂未获取"}首歌
                </Text>
              </View>

              <Image
                source={require("../assets/images/playgre.png")}
                style={styles.suggestPlay}
              />
            </View>
          </View>
        )}
        {/* 搜索列表 */}
        {searched && (
          <View style={styles.musicList}>
            <Text style={styles.listTitle}>歌曲</Text>

            {snap.onlyPlay.map((song, index) => (
              <TouchableOpacity
                key={song.id}
                style={styles.musicItem}
                onPress={() => {
                  playMusic(song.id, index);
                  setPlayerVisible(true);
                }}
              >
                <Image
                  source={
                    song.pic
                      ? { uri: song.pic }
                      : require("../assets/images/tt.jpg")
                  }
                  style={styles.suggestAvatars}
                />
                <View style={styles.texts}>
                  <Text style={styles.musicName}>{formatName(song.name)}</Text>
                  <Text style={styles.musicArtist}>{song.artist}</Text>
                </View>

                <Image
                  source={
                    index === snap.indexSelect
                      ? require("../assets/images/play.png")
                      : require("../assets/images/playgre.png")
                  }
                  style={styles.playIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
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
      {/* 全屏加载遮罩
      {loadingOverlay && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#409eff" />
        </View>
      )} */}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(162, 20, 20, 0)",
  },

  icon: {
    marginRight: 12,
  },
  texts: {
    marginLeft: 10,
  },
  inputBox: {
    flex: 1,
    height: 40,
    backgroundColor: "#666161ff",
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  input: {
    height: "100%",
    color: "#fff",
    paddingLeft: 12, //placeholder 往右一点
    paddingTop: -5, //  placeholder 往下微调
    paddingBottom: 0,
    fontSize: 16,
  },

  clear: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 18,
  },

  loading: {
    marginTop: 60,
    alignItems: "center",
  },

  wantSearch: {
    marginTop: 40,
    backgroundColor: "#3C3C3C",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
  },

  wantTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
  },

  suggestCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  suggestAvatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  suggestAvatars: {
    width: 40,
    height: 40,
    borderRadius: 7,
  },
  suggestInfo: {
    flex: 1,
    marginLeft: 14,
  },

  suggestPlay: {
    width: 30,
    height: 30,
    tintColor: "#fff",
  },

  musicList: {
    backgroundColor: "#3C3C3C",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
  },

  listTitle: {
    color: "#fff",
    marginBottom: 15,
    fontSize: 18,
  },

  musicItem: {
    flexDirection: "row",
    // justifyContent: "space-between",
    paddingVertical: 14,
    alignItems: "center",
  },

  musicName: {
    color: "#fff",
    fontSize: 16,
  },

  musicArtist: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 2,
  },

  playIcon: {
    width: 28,
    height: 28,
    marginLeft: "auto",
    tintColor: "#fff",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(20,20,20,0.85)",
  },

  historyBox: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  historyTags: {
    flexDirection: "row",
    flexWrap: "wrap", // 允许换行
  },
  tagItem: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagItemMore: {
    paddingHorizontal: 12, // 箭头按钮可以窄一点
  },
  tagText: {
    color: "#333",
    fontSize: 14,
  },
});

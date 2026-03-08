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
import { useSnapshot } from "valtio";
// ========== 1. 核心修改：引入 historyStore ==========
import { clearHistory, historyStore } from "../stores/historyStore";
import { searchStore } from "../stores/searchStore";
import MusicPlayerLitt from "./MusicplayLitt";

export default function HistoryScreen() {
  const { historyList } = useSnapshot(historyStore);

  const [playerVisible, setPlayerVisible] = useState(false);
  const { height } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(height)).current;
  const navigation = useNavigation();
  const EXPANDED_Y = height * 0.3;
  // ========== 3. 修改：清空记录的逻辑 ==========
  const handleClearHistory = () => {
    Alert.alert("清空历史", "确定要清空所有播放历史吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "确定",
        style: "destructive",
        onPress: () => clearHistory(),
      },
    ]);
  };

  useEffect(() => {
    // 传递给播放队列时也要用历史列表
    searchStore.onlyPlay = [...historyList];
  });

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
    <View style={styles.container}>
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

        {/* ========== 修改标题 ========== */}
        <Text style={styles.title}>历史播放</Text>
        <Text style={styles.count}>共 {historyList.length} 首</Text>

        {/* ========== 新增：一键清空按钮 ========== */}
        {historyList.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.clearBtn}
          >
            <Text style={styles.clearText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {historyList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无播放记录</Text>
          </View>
        ) : (
          historyList.map((song, index) => (
            <TouchableOpacity
              key={song.id}
              style={styles.songItem}
              activeOpacity={0.7}
              onPress={async () => {
                await searchStore.fetchMusicUrl(song.id);
                setPlayerVisible(true);
                searchStore.indexSelect = index;
                playerStore.index = index;
                playerStore.player();
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
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Animated.View
        style={[
          styles.playerContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        <MusicPlayerLitt onClose={() => setPlayerVisible(false)} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d9d4d4",
  },
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
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
  },

  clearBtn: {
    marginLeft: "auto", // 自动推到最右边
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#999",
  },
  clearText: {
    fontSize: 12,
    color: "#666",
  },
  // ===================================
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
});

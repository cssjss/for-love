// app/components/MusicPlayer.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder, // 新增
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { useSnapshot } from "valtio";
import { favoriteStore, toggleFavorite } from "../stores/loveStrore";
import { playerStore } from "../stores/playerStore";
import { searchStore } from "../stores/searchStore";
const { width } = Dimensions.get("window");

interface LyricLine {
  time: number;
  text: string;
}

export function PlayerScreen() {
  const { position: currentTime, duration } = useProgress(500);
  // const playbackState = usePlaybackState();
  const playbackState = usePlaybackState(); // 保留作为辅助触发器
  const [isPlaying, setIsPlaying] = useState(false); // 本地接管图标状态
  const currentState =
    typeof playbackState === "object"
      ? (playbackState as any)?.state
      : playbackState;
  const plst = useSnapshot(playerStore);
  const track = plst.current;
  const favState = useSnapshot(favoriteStore);
  // 如果当前有歌曲，且它的 id 存在于 favorites 数组中，则为 true
  const isFavorite = track
    ? favState.favorites.some((item) => item.id === track.id)
    : false;
  const { height: screenHeight } = Dimensions.get("window");
  const [showPlaylist, setShowPlaylist] = useState(false);
  // const { currentTime, duration, isPlaying, ended } = useSnapshot(playerStore);
  const PLAYLIST_HEIGHT = screenHeight * 0.5;
  const navigation = useNavigation();
  // 初始位置在屏幕最底部（隐藏状态）
  const playlistAnim = useRef(new Animated.Value(PLAYLIST_HEIGHT)).current;
  const isChangingRef = useRef(false);
  // 0: 列表循环 (默认), 1: 单曲循环
  const [playMode, setPlayMode] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // 监听 showPlaylist 的变化来触发动画
  useEffect(() => {
    Animated.timing(playlistAnim, {
      toValue: showPlaylist ? 0 : PLAYLIST_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
    navigation.setOptions({
      swipeEnabled: !showPlaylist,
    });
  }, [showPlaylist, navigation]);

  // 滑动手势控制
  const panResponder = useRef(
    PanResponder.create({
      // 只要 y 轴有向下移动
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return gestureState.dy > 5;
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          playlistAnim.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          setShowPlaylist(false);
        } else {
          // 否则弹回原位
          Animated.spring(playlistAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5,
          }).start();
        }
      },
    }),
  ).current;
  // 点击列表里的歌曲进行播放
  const snapSearch = useSnapshot(searchStore); // 获取 searchStore 快照
  const handlePlayFromList = async (id: string, index: number) => {
    await searchStore.fetchMusicUrl(id);
    searchStore.indexSelect = index;
    playerStore.index = index;
    playerStore.player();
  };
  // 切换播放模式函数
  const togglePlayMode = () => {
    const newMode = playMode === 0 ? 1 : 0;
    setPlayMode(newMode);
    showToast(newMode === 0 ? "已切换为列表循环" : "已切换为单曲循环");
  };

  // 显示 Toast 提示的函数
  const showToast = (msg: string) => {
    setToastMsg(msg);
    fadeAnim.setValue(1);
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 1000);
  };
  //解析歌词
  const lyrics: LyricLine[] = useMemo(() => {
    if (!track?.lyrics) return [];
    return track.lyrics
      .split("\n")
      .map((line) => {
        const m = line.match(/\[(\d{2}):(\d{2}\.\d{1,3})\](.*)/);
        if (!m) return null;
        const min = parseInt(m[1], 10);
        const sec = parseFloat(m[2]);
        const text = m[3].trim();
        return { time: min * 60 + sec, text };
      })
      .filter((x): x is LyricLine => !!x);
  }, [track?.lyrics]);

  //当前高亮行 & 下一句
  const currentLineIndex = useMemo(() => {
    if (!lyrics.length) return 0;
    let idx = 0;
    for (let i = 0; i < lyrics.length; i++) {
      const cur = lyrics[i];
      const next = lyrics[i + 1];
      if (currentTime >= cur.time && (!next || currentTime < next.time)) {
        idx = i;
        break;
      }
    }
    return idx;
  }, [lyrics, currentTime]);

  const currentLyric = lyrics[currentLineIndex]?.text ?? "";
  const nextLyric = lyrics[currentLineIndex + 1]?.text ?? "";

  // 播放暂停
  const togglePlay = async () => {
    try {
      if (!track) {
        showToast("请先选择一首歌曲");
        return;
      }

      if (isPlaying) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        if (duration > 0 && currentTime >= duration - 0.5) {
          await TrackPlayer.seekTo(0);
        }
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("播放控制失败:", error);
    }
  };
  const nextMusic = () => {
    playerStore.next();
  };
  const lastMusic = () => {
    playerStore.previous();
  };
  // 拖动进度条
  const onSeek = async (value: number) => {
    const safeValue =
      duration > 0 && value >= duration - 0.5 ? duration - 1 : value;
    await playerStore.seek(safeValue);
  };
  const handleToggleFavorite = () => {
    if (!track) return;
    // 把当前正在播放的歌曲对象传进去
    toggleFavorite(track as any);
  };
  // 复制链接
  const copyLink = async () => {
    if (!playerStore.current?.url) return;
    await Clipboard.setStringAsync(playerStore.current.url);
    Alert.alert("提示", "复制成功");
  };
  useEffect(() => {
    const syncState = async () => {
      // 绕过钩子的返回值，直接去底层查绝对状态
      const stateObj = await TrackPlayer.getPlaybackState();
      const realState =
        typeof stateObj === "object" ? (stateObj as any)?.state : stateObj;

      setIsPlaying(
        realState === State.Playing ||
          realState === State.Buffering ||
          realState === "playing" ||
          realState === "buffering" ||
          realState === 3,
      );
    };
    syncState();
  }, [currentTime, playbackState]);
  useEffect(() => {
    // 双重保险：状态变成了 Ended，或者进度条走到了距离结束不到 0.5 秒的位置
    const isActuallyEnded =
      currentState === State.Ended ||
      (duration > 0 && currentTime >= duration - 0.5);

    if (isActuallyEnded && !isChangingRef.current) {
      isChangingRef.current = true;

      if (playMode === 1) {
        // 单曲循环
        playerStore.seek(0);
        playerStore.play();
      } else {
        // 列表循环
        playerStore.next();
      }

      // 给予 1.5 秒的冷却时间，防止连环切歌
      setTimeout(() => {
        isChangingRef.current = false;
      }, 1500);
    }
  }, [currentState, currentTime, duration, playMode]);
  function formatTime(sec: number) {
    if (!sec || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  }
  return (
    <View style={styles.container}>
      {/* 歌曲信息 */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {track?.name || "暂无歌曲"}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track?.artist || "未知歌手"}
        </Text>
      </View>

      <View style={styles.coverPlaceholder}>
        <Image
          style={styles.Placeholder}
          source={
            track?.pic
              ? { uri: track.pic }
              : require("../assets/images/bg.jpeg")
          }
          placeholder={require("../assets/images/bg.jpeg")}
          contentFit="cover"
          transition={300} // 300ms 淡入
          cachePolicy="disk" // 磁盘缓存：下次加载更快
        />
      </View>

      {/* 歌词两行 */}
      <View style={styles.lyricsBox}>
        <Text style={styles.lyricCurrent} numberOfLines={1}>
          {currentLyric}
        </Text>
        <Text style={styles.lyricNext} numberOfLines={1}>
          {nextLyric}
        </Text>
      </View>
      {/* 复制 */}
      <View style={styles.lovers}>
        {/* 收藏 */}
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={30}
          color="#ff4d6d"
          onPress={handleToggleFavorite}
          style={styles.leftIcon}
        />

        {/* 分享 */}
        <Ionicons
          name="share-social"
          size={30}
          color="#332c2cff"
          onPress={copyLink}
        />

        {/* 循环*/}
        <TouchableOpacity style={styles.rightIcon} onPress={togglePlayMode}>
          <MaterialIcons
            name={playMode === 0 ? "repeat" : "repeat-one"}
            size={30}
            color="#332c2cff"
          />
        </TouchableOpacity>
      </View>

      {/* 进度条 */}
      <View style={styles.progressRow}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={{ flex: 1, marginHorizontal: 10 }}
          minimumValue={0}
          maximumValue={duration || 0}
          value={currentTime}
          onSlidingComplete={onSeek}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#0c0c0cff"
          thumbTintColor="#0c0c0cff"
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* 控制按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={lastMusic}
          disabled={searchStore.selectedList.length === 0}
        >
          <Ionicons
            name="play-skip-back"
            size={40}
            color={
              searchStore.selectedList.length === 0
                ? "rgba(56, 50, 50, 0.4)"
                : "#222020ff"
            }
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={64}
            color="#0c0b0bff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={nextMusic}
          disabled={searchStore.selectedList.length === 0}
        >
          <Ionicons
            name="play-skip-forward"
            size={40}
            color={
              searchStore.selectedList.length === 0
                ? "rgba(56, 50, 50, 0.4)"
                : "#222020ff"
            }
          />
        </TouchableOpacity>
        {/* 播放列表 */}
        <TouchableOpacity onPress={() => setShowPlaylist(true)}>
          {/* 修改这里 */}
          <Ionicons name="menu" size={30} color="#222020ff" />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.toastContainer, { opacity: fadeAnim }]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>
      {showPlaylist && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowPlaylist(false)}
        />
      )}

      {/* ========== 新增：滑出的播放列表 ========== */}
      <Animated.View
        style={[
          styles.playlistContainer,
          {
            height: PLAYLIST_HEIGHT,
            transform: [{ translateY: playlistAnim }],
          },
        ]}
      >
        {/* 顶部把手区域，绑定手势 */}
        <View style={styles.playlistHeader} {...panResponder.panHandlers}>
          <View style={styles.handlerBar} />
          <Text style={styles.playlistTitle}>
            当前播放 ({snapSearch.onlyPlay.length})
          </Text>
        </View>

        {/* 列表内容 */}
        <ScrollView
          style={styles.playlistContent}
          showsVerticalScrollIndicator={false}
        >
          {snapSearch.onlyPlay.map((song, index) => {
            // 判断这首歌是不是正在播放的那首
            const isCurrent = index === plst.index;

            return (
              <TouchableOpacity
                key={song.id + index}
                style={styles.playlistItem}
                onPress={() => handlePlayFromList(song.id, index)}
              >
                <View style={styles.songInfoWrapper}>
                  <Text
                    style={[
                      styles.playlistSongName,
                      isCurrent && { color: "#31c27c" },
                    ]}
                    numberOfLines={1}
                  >
                    {song.name || "未知"}
                  </Text>
                  <Text style={styles.playlistArtist} numberOfLines={1}>
                    {" - "}
                    {song.artist || "未知歌手"}
                  </Text>
                </View>

                {/* 如果是当前播放的，显示一个小动画图标或播放图标 */}
                {isCurrent && (
                  <Ionicons name="stats-chart" size={18} color="#31c27c" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  artist: {
    color: "rgba(71, 65, 65, 0.7)",
    marginTop: 6,
  },
  coverPlaceholder: {
    width: width * 0.8,
    height: width * 0.85,
    // borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  Placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  lyricsBox: {
    height: 50,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  lyricCurrent: {
    color: "#050505ff",
    fontSize: 18,
    fontWeight: "bold",
  },
  lyricNext: {
    color: "rgba(44, 40, 40, 0.7)",
    fontSize: 14,
  },
  lovers: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 24,
  },
  leftIcon: {
    position: "absolute",
    left: 30, // 调整这里让它“稍微靠边”
  },

  rightIcon: {
    position: "absolute",
    right: 30, // 调整这里让它“稍微靠边”
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  timeText: {
    width: 30,
    color: "#000000ff",
    fontSize: 12,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 30,
  },
  toastContainer: {
    position: "absolute",
    bottom: 120, // 距离底部的距离，避开控制按钮
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 999, // 确保在最顶层
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
  },
  // 播放列表弹窗样式
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 100, // 确保在普通内容之上
  },
  playlistContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 101, // 在遮罩层之上
    // 阴影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  playlistHeader: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  handlerBar: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginBottom: 10,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  playlistContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f5f5f5",
  },
  songInfoWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  playlistSongName: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  playlistArtist: {
    fontSize: 12,
    color: "#999",
  },
});

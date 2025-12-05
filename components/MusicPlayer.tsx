// app/components/MusicPlayer.tsx
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSnapshot } from "valtio";
import { playerStore } from "../stores/playerStore";
import { searchStore } from "../stores/searchStore";
const { width } = Dimensions.get("window");

interface LyricLine {
  time: number;
  text: string;
}

export function PlayerScreen() {
  const snap = useSnapshot(searchStore);
  const plst = useSnapshot(playerStore);
  const track = plst.current;

  const isPlaying = playerStore?.isPlaying ?? false;
  const currentTime = playerStore?.currentTime ?? 0; // 秒
  const duration = playerStore?.duration ?? 0; // 秒
  const [isFavorite, setisFaorite] = useState(false);

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

  // 当 track.url 变化时，替换播放源并自动播放
  useEffect(() => {
    if (!track?.url) return;
    console.log("name" + track.name);
    playerStore.play();
  }, [track.url]);

  // 播放 / 暂停
  const togglePlay = () => {
    if (!playerStore.current?.url) return;
    if (isPlaying) {
      playerStore.pause();
    } else {
      playerStore.play();
    }
  };

  // 拖动进度条
  const onSeek = (value: number) => {
    playerStore.seek(value);
  };
  const toggleFavorite = () => {};
  const onDownload = () => {};
  // 复制链接
  const copyLink = async () => {
    if (!playerStore.current?.url) return;
    await Clipboard.setStringAsync(playerStore.current.url);
    Alert.alert("提示", "复制成功");
  };

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
          source={require("../assets/images/bg.jpeg")}
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
          onPress={toggleFavorite}
          style={styles.leftIcon}
        />

        {/* 分享 */}
        <Ionicons
          name="share-social"
          size={30}
          color="#332c2cff"
          onPress={copyLink}
        />

        {/* 下载 */}
        <Ionicons
          name="download-outline"
          size={30}
          color="#332c2cff"
          onPress={onDownload}
          style={styles.rightIcon}
        />
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
          onPress={playerStore.previous}
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
          onPress={playerStore.next}
          disabled={searchStore.selectedList.length === 0}
        >
          <Ionicons
            name="play-skip-forward"
            size={40}
            color={
              searchStore.selectedList.length === 0
                ? "#222020ff"
                : "rgba(56, 50, 50, 0.4)"
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
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
    marginTop: 24,
  },
});

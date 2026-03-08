import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
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
import { playerStore } from "../stores/playerStore";
import { searchStore } from "../stores/searchStore";
import { RootStackParamList } from "./musiclist";
const { width } = Dimensions.get("window");

export default function MusicPlayerLitt({ onClose }: { onClose: () => void }) {
  const { position: currentTime, duration } = useProgress(500);
  const playbackState = usePlaybackState(); // 保留作为辅助触发器
  const [isPlaying, setIsPlaying] = useState(false); // 本地接管图标状态
  const plst = useSnapshot(playerStore);
  const track = plst.current;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const lyrics = useMemo(() => {
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
      .filter(Boolean);
  }, [track?.lyrics]);

  const currentLineIndex = useMemo(() => {
    if (!lyrics.length) return 0;
    let idx = 0;
    for (let i = 0; i < lyrics.length; i++) {
      const cur = lyrics[i]!;
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

  const togglePlay = async () => {
    try {
      if (!track) {
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

  const nextMusic = () => playerStore.next();
  const lastMusic = () => playerStore.previous();
  const onSeek = (value: number) => playerStore.seek(value);
  function formatTime(sec: number) {
    if (!sec || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  }
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
  return (
    <View style={styles.container}>
      {/* 关闭按钮 */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={26} color="#000" />
      </TouchableOpacity>

      {/* 歌曲标题 */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {track?.name || "暂无歌曲"}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track?.artist || "未知歌手"}
        </Text>
      </View>

      {/* 封面 */}
      <View style={styles.coverPlaceholder}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Tabs", { screen: "播放", initial: false });
          }}
        >
          <Image
            style={styles.Placeholder}
            source={
              track?.pic
                ? { uri: track.pic }
                : require("../assets/images/bg.jpeg")
            }
            placeholder={require("../assets/images/bg.jpeg")}
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
        </TouchableOpacity>
      </View>

      {/* 歌词两行 */}
      <View style={styles.lyricsBox}>
        <Text style={styles.lyricCurrent}>{currentLyric}</Text>
        <Text style={styles.lyricNext}>{nextLyric}</Text>
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
          maximumTrackTintColor="#333"
          thumbTintColor="#333"
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* 控制按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={lastMusic}
          disabled={searchStore.selectedList.length === 0}
        >
          <Ionicons name="play-skip-back" size={40} color="#222" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={64}
            color="#000"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={nextMusic}
          disabled={searchStore.selectedList.length === 0}
        >
          <Ionicons name="play-skip-forward" size={40} color="#222" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgb(224, 205, 219)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold" },
  artist: { marginTop: 6, color: "#666" },

  coverPlaceholder: {
    width: width * 0.7,
    height: width * 0.6,
    alignSelf: "center",
    marginBottom: 20,
  },
  Placeholder: { width: "100%", height: "100%", borderRadius: 16 },

  lyricsBox: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  lyricCurrent: { fontSize: 18, fontWeight: "bold" },
  lyricNext: { fontSize: 14, color: "#666" },

  progressRow: {
    height: 30,
    flexDirection: "row",

    marginTop: 30,
    marginBottom: 25,
  },
  timeText: { width: 30, textAlign: "center", color: "#000", top: 5 },

  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    alignItems: "center",
  },
});

import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Image } from "expo-image";
import { useEffect, useMemo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSnapshot } from "valtio";
import { playerStore } from "../stores/playerStore";
import { searchStore } from "../stores/searchStore";

const { width } = Dimensions.get("window");

export default function MusicPlayerLitt({ onClose }: { onClose: () => void }) {
  const plst = useSnapshot(playerStore);
  const track = plst.current;
  const { currentTime, duration, isPlaying, ended } = useSnapshot(playerStore);

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

  // ---------- 播放控制 ----------
  const togglePlay = () => {
    if (!playerStore.current?.url) return;
    isPlaying ? playerStore.pause() : playerStore.play();
  };

  const nextMusic = () => playerStore.next();
  const lastMusic = () => playerStore.previous();
  const onSeek = (value: number) => playerStore.seek(value);

  useEffect(() => {
    if (ended) nextMusic();
  }, [ended]);

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

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
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

  lyricsBox: { height: 50, alignItems: "center", justifyContent: "center" },
  lyricCurrent: { fontSize: 18, fontWeight: "bold" },
  lyricNext: { fontSize: 14, color: "#666" },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  timeText: { width: 30, textAlign: "center", color: "#000" },

  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    alignItems: "center",
  },
});

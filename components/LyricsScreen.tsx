import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useRef } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSnapshot } from "valtio";
import { playerStore } from "../stores/playerStore";
import { searchStore } from "../stores/searchStore";

interface LyricLine {
  time: number;
  text: string;
}

const { height } = Dimensions.get("window");

export default function LyricsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const playerSnap = useSnapshot(playerStore);
  const currentTime = Number(playerSnap.currentTime);
  const duration = Number(playerSnap.duration);
  const track = playerSnap.current;
  const isPlaying = playerSnap.isPlaying;

  const coverSource =
    typeof track?.pic === "string" && track.pic.trim().startsWith("http")
      ? { uri: track.pic.trim() }
      : require("../assets/images/bg.jpeg");

  const lyrics: LyricLine[] = useMemo(() => {
    if (!track?.lyrics) return [];
    return track.lyrics
      .split("\n")
      .map((line) => {
        const match = line.match(/\[(\d{2}):(\d{2}\.\d{1,3})\](.*)/);
        if (!match) return null;

        return {
          time: Number(match[1]) * 60 + Number(match[2]),
          text: match[3].trim(),
        };
      })
      .filter((line): line is LyricLine => !!line && !!line.text);
  }, [track?.lyrics]);

  const currentLineIndex = useMemo(() => {
    if (!lyrics.length) return 0;

    let index = 0;
    for (let i = 0; i < lyrics.length; i++) {
      const current = lyrics[i];
      const next = lyrics[i + 1];
      if (currentTime >= current.time && (!next || currentTime < next.time)) {
        index = i;
        break;
      }
    }
    return index;
  }, [currentTime, lyrics]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: Math.max(currentLineIndex * 42 - height * 0.22, 0),
      animated: true,
    });
  }, [currentLineIndex]);

  const togglePlay = async () => {
    if (!track?.url) return;

    if (isPlaying) {
      await playerStore.pause();
    } else {
      if (duration > 0 && currentTime >= duration - 0.5) {
        await playerStore.seek(0);
      }
      await playerStore.play();
    }
  };

  const onSeek = async (value: number) => {
    const safeValue =
      duration > 0 && value >= duration - 0.5 ? duration - 1 : value;
    await playerStore.seek(safeValue);
  };

  const formatTime = (sec: number) => {
    if (!sec || !isFinite(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  return (
    <View style={styles.container}>
      <Image source={coverSource} style={styles.blurBg} blurRadius={42} />
      <View style={styles.mask} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { top: Math.max(insets.top + 8, 24) }]}
      >
        <Ionicons name="chevron-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 54, 78),
            paddingBottom: Math.max(insets.bottom + 22, 36),
          },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.lyricsScroll}
          contentContainerStyle={styles.lyricsContent}
          showsVerticalScrollIndicator={false}
        >
          {lyrics.length ? (
            lyrics.map((line, index) => {
              const isActive = index === currentLineIndex;

              return (
                <Text
                  key={`${line.time}-${index}`}
                  style={[styles.lyricLine, isActive && styles.activeLyric]}
                >
                  {line.text}
                </Text>
              );
            })
          ) : (
            <Text style={styles.emptyLyric}>暂无歌词</Text>
          )}
        </ScrollView>

        <View style={styles.progressRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 0}
            value={currentTime}
            onSlidingComplete={onSeek}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.35)"
            thumbTintColor="#fff"
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => playerStore.previous()}
            disabled={searchStore.selectedList.length === 0}
          >
            <Ionicons name="play-skip-back" size={42} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={72}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => playerStore.next()}
            disabled={searchStore.selectedList.length === 0}
          >
            <Ionicons name="play-skip-forward" size={42} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  blurBg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.12 }],
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.52)",
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricsContent: {
    minHeight: height * 0.56,
    justifyContent: "center",
    paddingVertical: 28,
  },
  lyricLine: {
    minHeight: 42,
    textAlign: "center",
    color: "rgba(255,255,255,0.62)",
    fontSize: 18,
    lineHeight: 30,
    fontWeight: "500",
  },
  activeLyric: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 36,
    fontWeight: "800",
  },
  emptyLyric: {
    textAlign: "center",
    color: "rgba(255,255,255,0.75)",
    fontSize: 18,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    width: 36,
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    textAlign: "center",
  },
  controls: {
    height: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 12,
  },
});

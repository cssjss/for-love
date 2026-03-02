import { Image as ExpoImage } from "expo-image";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSnapshot } from "valtio";
import { favoriteStore, SongItem } from "../stores/favoriteStore";
import { playerStore } from "../stores/playerStore";

export default function FavoriteScreen() {
  const snap = useSnapshot(favoriteStore);

  useEffect(() => {
    favoriteStore.loadInitial(favoriteStore.mainId);
  }, []);

  const onScroll = ({ nativeEvent }: any) => {
    const bottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - 20;
    if (bottom) {
      favoriteStore.loadMore(favoriteStore.mainId);
    }
  };

  const onPressSong = async (song: SongItem) => {
    // 先请求 song info
    const info = await favoriteStore.fetchSongInfo(song.id);
    if (!info) {
      console.warn("获取歌曲信息失败", song.id);
      return;
    }

    const track = {
      id: song.id,
      name: song.name,
      artist: song.artist,
      url: info.url,
      pic: info.pic,
      lyrics: info.lrc ?? "",
    };

    playerStore.setCurrent(track);
    await playerStore.load(track.url);
    playerStore.play();
  };

  const bgPic = snap.list[0]?.pic;

  return (
    <View style={styles.container}>
      <ExpoImage
        source={bgPic ? { uri: bgPic } : undefined}
        style={styles.blurBg}
        blurRadius={50}
        transition={300}
      />
      <View style={styles.mask} />

      <View style={styles.header}>
        <ExpoImage
          source={bgPic ? { uri: bgPic } : undefined}
          style={styles.cover}
        />
        <View style={styles.info}>
          <Text style={styles.title}>歌单</Text>
          <Text style={styles.count}>{snap.list.length} 首</Text>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {snap.list.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={styles.songItem}
            onPress={() => onPressSong(item)}
          >
            <Text style={styles.index}>{idx + 1}</Text>
            <View style={styles.songInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.artist}>{item.artist[0]}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {snap.loading && (
          <View style={{ padding: 20 }}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", position: "relative" },
  blurBg: { position: "absolute", width: "100%", height: "100%" },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cover: { width: 110, height: 110, borderRadius: 10 },
  info: { marginLeft: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  count: { marginTop: 6, color: "rgba(255,255,255,0.7)" },
  list: { paddingHorizontal: 20 },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  index: { width: 30, color: "rgba(255,255,255,0.6)", fontSize: 16 },
  songInfo: { marginLeft: 10 },
  name: { color: "#fff", fontSize: 15 },
  artist: { color: "rgba(255,255,255,0.6)", marginTop: 3, fontSize: 13 },
});

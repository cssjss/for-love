import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSnapshot } from "valtio";
import { playerStore } from "../stores/playerStore";
import { searchStore } from "../stores/searchStore";

export default function SearchPage() {
  const snap = useSnapshot(searchStore);
  // const plst = useSnapshot(playerStore);
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [source, setSource] = useState<{ uri: string } | null>(null);

  const formatName = (name?: string) => (name ? name : "暂无");

  // 点击返回
  const onBack = () => {
    navigation.goBack();
  };

  // 清空输入
  const clear = () => setKeyword("");

  // 搜索功能
  const searchMusics = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSearched(false);
    await searchStore.searchMusic(keyword);
    setLoading(false);
    setSearched(true);
  };

  // 播放音乐
  const playMusic = async (item: string, index: number) => {
    searchStore.indexSelect = index;
    playerStore.index = index;

    console.log("测hi是" + playerStore.current.url);
    // 模拟加载
    playerStore.player();
  };

  // useEffect(() => {
  //   if (playerStore.current.url) {
  //     setSource({ uri: playerStore.current.url });
  //   }
  // }, [playerStore.current.url]);

  // useEffect(() => {
  //   if (source) {
  //     setTimeout(() => {
  //       playerStore.play();
  //       playerStore.isPlaying = true;
  //     }, 50);
  //   }
  // }, [source]);

  return (
    <View style={styles.container}>
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
            onSubmitEditing={searchMusics}
            autoFocus
          />
        </View>

        {keyword.length > 0 && (
          <TouchableOpacity onPress={clear}>
            <Text style={styles.clear}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 加载动画 */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#409eff" />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* “你可能想搜” */}
        {searched && (
          <View style={styles.wantSearch}>
            <Text style={styles.wantTitle}>你可能想搜</Text>

            <View style={styles.suggestCard}>
              <Image
                source={require("../assets/images/tt.jpg")}
                style={styles.suggestAvatar}
              />

              <View style={styles.suggestInfo}>
                <Text style={{ color: "#fff" }}>
                  音乐：{snap.selectedList[0]?.name || "暂无歌曲"} ＞
                </Text>
                <Text style={{ color: "#ccc", marginTop: 4 }}>
                  10w人关注 · 38首歌
                </Text>
              </View>

              <Image
                source={require("../assets/images/play.png")}
                style={styles.suggestPlay}
              />
            </View>
          </View>
        )}

        {/* 搜索列表 */}
        {searched && (
          <View style={styles.musicList}>
            <Text style={styles.listTitle}>歌曲</Text>

            {snap.selectedList.map((song, index) => (
              <TouchableOpacity
                key={song.id}
                style={styles.musicItem}
                onPress={() => playMusic(song.name, index)}
              >
                <View>
                  <Text style={styles.musicName}>{formatName(song.name)}</Text>
                  <Text style={styles.musicArtist}>{song.artist}</Text>
                </View>

                <Image
                  source={require("../assets/images/playgre.png")}
                  style={styles.playIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingTop: 10,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  icon: {
    marginRight: 12,
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
    paddingTop: 5, //  placeholder 往下微调
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
    justifyContent: "space-between",
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
    tintColor: "#fff",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(20,20,20,0.85)",
  },
});

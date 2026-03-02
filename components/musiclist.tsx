import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// 引入上一轮我们封装好的纯净请求函数与类型定义
import { fetchMusicList, MusicItem } from "../stores/musicService";

// 定义组件接收的 Props（比如从上一个页面路由传过来的参数）
interface PlaylistPageProps {
  playlistId: string; // 必传：用于请求歌曲列表
  playlistName: string; // 对应原 Vue 的 publicName
  coverUrl: string; // 对应原 Vue 的 cover
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({
  playlistId,
  playlistName,
  coverUrl,
}) => {
  // 状态管理：使用我们定义的 MusicItem 数组泛型
  const [songs, setSongs] = useState<MusicItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 生命周期：组件挂载或 playlistId 变化时请求数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // 调用纯粹的 service 函数拉取前 20 首歌
      const data = await fetchMusicList(playlistId);
      setSongs(data);
      setIsLoading(false);
    };

    if (playlistId) {
      loadData();
    }
  }, [playlistId]);

  // 模拟原 Vue 中的 playSong 方法
  const handlePlaySong = (index: number, song: MusicItem) => {
    setSelectedIndex(index);
    // 这里未来可以接入你的全局播放器 Store 逻辑
    console.log("正在播放:", song.name);
  };

  // 模拟原 Vue 中的 removeFavorite（心形图标点击）
  const handleLikeClick = (songName: string) => {
    console.log("点击了喜欢/取消喜欢:", songName);
  };

  return (
    <View style={styles.favoritePage}>
      {/* 背景模糊层：使用 RN 原生 blurRadius 替代 CSS filter */}
      <Image source={{ uri: coverUrl }} style={styles.blurBg} blurRadius={30} />
      <View style={styles.mask} />

      {/* 顶部信息区 */}
      <View style={styles.header}>
        <Image source={{ uri: coverUrl }} style={styles.cover} />
        <View style={styles.info}>
          <Text style={styles.title}>{playlistName}</Text>
          <Text style={styles.count}>
            {isLoading ? "加载中..." : `${songs.length} 首`}
          </Text>
        </View>
      </View>

      {/* 歌曲列表区域 */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {songs.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.songItem,
              selectedIndex === index && styles.songItemActive,
            ]}
            activeOpacity={0.7}
            onPress={() => handlePlaySong(index, item)}
          >
            <Text style={styles.index}>{index + 1}</Text>

            <View style={styles.songInfo}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {item.artist}
              </Text>
            </View>

            <TouchableOpacity onPress={() => handleLikeClick(item.name)}>
              <Image
                // 注意：在实际 RN 项目中，本地图片通常放在 assets 目录下使用 require 引入
                // 这里暂时映射你原本的 /static/heart-fill.png 逻辑
                source={require("../assets/heart-fill.png")}
                style={styles.likeIcon}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  favoritePage: {
    flex: 1,
    backgroundColor: "#000", // 增加兜底底色，防止背景图片加载时白屏
  },
  blurBg: {
    ...StyleSheet.absoluteFillObject, // 替代 absolute + inset: 0
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.1 }], // 防止模糊边缘漏出黑边
    zIndex: 0,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 1,
  },
  header: {
    position: "relative",
    zIndex: 2,
    flexDirection: "row", // 显式声明水平排列
    alignItems: "center",
    paddingTop: 60, // 120rpx / 2
    paddingHorizontal: 25, // 50rpx / 2
    paddingBottom: 20, // 40rpx / 2
  },
  cover: {
    width: 90,
    height: 90,
    borderRadius: 12,
    // RN 的双平台阴影机制
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  info: {
    marginLeft: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff", // RN 文本不继承父级颜色，必须显式声明
    marginBottom: 5,
  },
  count: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
  },
  list: {
    position: "relative",
    zIndex: 2,
    flex: 1, // 抛弃低效的 calc，使用 flex 原生撑满剩余可用高度
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, // 原生极细边框
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  songItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  index: {
    width: 25,
    textAlign: "center",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  songInfo: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff",
  },
  artist: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 3,
  },
  likeIcon: {
    width: 20,
    height: 20,
    marginRight: 25,
  },
});
export default PlaylistPage;

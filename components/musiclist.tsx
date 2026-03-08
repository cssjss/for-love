import { playerStore } from "@/stores/playerStore";
import { NavigatorScreenParams, RouteProp } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
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
import { fetchMusicList, MusicItem } from "../stores/musicService";
import { searchStore } from "../stores/searchStore";
import MusicPlayerLitt from "./MusicplayLitt";
export type TopTabParamList = {
  发现: undefined;
  播放: undefined;
  我的: undefined;
};
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TopTabParamList>;
  SearchPage: undefined;
  Musiclist: {
    playlistId: string;
    playlistName: string;
    coverUrl: any;
  };
  MyFavoriteScreen: undefined;
  HistoryScreen: undefined;
};

type MusiclistRouteProp = RouteProp<RootStackParamList, "Musiclist">;

//重构组件的 Props 接口：只接收 React Navigation 注入的 route 对象
interface MusiclistProps {
  route: MusiclistRouteProp;
}

const Musiclist: React.FC<MusiclistProps> = ({ route }) => {
  const { playlistId, playlistName, coverUrl } = route.params;
  const [playerVisible, setPlayerVisible] = useState(false);
  const { height } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(height)).current; // 初始在底部
  const EXPANDED_Y = height * 0.3;
  let imageSource;

  if (typeof coverUrl === "string") {
    imageSource = (coverUrl as string).startsWith("http")
      ? { uri: coverUrl }
      : { uri: "https://via.placeholder.com/150/333333/FFFFFF?text=No+Cover" };
  } else {
    imageSource = coverUrl;
  }
  const [songs, setSongs] = useState<MusicItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchMusicList(playlistId);
      searchStore.onlyPlay = data;
      setSongs(data);
      setIsLoading(false);
    };

    if (playlistId) {
      loadData();
    }
  }, [playlistId]);
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

  const handlePlaySong = async (id: string, index: number) => {
    setIsLoading(true);
    await searchStore.fetchMusicUrl(id);
    setIsLoading(false);
    setPlayerVisible(true);
    setSelectedIndex(index);
    searchStore.indexSelect = index;
    playerStore.index = index;
    playerStore.player();
  };

  // 心形图标
  const handleLikeClick = (songName: string) => {
    console.log("点击了喜欢/取消喜欢:", songName);
  };

  return (
    <View style={styles.favoritePage}>
      <Image source={imageSource} style={styles.blurBg} blurRadius={30} />
      <View style={styles.mask} />

      {/* 顶部信息区 */}
      <View style={styles.header}>
        <Image source={imageSource} style={styles.cover} />
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
            onPress={() => handlePlaySong(item.id, index)}
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
                source={
                  selectedIndex === index
                    ? require("../assets/images/play.png")
                    : require("../assets/images/playgre.png")
                }
                style={styles.likeIcon}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  favoritePage: {
    flex: 1,
    backgroundColor: "#000",
  },
  blurBg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.1 }],
    zIndex: 0,
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
    paddingHorizontal: 0,
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
export default Musiclist;

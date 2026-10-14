import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUESS_TOPLIST_ID } from "../stores/musicService";
import { RootStackParamList } from "./musiclist";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2; // 卡片宽度（两列）
const CARD_HEIGHT = CARD_WIDTH * 0.75;

type Category = "toplist" | "album" | "playlist";

interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  img: ImageSourcePropType;
}

const categories: { key: Category; title: string }[] = [
  { key: "toplist", title: "榜单" },
  { key: "album", title: "专辑" },
  { key: "playlist", title: "歌单" },
];

const playlistCards: CardItem[] = [
  {
    id: "7708473166",
    title: "抖音热歌",
    subtitle: "超好听的神仙歌曲",
    img: require("../assets/images/dayup.jpg"),
  },
  {
    id: "7520334743",
    title: "爆款收割机！",
    subtitle: "时下流行热歌合集",
    img: require("../assets/images/rg.jpg"),
  },
  {
    id: "7726401548",
    title: "粤语经典",
    subtitle: "时光沉淀的旋律",
    img: require("../assets/images/syjh.jpg"),
  },
  {
    id: "7891796835",
    title: "『伤感DJ』",
    subtitle: "爱得够真就恨得越深",
    img: require("../assets/images/yy.jpg"),
  },
  {
    id: "2369367927",
    title: "跑步热单",
    subtitle: "听完只想绕着操场跑200圈 ",
    img: require("../assets/images/run.jpg"),
  },
  {
    id: "2033981272",
    title: "我爱你",
    subtitle: "音乐里那些不言而喻的“我爱你”",
    img: require("../assets/images/whxx.jpg"),
  },
  {
    id: "9110741376",
    title: "100首车载DJ",
    subtitle: "植入抗疲劳神曲",
    img: require("../assets/images/ygdj.jpg"),
  },
  {
    id: "7061860252",
    title: "温柔华语",
    subtitle: "把故事藏在歌中",
    img: require("../assets/images/dyrg.jpg"),
  },
  {
    id: "7268132709",
    title: "最·邓紫棋",
    subtitle: "QQ音乐官方歌单",
    img: require("../assets/images/whxx.jpg"),
  },
  {
    id: "7039749142",
    title: "周杰伦",
    subtitle: "百听不厌的周杰伦",
    img: require("../assets/images/jdlg.jpg"),
  },
];

const toplistCards: CardItem[] = [
  {
    id: GUESS_TOPLIST_ID,
    title: "猜你喜欢",
    subtitle: "各榜单前十首精选",
    img: require("../assets/toplist/guess.jpg"),
  },
  {
    id: "62",
    title: "飙升榜",
    subtitle: "热度上涨最快的歌曲",
    img: require("../assets/toplist/soaring.jpg"),
  },
  {
    id: "26",
    title: "热歌榜",
    subtitle: "全站热门播放歌曲",
    img: require("../assets/toplist/hot.jpg"),
  },
  {
    id: "27",
    title: "新歌榜",
    subtitle: "最新发布的好声音",
    img: require("../assets/toplist/new.jpg"),
  },
  {
    id: "4",
    title: "流行指数榜",
    subtitle: "当下流行趋势精选",
    img: require("../assets/toplist/pop-index.jpg"),
  },
  {
    id: "67",
    title: "听歌识曲榜",
    subtitle: "大家正在识别的旋律",
    img: require("../assets/toplist/recognition.jpg"),
  },
  {
    id: "5",
    title: "内地榜",
    subtitle: "华语内地热门歌曲",
    img: require("../assets/toplist/mainland.jpg"),
  },
  {
    id: "59",
    title: "香港地区榜",
    subtitle: "港乐热度风向",
    img: require("../assets/toplist/hongkong.jpg"),
  },
  {
    id: "63",
    title: "DJ舞曲榜",
    subtitle: "节奏感拉满的舞曲",
    img: require("../assets/toplist/dj.jpg"),
  },
  {
    id: "28",
    title: "网络歌曲榜",
    subtitle: "网络热门歌曲集合",
    img: require("../assets/toplist/internet.jpg"),
  },
  {
    id: "60",
    title: "抖音热歌榜",
    subtitle: "短视频热门旋律",
    img: require("../assets/toplist/douyin.jpg"),
  },
  {
    id: "65",
    title: "国风热歌榜",
    subtitle: "国风音乐热门精选",
    img: require("../assets/toplist/chinese-style.jpg"),
  },
  {
    id: "72",
    title: "动漫音乐榜",
    subtitle: "动漫相关热门音乐",
    img: require("../assets/toplist/anime.jpg"),
  },
];

export default function DiscoverScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<Category>("toplist");
  const visibleCards =
    activeCategory === "toplist" ? toplistCards : playlistCards;

  const ToPage = (
    id: string,
    name: string,
    pidurl: number | ImageSourcePropType,
    listKind: "toplist" | "playlist",
  ) => {
    console.log("pidceshi" + String(id));
    navigation.navigate("Musiclist", {
      playlistId: String(id),
      playlistName: String(name),
      coverUrl: pidurl,
      listKind,
    });
  };
  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 16) },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SearchPage" as never)}
          style={styles.fakeSearchBox}
        >
          <Image
            source={require("../assets/images/search.png")}
            style={styles.searchIcon}
          />
          <Text style={styles.fakeSearchText}>搜索歌手、歌曲或专辑名</Text>
        </TouchableOpacity>

        <View style={styles.categoryBar}>
          {categories.map((item) => {
            const isActive = activeCategory === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.85}
                onPress={() => setActiveCategory(item.key)}
                style={[
                  styles.categoryItem,
                  isActive && styles.categoryItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 标题 */}
        <View style={styles.titleRow}>
          <Image
            source={require("../assets/images/tt.jpg")}
            style={styles.avatar}
          />
          <Text style={styles.titleText}>
            {activeCategory === "toplist"
              ? "热门榜单，看看大家都在听"
              : activeCategory === "playlist"
                ? "为你推荐，每天来点新模式"
                : "专辑功能预留中"}
          </Text>
        </View>

        {/* 卡片网格 */}
        {activeCategory === "album" ? (
          <View style={styles.albumEmpty}>
            <Image
              source={require("../assets/images/tidal.png")}
              style={styles.albumIcon}
            />
            <Text style={styles.albumTitle}>专辑</Text>
            <Text style={styles.albumText}>功能预留中</Text>
          </View>
        ) : (
          <View style={styles.cardWrapper}>
            {visibleCards.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() =>
                  ToPage(
                    item.id,
                    item.title,
                    item.img,
                    activeCategory === "toplist" ? "toplist" : "playlist",
                  )
                }
              >
                <ImageBackground
                  source={item.img}
                  style={styles.card}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.cardMask} />

                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // 深色主题
    paddingHorizontal: 16,
  },

  searchIcon: {
    width: 22,
    height: 22,
    tintColor: "rgba(255,255,255,0.7)",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 50,
    marginRight: 8,
  },

  titleText: {
    fontSize: 16,
    color: "#070707ff",
    fontWeight: "500",
  },

  categoryBar: {
    flexDirection: "row",
    height: 40,
    padding: 3,
    marginBottom: 18,
    borderRadius: 22,
    backgroundColor: "rgba(32, 29, 29, 0.08)",
  },

  categoryItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },

  categoryItemActive: {
    backgroundColor: "#31c27c",
  },

  categoryText: {
    fontSize: 15,
    color: "rgba(19, 17, 17, 0.65)",
    fontWeight: "600",
  },

  categoryTextActive: {
    color: "#fff",
  },

  cardWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    padding: 12,
    justifyContent: "flex-end",
  },

  cardMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  albumEmpty: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(49, 194, 124, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(49, 194, 124, 0.25)",
  },

  albumIcon: {
    width: 58,
    height: 58,
    marginBottom: 12,
    opacity: 0.75,
  },

  albumTitle: {
    fontSize: 20,
    color: "#111",
    fontWeight: "700",
  },

  albumText: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(19, 17, 17, 0.55)",
  },
  fakeSearchBox: {
    height: 40,
    borderRadius: 22,
    backgroundColor: "rgba(32, 29, 29, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(19, 18, 18, 0.1)",
  },

  fakeSearchText: {
    color: "rgba(19, 17, 17, 0.6)",
    fontSize: 15,
    marginLeft: 10,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2; // 卡片宽度（两列）
const CARD_HEIGHT = CARD_WIDTH * 0.75;

interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  img: any; // require 图片
}

const cards: CardItem[] = [
  {
    id: "taylor",
    title: "Taylor Swift",
    subtitle: "14 座格莱美大奖书写传奇",
    img: require("../assets//images/dayup.jpg"),
  },
  {
    id: "girl",
    title: "缓解压力 Master",
    subtitle: "根据你的喜好推荐歌手",
    img: require("../assets//images/rg.jpg"),
  },
  {
    id: "japan",
    title: "超浪漫日语歌",
    subtitle: "浪漫在空气中发酵",
    img: require("../assets//images/run.jpg"),
  },
  {
    id: "sleep",
    title: "助眠",
    subtitle: "超助眠歌单！睡前听点温柔的歌～",
    img: require("../assets//images/yy.jpg"),
  },
  {
    id: "classic",
    title: "70年欧美流行",
    subtitle: "流行佳曲永不过时",
    img: require("../assets//images/syjh.jpg"),
  },
  {
    id: "wash",
    title: "洗澡",
    subtitle: "在软绵泡沫和香气中逃跑",
    img: require("../assets//images/whxx.jpg"),
  },
  {
    id: "relax",
    title: "放松冥想",
    subtitle: "跟着呼吸放松自己",
    img: require("../assets//images/ygdj.jpg"),
  },
  {
    id: "sport",
    title: "运动听朋友",
    subtitle: "一个朋友的日常",
    img: require("../assets//images/dyrg.jpg"),
  },
  {
    id: "happy",
    title: "开心的粤语歌",
    subtitle: "",
    img: require("../assets//images/whxx.jpg"),
  },
  {
    id: "peace",
    title: "躺平",
    subtitle: "",
    img: require("../assets//images/jdlg.jpg"),
  },
];

export default function DiscoverScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
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

        {/* 标题 */}
        <View style={styles.titleRow}>
          <Image
            source={require("../assets/images/tt.jpg")}
            style={styles.avatar}
          />
          <Text style={styles.titleText}>为你推荐，每天来点新模式</Text>
        </View>

        {/* 卡片网格 */}
        <View style={styles.cardWrapper}>
          {cards.map((item) => (
            <TouchableOpacity key={item.id} activeOpacity={0.85}>
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

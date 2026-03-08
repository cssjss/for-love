import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
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
import { RootStackParamList } from "./musiclist";
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

export default function DiscoverScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const ToPage = (
    id: string,
    name: string,
    pidurl: number | ImageSourcePropType,
  ) => {
    navigation.navigate("Musiclist", {
      playlistId: String(id),
      playlistName: String(name),
      coverUrl: pidurl,
    });
  };
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
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => ToPage(item.id, item.title, item.img)}
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

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface SourceItem {
  id: string;
  name: string;
}

export default function MyScreen() {
  const navigation = useNavigation();

  const [activeItem, setActiveItem] = useState<string>("");
  const [showSourceList, setShowSourceList] = useState(false);
  const [currentSource, setCurrentSource] = useState("qq");
  const [showVersion, setShowVersion] = useState(false);

  const sourceList: SourceItem[] = [
    { id: "qq", name: "QQ音乐" },
    { id: "wy", name: "网易云音乐" },
  ];

  const press = (key: string) => setActiveItem(key);
  const release = () => setTimeout(() => setActiveItem(""), 150);

  return (
    <View style={styles.container}>
      {/* 顶部封面 */}
      <View style={styles.photoBox}>
        <Image
          source={require("../assets/images/psbg.png")}
          style={styles.photo}
          resizeMode="cover"
        />
      </View>

      {/* 我的喜欢 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("LovePage" as never)}
        onPressIn={() => press("likes")}
        onPressOut={release}
        style={[styles.item, activeItem === "likes" && styles.itemActive]}
      >
        <Image
          source={require("../assets/images/ico1.png")}
          style={styles.icon}
        />
        <Text style={styles.itemText}>我的喜欢</Text>
        <Image
          source={require("../assets/images/trunrigt.png")}
          style={styles.arrow}
        />
      </TouchableOpacity>

      {/* 历史播放 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("HistoryPage" as never)}
        onPressIn={() => press("history")}
        onPressOut={release}
        style={[styles.item, activeItem === "history" && styles.itemActive]}
      >
        <Image
          source={require("../assets/images/ico2.png")}
          style={styles.icon}
        />
        <Text style={styles.itemText}>历史播放</Text>
        <Image
          source={require("../assets/images/trunrigt.png")}
          style={styles.arrow}
        />
      </TouchableOpacity>

      {/* 播放源 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => press("source")}
        onPressOut={release}
        onPress={() => setShowSourceList(true)}
        style={[styles.item, activeItem === "source" && styles.itemActive]}
      >
        <Image
          source={require("../assets/images/ico3.png")}
          style={styles.icons}
        />
        <Text style={styles.itemText}>播放源：</Text>
        <Text style={styles.grayText}>
          {currentSource === "qq" ? "QQ音乐" : "网易云音乐"}
        </Text>
      </TouchableOpacity>

      {/* 版本号 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => press("version")}
        onPressOut={release}
        onPress={() => setShowVersion(true)}
        style={[styles.item, activeItem === "version" && styles.itemActive]}
      >
        <Image
          source={require("../assets/images/ico4.png")}
          style={styles.icons}
        />
        <Text style={styles.itemText}>版本号：</Text>
        <Text style={styles.grayText}>1.0.0</Text>
      </TouchableOpacity>

      {/* 音乐源弹窗 */}
      <Modal transparent visible={showSourceList} animationType="fade">
        <View style={styles.modalMask}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>请选择播放源</Text>
            {sourceList.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  setCurrentSource(item.id);
                  setShowSourceList(false);
                }}
              >
                <Text style={styles.modalConfirm}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* 版本号弹窗 */}
      <Modal transparent visible={showVersion} animationType="fade">
        <View style={styles.modalMask}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>版本信息</Text>
            <Text style={styles.modalText}>当前版本：1.0.0</Text>
            <Text style={styles.modalText}>作者：GD音乐播放器</Text>

            <Pressable onPress={() => setShowVersion(false)}>
              <Text style={styles.modalConfirm}>知道了</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  photoBox: {
    width: "90%",
    height: 200,
    alignSelf: "center",
    borderRadius: 20,
    overflow: "hidden",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  item: {
    marginTop: 12,
    height: 60,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "rgba(56, 182, 119, 0.25)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  itemActive: {
    backgroundColor: "rgba(255,255,255,0.45)",
  },

  itemText: {
    color: "#131212ff",
    fontSize: 18,
  },

  icon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  icons: {
    width: 40,
    height: 40,
    marginLeft: -5,
    marginRight: 10,
  },
  arrow: {
    width: 24,
    height: 24,
    marginLeft: "auto",
  },

  grayText: {
    marginLeft: "auto",
    color: "rgba(8, 8, 8, 0.5)",
    fontSize: 16,
  },

  sourceItem: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  sourceActive: {
    borderColor: "#007aff",
    borderWidth: 2,
    backgroundColor: "rgba(0,122,255,0.08)",
  },

  sourceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },

  check: {
    fontSize: 24,
    color: "#007aff",
    fontWeight: "bold",
  },

  modalMask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: 260,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },

  modalConfirm: {
    color: "#007aff",
    marginTop: 12,
    fontSize: 16,
  },
});

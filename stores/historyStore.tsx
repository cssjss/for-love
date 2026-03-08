import AsyncStorage from "@react-native-async-storage/async-storage";
import { proxy } from "valtio";
import { MusicItem } from "./musicService";

interface HistoryStoreState {
  historyList: MusicItem[];
  isInitialized: boolean;
}

export const historyStore = proxy<HistoryStoreState>({
  historyList: [],
  isInitialized: false,
});

// 初始化读取本地缓存
export const initHistoryStore = async () => {
  try {
    const storedHistory = await AsyncStorage.getItem("my_history_songs");
    if (storedHistory) {
      historyStore.historyList = JSON.parse(storedHistory);
    }
  } catch (error) {
    console.error("读取历史播放记录失败:", error);
  } finally {
    historyStore.isInitialized = true;
  }
};

export const addHistory = (song: MusicItem) => {
  const index = historyStore.historyList.findIndex(
    (item) => item.id === song.id,
  );
  if (index > -1) {
    // 如果已经在历史记录里，先删掉它
    historyStore.historyList.splice(index, 1);
  }
  // 把它插到数组的最前面（
  historyStore.historyList.unshift(song);

  // 限制历史记录最多只存 100 首，防止本地文件过大
  if (historyStore.historyList.length > 100) {
    historyStore.historyList.pop();
  }
};

export const clearHistory = () => {
  historyStore.historyList = [];
};

initHistoryStore();

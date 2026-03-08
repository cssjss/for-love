// stores/searchHistoryStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { proxy, subscribe } from "valtio";

interface SearchHistoryState {
  history: string[];
}

export const searchHistoryStore = proxy<SearchHistoryState>({
  history: [],
});

// 初始化读取
export const initSearchHistory = async () => {
  try {
    const stored = await AsyncStorage.getItem("my_search_history");
    if (stored) {
      searchHistoryStore.history = JSON.parse(stored);
    }
  } catch (error) {
    console.error("读取搜索历史失败:", error);
  }
};

// 监听并保存
subscribe(searchHistoryStore, () => {
  AsyncStorage.setItem(
    "my_search_history",
    JSON.stringify(searchHistoryStore.history),
  );
});

// 添加记录（去重，排到最前面，最多留 20 条）
export const addSearchHistory = (keyword: string) => {
  const kw = keyword.trim();
  if (!kw) return;

  const index = searchHistoryStore.history.indexOf(kw);
  if (index > -1) {
    searchHistoryStore.history.splice(index, 1);
  }
  searchHistoryStore.history.unshift(kw);

  if (searchHistoryStore.history.length > 20) {
    searchHistoryStore.history.pop();
  }
};

// 清空记录
export const clearSearchHistory = () => {
  searchHistoryStore.history = [];
};

initSearchHistory();

import AsyncStorage from "@react-native-async-storage/async-storage";
import { proxy, subscribe } from "valtio";
import { MusicItem } from "./musicService";

interface FavoriteStoreState {
  favorites: MusicItem[];
  isInitialized: boolean;
}

// 创建全局响应式代理状态
export const favoriteStore = proxy<FavoriteStoreState>({
  favorites: [],
  isInitialized: false, // 用于标记是否已经从本地读取完毕
});

// App 启动时从本地读取缓存
export const initFavoriteStore = async () => {
  try {
    const storedFavs = await AsyncStorage.getItem("my_favorite_songs");
    if (storedFavs) {
      favoriteStore.favorites = JSON.parse(storedFavs);
    }
  } catch (error) {
    console.error("读取本地收藏数据失败:", error);
  } finally {
    favoriteStore.isInitialized = true;
  }
};

//监听 favorites 的任何变化，自动保存到本地
subscribe(favoriteStore, () => {
  AsyncStorage.setItem(
    "my_favorite_songs",
    JSON.stringify(favoriteStore.favorites),
  ).catch((err) => console.error("保存收藏数据失败:", err));
});

//暴露全局操作方法（Action）
export const toggleFavorite = (song: MusicItem) => {
  const index = favoriteStore.favorites.findIndex(
    (item) => item.id === song.id,
  );
  if (index > -1) {
    // 如果已经存在，说明是取消喜欢，从数组中剔除
    favoriteStore.favorites.splice(index, 1);
  } else {
    // 如果不存在，追加到数组末尾（或者 unshift 加到头部）
    favoriteStore.favorites.push(song);
  }
};

// 立即触发初始化读取
initFavoriteStore();

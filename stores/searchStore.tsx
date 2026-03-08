import { proxy } from "valtio";
// import { subscribeKey } from "valtio/utils";
import { addHistory } from "./historyStore";
// ----------- 类型定义 ----------
export interface MusicItem {
  id: string;
  name?: string;
  artist?: string;
  pic?: string;
  url?: string;
  lyrics?: string;
}

export interface MusicDetail {
  id: string;
  name: string;
  artist: string;
  url: string;
  pic: string;
  lyrics: string;
}

export const searchStore = proxy({
  // 音乐播放列表
  onlyPlay: [] as MusicItem[],

  // 当前选中索引
  indexSelect: -1,

  // 当前播放音乐信息
  selectedList: [] as MusicDetail[],

  // 当前搜索音乐源
  musicSource: "qq",

  // API KEY
  key: "9d16990ac15846c0b4e65da6e6094522",

  // 加载动画
  loading: false,

  // 是否搜索过
  searched: false,

  // 公开歌手名称
  publicName: "",

  // 搜索封面
  cover: "",

  // ------- 搜索音乐 --------
  async searchMusic(keyword: string) {
    searchStore.loading = true;
    searchStore.selectedList = [];
    searchStore.onlyPlay = [];
    try {
      const url = `https://myhkw.cn/open/music/search?key=${searchStore.key}&name=${keyword}&type=${searchStore.musicSource}&page=1&limit=20&format=1&pic=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data) {
        searchStore.onlyPlay = data.data;
        searchStore.searched = true;
        //  立刻启动批量请求歌曲详情
        // searchStore.prefetchAllMusic();
      } else {
        console.log("请求超时！");
      }
    } catch (e) {
      console.log("网络错误", e);
    }

    searchStore.loading = false;
  },

  // ------- 获取歌曲详细信息 -------
  async fetchMusicUrl(id: string) {
    searchStore.selectedList = [];
    try {
      const url = `https://myhkw.cn/open/music/info?key=${searchStore.key}&id=${id}&type=${searchStore.musicSource}&pic=1&url=1&lrc=1`;

      const res = await fetch(url);
      const detail = await res.json();

      if (detail?.data) {
        const songDetail = {
          id: id,
          name: detail.data.name,
          artist: detail.data.artist,
          url: detail.data.url,
          pic: detail.data.pic,
          lyrics: detail.data.lrc,
        };
        searchStore.selectedList.push(songDetail);
        // 出发历史记录
        addHistory(songDetail);
      } else {
        throw new Error("歌曲信息获取失败");
      }
    } catch (err) {
      console.log("网络错误", err);
      throw err;
    }
  },
});

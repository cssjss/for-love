import { proxy } from "valtio";
import { searchStore } from "./searchStore";

export interface SongItem {
  id: string;
  name: string;
  artist: string[];
  pic?: string;
  url?: string;
  lyrics?: string;
}

export const favoriteStore = proxy({
  list: [] as SongItem[],
  loading: false,
  hasMore: true,
  cursor: 0,

  /** 拉歌单列表（不包含 url / lrc / pic） */
  async fetchList() {
    const api = `https://myhkw.cn/open/music/list?key=${searchStore.key}&id=${searchStore.playlistId}&type=${searchStore.musicSource}&format=1`;
    const res = await fetch(api);
    const json = await res.json();
    if (!json?.data || !Array.isArray(json.data)) {
      return [];
    }
    return json.data as SongItem[];
  },

  /** 获取单首歌曲详细信息（包含 url, pic, lrc） */
  async fetchSongInfo(id: string) {
    const api = `https://myhkw.cn/open/music/info?key=${searchStore.key}&id=${id}&type=${searchStore.musicSource}&pic=1&url=1&lrc=1`;
    const res = await fetch(api);
    const json = await res.json();
    if (!json?.data) {
      return null;
    }
    return json.data as {
      url: string;
      pic: string;
      lrc?: string;
    };
  },

  /** 初次加载前 N 首（比如 15 首） */
  async loadInitial(count = 15) {
    if (this.loading) return;
    this.loading = true;

    const list = await this.fetchList();
    const chunk = list.slice(0, count);

    this.list = chunk;
    this.cursor = chunk.length;
    this.hasMore = this.cursor < list.length;

    this.loading = false;
  },

  /** 加载更多（每次 +10 首） */
  async loadMore(addCount = 10) {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    const list = await this.fetchList();
    const next = list.slice(this.cursor, this.cursor + addCount);
    this.cursor += next.length;
    this.hasMore = this.cursor < list.length;

    this.list = [...this.list, ...next];
    this.loading = false;
  },
});

import { proxy } from "valtio";
import { searchStore } from "./searchStore";

export interface SongItem {
  id: string;
  name: string;
  artist: string[] | readonly string[];
  pic?: string;
  url?: string;
  lyrics?: string;
}

export const favoriteStore = proxy({
  list: [] as SongItem[],
  loading: false,
  hasMore: true,
  cursor: 0,
  mainId: "",

  /** 拉歌单 */
  async fetchList(id: string) {
    const api = `https://myhkw.cn/open/music/list?key=${searchStore.key}&id=${id}&type=${searchStore.musicSource}&format=1`;
    const res = await fetch(api);
    const json = await res.json();
    if (!json?.data || !Array.isArray(json.data)) {
      return [];
    }
    return json.data as SongItem[];
  },

  /** 获取单首歌曲详细信息**/
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

  /** 初次加载前 N 首 */
  async loadInitial(id: string) {
    if (this.loading) return;
    this.loading = true;

    const list = await this.fetchList(id);
    const chunk = list.slice(0, 15);

    this.list = chunk;
    this.cursor = chunk.length;
    this.hasMore = this.cursor < list.length;

    this.loading = false;
  },

  /** 加载更多*/
  async loadMore(id: string) {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    const list = await this.fetchList(id);
    const next = list.slice(this.cursor, this.cursor + 10);
    this.cursor += next.length;
    this.hasMore = this.cursor < list.length;

    this.list = [...this.list, ...next];
    this.loading = false;
  },
});

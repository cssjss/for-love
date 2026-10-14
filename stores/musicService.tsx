export interface MusicItem {
  id: string;
  name: string;
  artist: string;
}

export type MusicListKind = "playlist" | "toplist";
export const GUESS_TOPLIST_ID = "guess-you-like";
const API_KEY = "9d16990ac15846c0b4e65da6e6094522";
const TOPLIST_IDS = [
  "62",
  "26",
  "27",
  "4",
  "67",
  "5",
  "59",
  "63",
  "28",
  "60",
  "65",
  "72",
];

interface ApiData {
  songId?: string[];
  songName?: string[];
  artistName?: string[];
}

// 定义后端响应体的根结构
interface ApiResponse {
  code: number;
  msg: string;
  data?: ApiData;
}

const normalizeMusicList = (responseData?: ApiData): MusicItem[] => {
  if (
    !responseData ||
    !Array.isArray(responseData.songId) ||
    !Array.isArray(responseData.songName) ||
    !Array.isArray(responseData.artistName)
  ) {
    throw new Error("接口返回数据异常");
  }

  const { songId, songName, artistName } = responseData;
  const limit = Math.min(songId.length, songName.length, artistName.length);
  const musicList: MusicItem[] = [];

  for (let i = 0; i < limit; i++) {
    musicList.push({
      id: songId[i] || "未知ID",
      name: songName[i] || "未知歌名",
      artist: artistName[i] || "未知歌手",
    });
  }

  return musicList;
};

const fetchApiMusicList = async (
  playlistId: string,
  kind: MusicListKind,
): Promise<MusicItem[]> => {
  const API_BASE_URL = `https://myhkw.cn/open/music/${
    kind === "toplist" ? "toplist" : "list"
  }`;
  const url = `${API_BASE_URL}?key=${API_KEY}&id=${playlistId}&type=qq&format=1`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP 通信异常，状态码: ${response.status}`);
  }

  const result = (await response.json()) as ApiResponse;
  return normalizeMusicList(result?.data);
};

const fetchGuessToplist = async (): Promise<MusicItem[]> => {
  const toplists = await Promise.all(
    TOPLIST_IDS.map(async (id) => {
      try {
        return (await fetchApiMusicList(id, "toplist")).slice(0, 10);
      } catch (error) {
        console.error(`获取榜单 ${id} 失败:`, error);
        return [];
      }
    }),
  );

  return toplists.flat();
};

/**
 * @param playlistId
 * @returns 清洗后的音乐列表数组 Promise
 */
export const fetchMusicList = async (
  playlistId: string,
  kind: MusicListKind = "playlist",
): Promise<MusicItem[]> => {
  try {
    if (kind === "toplist" && playlistId === GUESS_TOPLIST_ID) {
      return await fetchGuessToplist();
    }

    return await fetchApiMusicList(playlistId, kind);
  } catch (error) {
    console.error("获取歌单失败:", error);
    return [];
  }
};

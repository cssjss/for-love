export interface MusicItem {
  id: string;
  name: string;
  artist: string;
}

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

/**
 * @param playlistId
 * @returns 清洗后的音乐列表数组 Promise
 */
export const fetchMusicList = async (
  playlistId: string,
): Promise<MusicItem[]> => {
  const API_BASE_URL = "https://myhkw.cn/open/music/list";
  const API_KEY = "9d16990ac15846c0b4e65da6e6094522";

  try {
    const url = `${API_BASE_URL}?key=${API_KEY}&id=${playlistId}&type=qq&format=1`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP 通信异常，状态码: ${response.status}`);
    }

    const result = (await response.json()) as ApiResponse;
    const responseData = result?.data;

    if (
      !responseData ||
      !Array.isArray(responseData.songId) ||
      !Array.isArray(responseData.songName) ||
      !Array.isArray(responseData.artistName)
    ) {
      throw new Error("接口返回数据异常");
    }

    const { songId, songName, artistName } = responseData;

    // 使用传统 for 循环精准提取前 20 项，避免全量遍历数组的开销
    const limit = Math.min(20, songId.length);
    const musicList: MusicItem[] = [];

    for (let i = 0; i < limit; i++) {
      musicList.push({
        id: songId[i] || "未知ID",
        name: songName[i] || "未知歌名",
        artist: artistName[i] || "未知歌手",
      });
    }

    return musicList;
  } catch (error) {
    console.error("获取歌单失败:", error);
    return [];
  }
};

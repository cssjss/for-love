import { proxy } from "valtio";
import { searchStore } from "./searchStore";

export const playerStore = proxy({
  // 播放器实例App.tsx注入
  audio: null as any,

  // 当前播放状态
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  buffered: 0,
  ended: false,
  _progressTimer: null as any,
  // 当前播放索引
  index: 0,

  // 当前歌曲
  current: {
    id: "",
    url: "",
    name: "",
    artist: "",
    pic: "",
    lyrics: "",
  },
  // 由全局注入播放器实例
  injectAudioInstance(player: any) {
    playerStore.audio = player;
    console.log("全局播放器实例注入成功");
  },
  //设置当前歌曲
  setCurrent(track: any) {
    playerStore.current = {
      id: track.id,
      url: track.url,
      name: track.name,
      artist: track.artist,
      pic: track.pic,
      lyrics: track.lrc,
    };
  },
  // 拖动
  seek(sec: number) {
    if (!playerStore.audio) return;
    playerStore.audio.seek(sec);
    playerStore.currentTime = sec;
  },
  // 启动播放器进度轮询
  startProgressLoop() {
    if (playerStore._progressTimer) return; // 不重复启动

    playerStore._progressTimer = setInterval(async () => {
      const audio = playerStore.audio;
      if (!audio || !audio.getStatus) return;

      const status = await audio.getStatus();
      playerStore.currentTime = status.position ?? 0;
      playerStore.duration = status.duration ?? 0;
    }, 300);
  },
  async load(url: string) {
    if (!playerStore.audio) return;

    try {
      await playerStore.audio.replace(url);
      playerStore.isPlaying = false;
    } catch (err) {
      console.warn("加载失败:", err);
    }
  },
  // 点击播放
  async player() {
    const trcks = searchStore.selectedList[playerStore.index];
    playerStore.setCurrent(trcks);
    await playerStore.load(trcks.url);
    playerStore.play();
    playerStore.isPlaying = true;
  },
  // 播放
  play() {
    try {
      playerStore.audio?.play();
      playerStore.isPlaying = true;
    } catch (err) {
      console.log("播放失败:", err);
    }
  },
  //暂停
  pause() {
    try {
      playerStore.audio?.pause();
      playerStore.isPlaying = false;
    } catch (err) {
      console.log("暂停失败:", err);
    }
  },

  //下一首
  async next() {
    const list = searchStore.selectedList;
    if (list.length === 0) return;

    playerStore.index++;
    if (playerStore.index >= list.length) playerStore.index = 0;

    const nextTrack = list[playerStore.index];
    playerStore.setCurrent(nextTrack);
    await playerStore.load(nextTrack.url);
    playerStore.play();
  },

  //上一首
  async previous() {
    const list = searchStore.selectedList;
    if (list.length === 0) return;

    playerStore.index--;
    if (playerStore.index < 0) playerStore.index = list.length - 1;

    const prevTrack = list[playerStore.index];
    playerStore.setCurrent(prevTrack);
    await playerStore.load(prevTrack.url);
    playerStore.play();
  },
});

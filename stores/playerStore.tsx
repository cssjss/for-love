import TrackPlayer, { Event, State } from "react-native-track-player";
import { proxy } from "valtio";
import { searchStore } from "./searchStore";

export type PlayMode = "list" | "single" | "shuffle";

let progressInterval: ReturnType<typeof setInterval> | null = null;
let endTransitionLocked = false;

const startProgressSync = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }

  progressInterval = setInterval(async () => {
    try {
      const progress = await TrackPlayer.getProgress();
      playerStore.currentTime = progress.position;
      playerStore.duration = progress.duration;
    } catch (error) {
      console.log("同步播放进度失败", error);
    }
  }, 500);
};

const stopProgressSync = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

const getRandomIndex = (currentIndex: number, total: number) => {
  if (total <= 1) return 0;

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * total);
  }

  return nextIndex;
};

export const playerStore = proxy({
  // 播放状态
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  ended: false,
  index: 0,
  playMode: "list" as PlayMode,

  current: {
    id: "",
    url: "",
    name: "",
    artist: "",
    pic: "",
    lyrics: "",
  },

  // 设置当前歌曲
  setCurrent(track: any) {
    this.current = {
      id: track.id,
      url: track.url,
      name: track.name,
      artist: track.artist,
      pic: track.pic,
      lyrics: track.lyrics,
    };
  },

  async load(track: any) {
    try {
      await TrackPlayer.reset(); // 清空上一首
      await TrackPlayer.add({
        id: track.id,
        url: track.url,
        title: track.name || "未知歌曲",
        artist: track.artist || "未知歌手",
        artwork: track.pic || require("../assets/images/ygdj.jpg"),
      });

      this.isPlaying = false;
      this.ended = false;
      this.currentTime = 0; // 进度归零
      this.duration = 0;
      await this.syncProgress();
    } catch (e) {
      console.log("加载引擎失败", e);
    }
  },

  // 播放
  async play() {
    await TrackPlayer.play();
    this.isPlaying = true;
    startProgressSync();
  },

  // 列表点击播放
  async player() {
    const track = searchStore.selectedList[0];
    this.setCurrent(track);
    await this.load(track);
    await this.play();
  },

  // 暂停
  async pause() {
    await TrackPlayer.pause();
    this.isPlaying = false;
    stopProgressSync();
  },

  // 拖动进度条
  async seek(sec: number) {
    await TrackPlayer.seekTo(sec);
    this.currentTime = sec;
    await this.syncProgress();
  },

  async syncProgress() {
    try {
      const progress = await TrackPlayer.getProgress();
      this.currentTime = progress.position;
      this.duration = progress.duration;
    } catch (error) {
      console.log("同步播放进度失败", error);
    }
  },

  togglePlayMode() {
    const modes: PlayMode[] = ["list", "single", "shuffle"];
    const currentIndex = modes.indexOf(this.playMode);
    this.playMode = modes[(currentIndex + 1) % modes.length];
    return this.playMode;
  },

  async playByIndex(index: number) {
    const list = searchStore.onlyPlay;
    if (!list.length) return;

    const safeIndex = (index + list.length) % list.length;
    this.index = safeIndex;
    searchStore.indexSelect = safeIndex;

    await searchStore.fetchMusicUrl(list[safeIndex].id);
    const track = searchStore.selectedList[0];
    this.setCurrent(track);
    await this.load(track);
    await this.play();
  },

  // 播下一首
  async next() {
    const list = searchStore.onlyPlay;
    if (!list.length) return;

    const nextIndex =
      this.playMode === "shuffle"
        ? getRandomIndex(this.index, list.length)
        : this.index + 1;

    await this.playByIndex(nextIndex);
  },

  // 播上一首
  async previous() {
    const list = searchStore.onlyPlay;
    if (!list.length) return;

    const previousIndex =
      this.playMode === "shuffle"
        ? getRandomIndex(this.index, list.length)
        : this.index - 1;

    await this.playByIndex(previousIndex);
  },

  async handleTrackEnd() {
    if (endTransitionLocked) return;

    endTransitionLocked = true;
    this.ended = true;

    if (this.playMode === "single") {
      await this.seek(0);
      await this.play();
    } else {
      await this.next();
    }

    setTimeout(() => {
      endTransitionLocked = false;
    }, 1200);
  },
});

// 完全脱离 React 组件的底层状态同步机制
TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
  // 同步播放/暂停状态
  playerStore.isPlaying =
    event.state === State.Playing || event.state === State.Buffering;

  // 播放和缓冲时都持续同步，避免状态短暂切换导致进度条停住。
  if (event.state === State.Playing || event.state === State.Buffering) {
    startProgressSync();
  } else {
    stopProgressSync();
    await playerStore.syncProgress();
  }

  if (event.state === State.Ended) {
    await playerStore.handleTrackEnd();
  } else {
    playerStore.ended = false;
  }
});

TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
  await playerStore.handleTrackEnd();
});

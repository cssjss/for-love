import TrackPlayer, { Event, State } from "react-native-track-player";
import { proxy } from "valtio";
import { searchStore } from "./searchStore";

export const playerStore = proxy({
  // 播放状态
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  ended: false,
  index: 0,

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
    } catch (e) {
      console.log("加载引擎失败", e);
    }
  },

  // 播放
  async play() {
    await TrackPlayer.play();
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
  },

  // 拖动进度条
  async seek(sec: number) {
    await TrackPlayer.seekTo(sec);
    this.currentTime = sec;
  },

  // 播下一首
  async next() {
    const list = searchStore.onlyPlay;
    if (!list.length) return;
    this.index++;
    if (this.index > list.length - 1) this.index = 0;

    await searchStore.fetchMusicUrl(list[this.index].id);
    const track = searchStore.selectedList[0];
    this.setCurrent(track);
    await this.load(track);
    await this.play();
  },

  // 播上一首
  async previous() {
    const list = searchStore.onlyPlay;
    if (!list.length) return;
    this.index--;
    if (this.index < 0) this.index = list.length - 1;

    await searchStore.fetchMusicUrl(list[this.index].id);
    const track = searchStore.selectedList[0];
    this.setCurrent(track);
    await this.load(track);
    await this.play();
  },
});

// 完全脱离 React 组件的底层状态同步机制
let progressInterval: any;

TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
  // 同步播放/暂停状态
  playerStore.isPlaying = event.state === State.Playing;

  //只有在播放时，才开启高频进度条拉取
  if (event.state === State.Playing) {
    progressInterval = setInterval(async () => {
      const progress = await TrackPlayer.getProgress();
      playerStore.currentTime = progress.position;
      playerStore.duration = progress.duration;
    }, 1000); // 每秒同步一次
  } else {
    clearInterval(progressInterval);
  }
  if (event.state === State.Ended) {
    playerStore.ended = true;
  } else {
    playerStore.ended = false;
  }
});

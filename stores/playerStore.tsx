import { proxy } from "valtio";
import { searchStore } from "./searchStore";

export const playerStore = proxy({
  audio: null as any,

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

  // 注入 player 实例
  injectAudioInstance(player: any) {
    this.audio = player;
    console.log("播放器注入成功");
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

  // 加载音频
  async load(url: string) {
    if (!this.audio) return;

    try {
      this.audio.replace(url);
      this.isPlaying = false;
    } catch (e) {
      console.log("加载失败", e);
    }
  },

  // 播放
  play() {
    if (!this.audio) return;
    console.log("id" + this.current.id);

    this.audio.play();
    this.isPlaying = true;
  },
  // 点击播放
  async player() {
    const trcks = searchStore.selectedList[playerStore.index];
    console.log("id" + this.current.id);
    playerStore.setCurrent(trcks);
    await playerStore.load(trcks.url);
    playerStore.play();
    playerStore.isPlaying = true;
  },
  // 暂停
  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
  },

  // 拖动
  seek(sec: number) {
    if (!this.audio) return;
    this.audio.seekTo(sec);
    this.currentTime = sec;
  },

  // 播下一首
  async next() {
    const list = searchStore.selectedList;
    if (!list.length) return;
    console.log("index" + this.index);

    this.index++;
    if (this.index > list.length - 1) this.index = 0;
    const track = list[this.index];
    this.setCurrent(track);

    await this.load(track.url);
    this.play();
  },

  // 播上一首
  async previous() {
    const list = searchStore.selectedList;
    if (!list.length) return;

    this.index--;
    if (this.index < 0) this.index = list.length - 1;

    const track = list[this.index];
    this.setCurrent(track);

    await this.load(track.url);
    this.play();
  },
});

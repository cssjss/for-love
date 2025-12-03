// app/index.tsx
import React, { useEffect } from "react";
import TopTabsBlur from "../components/AppNavigator";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { playerStore } from "../stores/playerStore";

export default function Page() {
  const player = useAudioPlayer(); // 全局播放器
  const status = useAudioPlayerStatus(player);
  useEffect(() => {
    // 注入到 Valtio store
    playerStore.injectAudioInstance(player);
    // 启动进度轮询
    playerStore.startProgressLoop();
  }, []);
  // 同步播放状态
  useEffect(() => {
    if (!status) return;
    playerStore.isPlaying = status.playing;
    playerStore.duration = status.duration ?? 0;
    playerStore.currentTime = status.currentTime ?? 0;
    playerStore.ended = status.didJustFinish ?? false;
  }, [status]);
  return <TopTabsBlur></TopTabsBlur>;
}

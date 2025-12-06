import TopTabsBlur from "@/components/AppNavigator";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect } from "react";
import { playerStore } from "../stores/playerStore";

export default function RootLayout() {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  // 注入播放器实例
  useEffect(() => {
    playerStore.injectAudioInstance(player);
  }, []);

  useEffect(() => {
    if (!status) return;

    // 只有数字时才更新
    if (typeof status.currentTime === "number") {
      playerStore.currentTime = status.currentTime;
    }

    if (typeof status.duration === "number") {
      playerStore.duration = status.duration;
    }

    playerStore.isPlaying = status.playing;
    playerStore.ended = status.didJustFinish;
  }, [status]);

  return <TopTabsBlur />;
}

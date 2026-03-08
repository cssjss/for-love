import TopTabsBlur from "@/components/AppNavigator";
import { PlaybackService } from "@/stores/playbackService";
import { playerStore } from "@/stores/playerStore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
TrackPlayer.registerPlaybackService(() => PlaybackService);
export default function RootLayout() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  function PlayerSync() {
    //  每 500 毫秒向底层原生引擎拉取一次极度精准的时间
    const { position, duration } = useProgress(500);
    const playbackState = usePlaybackState();

    useEffect(() => {
      // 赋值给 store，你的 UI 和歌词就会瞬间全部响应！
      playerStore.currentTime = position;
      if (duration > 0) {
        playerStore.duration = duration;
      }
    }, [position, duration]);

    useEffect(() => {
      // 兼容 TrackPlayer 不同版本的状态读取
      const state =
        typeof playbackState === "object"
          ? (playbackState as any).state
          : playbackState;

      playerStore.isPlaying = state === State.Playing;

      // 如果歌曲自然播完，可以在这里触发下一首
      if (state === State.Ended) {
        playerStore.ended = true;
        playerStore.next();
      } else {
        playerStore.ended = false;
      }
    }, [playbackState]);

    return null;
  }
  useEffect(() => {
    async function setupAudioEngine() {
      try {
        // 1. 尝试初始化引擎
        await TrackPlayer.setupPlayer();
      } catch (e) {
        console.log(e);
      }
      try {
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          // 告诉安卓系统，通知栏收起时显示哪几个核心按钮
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
        });
        console.log("锁屏控制卡片绑定成功！");
      } catch (error) {
        console.log("锁屏绑定失败:", error);
      }

      setIsPlayerReady(true);
    }

    setupAudioEngine();
  }, []);
  if (!isPlayerReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>启动音频引擎中...</Text>
      </View>
    );
  }

  return (
    <>
      <PlayerSync />
      <TopTabsBlur />
    </>
  );
}

// TrackPlayer.registerPlaybackService(() => require("../stores/playbackService"));

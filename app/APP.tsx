import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect } from "react";
import { playerStore } from "../stores/playerStore";
export default function App() {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    playerStore.injectAudioInstance(player);
  }, [player]);

  useEffect(() => {
    if (!status) return;
    playerStore.isPlaying = status.playing;
    playerStore.duration = status.duration ?? 0;
    playerStore.currentTime = status.currentTime ?? 0;
    playerStore.ended = status.didJustFinish ?? false;
  }, [status]);
}

// stores/playbackService.ts
import TrackPlayer, { Event } from "react-native-track-player";
import { playerStore } from "./playerStore";

export const PlaybackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    playerStore.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    playerStore.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    playerStore.next();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    playerStore.previous();
  });
};

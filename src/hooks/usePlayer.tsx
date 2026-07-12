import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Hls from "hls.js";
import type { RadioStation, RadioStream } from "@/lib/radio.functions";

type PlayerState = {
  station: RadioStation | null;
  stream: RadioStream | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  error: string | null;
  play: (station: RadioStation, stream?: RadioStream) => void;
  toggle: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  selectStream: (stream: RadioStream) => void;
  showVisualizer: boolean;
  setShowVisualizer: (show: boolean) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [station, setStation] = useState<RadioStation | null>(null);
  const [stream, setStream] = useState<RadioStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [error, setError] = useState<string | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.8;
    audio.addEventListener("playing", () => {
      setIsPlaying(true);
      setIsLoading(false);
    });
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("waiting", () => setIsLoading(true));
    audio.addEventListener("error", () => {
      setError("Gagal memutar stream");
      setIsLoading(false);
      setIsPlaying(false);
    });
    audioRef.current = audio;
    return () => {
      audio.pause();
      hlsRef.current?.destroy();
    };
  }, []);

  const loadStream = (s: RadioStream) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    setIsLoading(true);
    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (s.type === "hls" || s.url.includes(".m3u8")) {
      if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = s.url;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(s.url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            setError("Stream HLS tidak dapat diputar");
            setIsLoading(false);
          }
        });
        hlsRef.current = hls;
      } else {
        setError("Browser tidak mendukung HLS");
        setIsLoading(false);
        return;
      }
    } else {
      audio.src = s.url;
    }
    audio.play().catch(() => {
      setError("Gagal memulai pemutaran");
      setIsLoading(false);
    });
  };

  const play: PlayerState["play"] = (st, s) => {
    const chosen = s ?? st.streams[0];
    if (!chosen) return;
    setStation(st);
    setStream(chosen);
    loadStream(chosen);
    setShowVisualizer(true);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !stream) return;
    if (audio.paused) {
      setIsLoading(true);
      audio.play().catch(() => setIsLoading(false));
      setShowVisualizer(true);
    } else {
      audio.pause();
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    hlsRef.current?.destroy();
    hlsRef.current = null;
    setStation(null);
    setStream(null);
    setIsPlaying(false);
    setIsLoading(false);
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const selectStream = (s: RadioStream) => {
    if (!station) return;
    setStream(s);
    loadStream(s);
    setShowVisualizer(true);
  };

  // Media Session API: set OS/browser notification metadata + hardware controls
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!station) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: station.name,
      artist: station.genre ?? "Various",
      album: station.country,
      artwork: [96, 192, 256, 384, 512].map((size) => ({
        src: station.image,
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [station, isPlaying]);

  // Automatically enable visualizer when playing
  useEffect(() => {
    if (isPlaying) {
      setShowVisualizer(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    const handlePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      setIsLoading(true);
      audio.play().catch(() => setIsLoading(false));
    };
    const handlePause = () => audioRef.current?.pause();
    const handleStop = () => stop();
    try {
      ms.setActionHandler("play", handlePlay);
      ms.setActionHandler("pause", handlePause);
      ms.setActionHandler("stop", handleStop);
    } catch {
      /* unsupported action */
    }
    return () => {
      try {
        ms.setActionHandler("play", null);
        ms.setActionHandler("pause", null);
        ms.setActionHandler("stop", null);
      } catch {
        /* noop */
      }
    };
  }, []);

  const value = useMemo<PlayerState>(
    () => ({
      station,
      stream,
      isPlaying,
      isLoading,
      volume,
      error,
      play,
      toggle,
      stop,
      setVolume,
      selectStream,
      showVisualizer,
      setShowVisualizer,
    }),
    [station, stream, isPlaying, isLoading, volume, error, showVisualizer],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

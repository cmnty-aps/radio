import { Play, Pause, X, Volume2, Loader2, Radio } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";

export function PlayerBar() {
  const {
    station,
    stream,
    isPlaying,
    isLoading,
    volume,
    error,
    toggle,
    stop,
    setVolume,
    selectStream,
    showVisualizer,
    setShowVisualizer,
  } = usePlayer();

  if (!station) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4">
        <div
          onClick={() => setShowVisualizer(!showVisualizer)}
          title="Klik untuk tampilkan Visualizer"
          className="group flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer select-none"
        >
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={station.image}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-3.5">
                  <div
                    className="w-0.5 bg-red-500 rounded-full animate-[pulse_0.6s_infinite_alternate]"
                    style={{ height: "50%" }}
                  ></div>
                  <div
                    className="w-0.5 bg-red-500 rounded-full animate-[pulse_0.4s_infinite_alternate]"
                    style={{ height: "90%", animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-0.5 bg-red-500 rounded-full animate-[pulse_0.5s_infinite_alternate]"
                    style={{ height: "70%", animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 flex-shrink-0 text-accent" />
              <p className="truncate text-sm font-semibold text-card-foreground group-hover:text-accent transition-colors">
                {station.name}
              </p>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                (station.genre ?? "Various")
              )}
            </p>
            {station.streams.length > 1 && (
              <div className="mt-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
                {station.streams.map((s, i) => (
                  <button
                    key={s.url}
                    onClick={() => selectStream(s)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                      stream?.url === s.url
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s.type.toUpperCase()} {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-24 cursor-pointer accent-[color:var(--accent)]"
            aria-label="Volume"
          />
        </div>

        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
        </button>
        <button
          onClick={stop}
          aria-label="Stop"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

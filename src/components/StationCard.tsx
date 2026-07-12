import { Play, Pause, Star, Loader2 } from "lucide-react";
import type { RadioStation } from "@/lib/radio.functions";
import { usePlayer } from "@/hooks/usePlayer";

export function StationCard({ station }: { station: RadioStation }) {
  const { station: current, isPlaying, isLoading, play, toggle } = usePlayer();
  const isCurrent = current?.id === station.id;
  const showPause = isCurrent && isPlaying;

  const handleClick = () => {
    if (isCurrent) toggle();
    else play(station);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/10">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
          <img
            src={station.image}
            alt={station.name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-card-foreground">{station.name}</h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {station.genre ?? "Various"}
          </p>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            {showPause ? (
              <div className="flex items-end gap-[2px] h-3.5 w-5 mr-1" title="Playing music">
                <span className="w-[3px] rounded-t bg-accent animate-micro-eq-1 block origin-bottom"></span>
                <span className="w-[3px] rounded-t bg-accent animate-micro-eq-2 block origin-bottom"></span>
                <span className="w-[3px] rounded-t bg-accent animate-micro-eq-3 block origin-bottom"></span>
                <span className="w-[3px] rounded-t bg-accent animate-micro-eq-4 block origin-bottom"></span>
              </div>
            ) : (
              <Star className="h-3 w-3 fill-accent text-accent" />
            )}
            <span className="font-medium text-card-foreground">{station.rating.toFixed(1)}</span>
            <span>({station.ratingCount})</span>
          </div>
        </div>
        <button
          onClick={handleClick}
          aria-label={showPause ? "Pause" : "Play"}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-95"
        >
          {isCurrent && isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : showPause ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
        </button>
      </div>
    </div>
  );
}

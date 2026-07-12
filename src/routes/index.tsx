import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { z } from "zod";
import { Radio, Loader2, Globe, Sparkles, X } from "lucide-react";
import { getRadioStations } from "@/lib/radio.functions";
import { COUNTRIES } from "@/lib/countries";
import { StationCard } from "@/components/StationCard";
import { PlayerBar } from "@/components/PlayerBar";
import { PlayerProvider, usePlayer } from "@/hooks/usePlayer";
import { SoundVisualizer } from "@/components/SoundVisualizer";

const stationsQuery = (country: string) =>
  queryOptions({
    queryKey: ["radio-stations", country],
    queryFn: () => getRadioStations({ data: { country } }),
    staleTime: 5 * 60_000,
  });

const searchSchema = z.object({
  country: z.string().optional().default("indonesia"),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ country: search.country }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(stationsQuery(deps.country)),
  head: () => ({
    meta: [
      { title: "Cmnty Radio — Live Streaming from Every Country" },
      {
        name: "description",
        content:
          "Stream live radio stations from Indonesia, Malaysia, Japan, USA, and 25+ countries worldwide.",
      },
      { property: "og:title", content: "Cmnty Radio — Live Streaming" },
      { property: "og:description", content: "Live radio streaming from around the world." },
    ],
  }),
  component: RadioPage,
});

function VisualizerPopup() {
  const { isPlaying, showVisualizer, setShowVisualizer, station } = usePlayer();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying || !showVisualizer) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowVisualizer(false);
      }
    };

    // Use a small timeout to let the opening click cycle finish
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isPlaying, showVisualizer, setShowVisualizer]);

  if (!isPlaying || !showVisualizer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent p-4 animate-in fade-in duration-300 pointer-events-none">
      <div
        ref={containerRef}
        className="relative flex flex-col items-center justify-center p-8 bg-transparent rounded-[32px] max-w-sm w-full text-center animate-in zoom-in-95 duration-300 pointer-events-auto cursor-default select-none"
      >
        <div className="mb-4 flex justify-center">
          <SoundVisualizer />
        </div>

        <div className="w-full">
          <p className="truncate font-semibold text-lg text-white mb-1 px-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {station?.name}
          </p>
          <p className="truncate text-xs text-zinc-300 px-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {station?.genre ?? "Various Genre"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RadioPage() {
  return (
    <PlayerProvider>
      <div className="min-h-screen bg-background pb-32">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Suspense fallback={<LoadingGrid />}>
            <StationsGrid />
          </Suspense>
        </main>
        <PlayerBar />
        <VisualizerPopup />
      </div>
    </PlayerProvider>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Cmnty Radio
            </h1>
            <p className="text-sm text-muted-foreground">Streaming langsung dari seluruh dunia</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function CountrySelector({ current }: { current: string }) {
  const navigate = Route.useNavigate();
  return (
    <div className="relative">
      <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <select
        value={current}
        onChange={(e) => navigate({ search: { country: e.target.value }, replace: true })}
        className="w-full appearance-none rounded-xl border border-border bg-card py-3 pl-10 pr-8 text-sm font-medium text-card-foreground outline-none transition-colors focus:border-accent"
        aria-label="Pilih negara"
      >
        {COUNTRIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function StationsGrid() {
  const { country } = Route.useSearch();
  const { data: stations } = useSuspenseQuery(stationsQuery(country));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const countryInfo = COUNTRIES.find((c) => c.slug === country);

  if (!mounted) {
    return <LoadingGrid />;
  }

  return (
    <>
      <div className="mb-4 max-w-xs">
        <CountrySelector current={country} />
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {countryInfo?.flag} {countryInfo?.name ?? country} · {stations.length} stasiun
        </span>
      </div>

      {stations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Tidak ada stasiun untuk negara ini.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
        </div>
      )}
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Memuat stasiun radio...
    </div>
  );
}

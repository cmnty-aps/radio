import { createServerFn } from "@tanstack/react-start";

export type RadioStream = {
  url: string;
  type: string;
  https: boolean;
};

export type RadioStation = {
  id: string;
  name: string;
  country: string;
  genre: string | null;
  image: string;
  rating: number;
  ratingCount: number;
  website: string | null;
  pageUrl: string;
  streams: RadioStream[];
};

export type RadioApiResponse = {
  status: boolean;
  statusCode: number;
  result: {
    country: string;
    slug: string;
    total_results: number;
    stations: RadioStation[];
  };
};

export const getRadioStations = createServerFn({ method: "GET" })
  .inputValidator((data: { country: string }) => ({
    country:
      String(data?.country ?? "indonesia")
        .toLowerCase()
        .trim() || "indonesia",
  }))
  .handler(async ({ data }): Promise<RadioStation[]> => {
    const url = `https://api.cmnty.web.id/search/radio?country=${encodeURIComponent(data.country)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Failed to fetch radio stations: ${res.status}`);
    const json = (await res.json()) as RadioApiResponse;
    return json.result?.stations ?? [];
  });

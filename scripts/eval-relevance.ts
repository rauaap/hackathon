// Mittaa syötteen personoinnin laatua oikeilla Kalevan RSS-jutuilla ja käsin merkityillä arvioilla.
// Käyttö: node scripts/eval-relevance.ts [polku classify-moduuliin]
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

type Audience = "students" | "families";
type Label = {
  geography: string;
  students: number;
  families: number;
  note: string;
};
export type EvalItem = {
  id: string;
  title: string;
  description: string | null;
  publishedAt: string | null;
  url: string;
  kind: string;
  feedCategories: string[];
  label: Label;
};
type Classified = {
  id: string;
  locality: { level: string };
  relevance: Record<Audience, { score: number }>;
};
type Classify = (item: never, now: Date) => Classified;

// Sama kynnys kuin lukijan syötteessä (src/NewsFeed.tsx).
export const MIN_SCORE = 3;
export const dataset = JSON.parse(
  readFileSync(
    new URL("../tests/fixtures/relevance-eval.json", import.meta.url),
    "utf8",
  ),
) as { now: string; reviewed: boolean; items: EvalItem[] };

const round = (n: number) => Math.round(n * 100) / 100;
function ndcg(gains: number[], ideal: number[], k: number) {
  const dcg = (g: number[]) =>
    g
      .slice(0, k)
      .reduce((s, x, i) => s + (2 ** x - 1) / Math.log2(i + 2), 0);
  const best = dcg([...ideal].sort((a, b) => b - a));
  return best ? dcg(gains) / best : 1;
}

export function evaluate(classify: Classify) {
  const now = new Date(dataset.now);
  const rows = dataset.items.map((item) => ({
    item,
    c: classify(item as never, now),
  }));
  const audiences = {} as Record<
    Audience,
    {
      shown: number;
      irrelevantShown: string[];
      precision: number;
      precisionAt5: number;
      recallClear: number;
      ndcgAt8: number;
    }
  >;
  for (const a of ["students", "families"] as Audience[]) {
    const feed = rows
      .filter((r) => r.c.relevance[a].score >= MIN_SCORE)
      .sort((x, y) => y.c.relevance[a].score - x.c.relevance[a].score);
    const label = (r: (typeof rows)[number]) => r.item.label[a];
    const clear = rows.filter((r) => label(r) === 2);
    audiences[a] = {
      shown: feed.length,
      irrelevantShown: feed
        .filter((r) => label(r) === 0)
        .map((r) => r.item.title.slice(0, 60)),
      precision: round(
        feed.length ? feed.filter((r) => label(r) > 0).length / feed.length : 1,
      ),
      precisionAt5: round(
        feed.slice(0, 5).filter((r) => label(r) > 0).length / 5,
      ),
      recallClear: round(
        clear.length
          ? clear.filter((r) => feed.includes(r)).length / clear.length
          : 1,
      ),
      ndcgAt8: round(
        ndcg(
          feed.map(label),
          rows.map(label),
          8,
        ),
      ),
    };
  }
  const geographyErrors = rows
    .filter((r) => r.c.locality.level !== r.item.label.geography)
    .map(
      (r) =>
        `${r.item.title.slice(0, 50)}: ${r.c.locality.level} ≠ ${r.item.label.geography}`,
    );
  return {
    items: rows.length,
    labelsReviewed: dataset.reviewed,
    geographyAccuracy: round(1 - geographyErrors.length / rows.length),
    geographyErrors,
    audiences,
  };
}

if (import.meta.main) {
  const target = process.argv[2]
    ? pathToFileURL(process.argv[2]).href
    : new URL("../api/news.ts", import.meta.url).href;
  const { classify } = await import(target);
  console.log(JSON.stringify(evaluate(classify), null, 2));
}

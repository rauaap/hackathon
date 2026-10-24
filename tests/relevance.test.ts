import { test } from "node:test";
import assert from "node:assert/strict";
import { classify } from "../api/news.ts";
import { dataset, evaluate } from "../scripts/eval-relevance.ts";

const now = new Date(dataset.now);
const one = (title: string, description: string | null = null) =>
  classify(
    {
      id: "t",
      title,
      description,
      publishedAt: dataset.now,
      url: "https://www.kaleva.fi/t/1",
      kind: "news",
      feedCategories: [],
    },
    now,
  );
const reason = (
  i: ReturnType<typeof one>,
  topic: string,
  a: "students" | "families" = "families",
) =>
  i.relevance[a].reasons.find((r) => r.type === "topic" && r.topic === topic);

test("evaluation set: personalised feeds contain no story labelled irrelevant", () => {
  const r = evaluate(classify as never);
  for (const a of ["students", "families"] as const) {
    assert.deepEqual(r.audiences[a].irrelevantShown, [], a);
    assert.ok(r.audiences[a].precision >= 0.9, `${a} precision`);
    assert.equal(
      r.audiences[a].recallClear,
      1,
      `${a} missed a clearly relevant story`,
    );
  }
  assert.ok(r.geographyAccuracy >= 0.9, r.geographyErrors.join("\n"));
});

test("foreign stories are international even when national actors appear", () => {
  const kyiv = one(
    "Ilmahälytykset säestivät Orpon Kiovan-vierailun joka hetkeä – Venäjältä puuttuu tahto rauhaan, pääministeri sanoi",
  );
  assert.equal(kyiv.locality.level, "international");
  assert.equal(one("Oppositio teki välikysymyksen").locality.level, "national");
  // Oulu voittaa aina, kun juttu kertoo Oulusta.
  assert.equal(
    one("Hallitus leikkaa Oulun yliopiston rahoitusta").locality.level,
    "oulu",
  );
});

test("sports clubs reveal the place: Kärpät is Oulu, HIFK is not", () => {
  assert.equal(one("Kärpät voitti kotiottelun").locality.level, "oulu");
  assert.equal(
    one("Jääkiekkoliigassa rytisee taas – HIFK antoi potkut valmentajalle")
      .locality.level,
    "elsewhere",
  );
});

test("a police mention without an incident is not a full safety story", () => {
  const request = one(
    "LVV on tehnyt poliisille tutkintapyynnön Googlen Muhoksen datakeskushankkeesta",
  );
  const r = reason(request, "safety");
  assert.ok(r && r.type === "topic" && r.context === "mention-only");
  assert.equal(r.points, 1);
  const shooting = reason(
    one("Yksi otettu kiinni Kiimingin ammuskelusta", "Poliisi otti kiinni."),
    "safety",
  );
  assert.ok(shooting && shooting.type === "topic");
  assert.equal(shooting.context, "headline");
  assert.equal(shooting.points, 2);
});

test("matches only in the feed summary count half", () => {
  const poll = one(
    "Kysely: Jos voisit päättää, millaiset hautajaiset pitäisit?",
    "Elämän aikana ehtii järjestämään useat juhlat.",
  );
  const r = reason(poll, "events", "students");
  assert.ok(r && r.type === "topic");
  assert.equal(r.context, "summary-only");
  assert.equal(r.points, 1.25);
  const summaryOulu = one(
    "Kaupunki avaa uuden palvelupisteen",
    "Piste avataan Oulussa.",
  );
  const loc = summaryOulu.relevance.students.reasons.find(
    (x) => x.type === "locality",
  );
  assert.deepEqual(loc && [loc.level, loc.points], ["oulu", 1]);
});

test("insufficient metadata is marked uncertain instead of guessed", () => {
  const strike = one(
    "Parkkipaten työntekijät lakkoon ensi kuussa",
    "Lakko alkaa 5. marraskuuta.",
  );
  assert.equal(strike.locality.level, "uncertain");
  assert.equal(strike.confidence, "uncertain");
  assert.equal(one("Kysely: mitä ajattelet?").confidence, "uncertain");
  assert.equal(
    one("Oulun päiväkodeissa näkyy lapsiperheköyhyys").confidence,
    "clear",
  );
});

test("classification never cites words that are not in the headline or summary", () => {
  for (const item of dataset.items) {
    const c = classify(item as never, now);
    const text = `${item.title} ${item.description ?? ""}`.toLowerCase();
    for (const r of [
      ...c.relevance.students.reasons,
      ...c.relevance.families.reasons,
    ])
      if (r.type === "topic" || r.type === "locality")
        for (const w of r.matched)
          assert.ok(text.includes(w), `${w} not in ${item.title}`);
  }
});

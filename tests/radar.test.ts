import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  questionStatus,
  checkQuestion,
  QUESTION_LIMITS,
  PREPARED_QUESTION_ID,
  evakaInsight,
  knownClaims,
  unknowns,
  draftInitial,
  type Story,
} from "../src/data.ts";

const answer = (questionId?: string): Story => ({
  id: "a1",
  title: { en: "Answer", fi: "Vastaus" },
  body: { en: "", fi: "" },
  kind: "published",
  category: { en: "", fi: "" },
  group: "everyone",
  corrections: [],
  ...(questionId ? { questionId } : {}),
});

test("seeded questions start as submitted with no real supports", () => {
  const s = initialState();
  for (const q of s.questions) {
    assert.equal(questionStatus(q, s.stories), "submitted");
    assert.equal(q.supports, 0);
    assert.equal(q.supported, false);
  }
});

test("a question is answered only when a published story links to it", () => {
  const q = initialState().questions.find(
    (x) => x.id === PREPARED_QUESTION_ID,
  )!;
  assert.equal(questionStatus({ ...q, status: "review" }, []), "review");
  assert.equal(
    questionStatus({ ...q, status: "investigating" }, [answer()]),
    "investigating",
  );
  // Toisen kysymyksen vastaus ei merkitse tätä vastatuksi.
  assert.equal(questionStatus(q, [answer("q1")]), "submitted");
  assert.equal(
    questionStatus({ ...q, status: "investigating" }, [answer(q.id)]),
    "published",
  );
});

const ok = "Where can I recycle batteries in Tuira?";
const base = initialState().questions;
const T = 1_000_000_000;

test("question content is validated before it reaches the queue", () => {
  assert.equal(checkQuestion(ok, base, [], T), null);
  assert.equal(checkQuestion("Why?", base, [], T), "too-short");
  assert.equal(
    checkQuestion("a".repeat(QUESTION_LIMITS.max + 1), base, [], T),
    "too-long",
  );
  assert.equal(checkQuestion("123 456 789 000 111", base, [], T), "no-words");
  assert.equal(
    checkQuestion("Why is the bus late?!!!!!!!!", base, [], T),
    "repeated-characters",
  );
  for (const spam of [
    "Cheap tickets here https://example.com now",
    "Visit www.example.org for the answer",
    "Best deals at oulu-offers.xyz today",
  ])
    assert.equal(checkQuestion(spam, base, [], T), "link", spam);
  for (const personal of [
    "Please email me at anna.virtanen@example.com about this",
    "Call me on +358 40 123 4567 about the strike",
  ])
    assert.equal(checkQuestion(personal, base, [], T), "contact-details");
  // Summat ja vuosiluvut eivät ole puhelinnumeroita.
  assert.equal(
    checkQuestion(
      "Why does the city spend 1 500 000 euros on roads in 2026?",
      base,
      [],
      T,
    ),
    null,
  );
  assert.equal(
    checkQuestion("Is the 040 1234567 helpline open on Sundays?", base, [], T),
    "contact-details",
  );
});

test("identical questions are rejected regardless of case and punctuation", () => {
  assert.equal(
    checkQuestion(
      "will eVaka notifications work on my iPhone?? do I need to do something",
      base,
      [],
      T,
    ),
    "duplicate",
  );
  const mine = [
    ...base,
    { ...base[1], id: "x", text: { en: ok, fi: ok }, private: true },
  ];
  assert.equal(
    checkQuestion(`  ${ok.toUpperCase()} `, mine, [], T),
    "duplicate",
  );
});

test("rapid and repeated submissions from one browser are limited", () => {
  assert.equal(checkQuestion(ok, base, [T - 5_000], T), "too-fast");
  assert.equal(checkQuestion(ok, base, [T - 60_000], T), null);
  const three = [T - 9 * 60_000, T - 5 * 60_000, T - 60_000];
  assert.equal(checkQuestion(ok, base, three, T), "too-many");
  // Ikkunan ulkopuoliset lähetykset eivät enää rajoita.
  assert.equal(
    checkQuestion(
      ok,
      base,
      three.map((x) => x - QUESTION_LIMITS.windowMs),
      T,
    ),
    null,
  );
});

test("Community Insight evidence and gaps come only from the checked source lists", () => {
  for (const i of evakaInsight.evidence)
    assert.ok(knownClaims[i], `claim ${i}`);
  for (const i of evakaInsight.gaps) assert.ok(unknowns[i], `gap ${i}`);
  // Aukot päätyvät julkaistavaan luonnokseen molemmilla kielillä: vastaamatonta ei esitetä vastattuna.
  for (const i of evakaInsight.gaps)
    for (const l of ["en", "fi"] as const)
      assert.ok(draftInitial[l].includes(unknowns[i][l]), `${l} gap ${i}`);
  // Arviot ja ehdotettu perustelu eivät väitä kaupungin vastanneen.
  for (const copy of [
    evakaInsight.audience,
    evakaInsight.crossCommunity,
    evakaInsight.reason,
  ])
    assert.ok(
      !/city (said|confirmed|answered)|kaupunki (vastasi|vahvisti)/i.test(
        copy.en + copy.fi,
      ),
    );
  assert.ok(
    evakaInsight.reason.en.length >= 10 && evakaInsight.reason.fi.length >= 10,
  );
});

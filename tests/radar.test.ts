import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  questionStatus,
  PREPARED_QUESTION_ID,
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

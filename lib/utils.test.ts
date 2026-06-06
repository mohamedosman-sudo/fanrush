import { test } from "node:test"
import assert from "node:assert/strict"
import { calcPredictionPoints, getCountdown, cn } from "./utils"

// calcPredictionPoints tests

test("exact score returns 5 points", () => {
  assert.equal(calcPredictionPoints({ homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 }), 5)
})

test("correct result (home win) returns 2 points", () => {
  assert.equal(calcPredictionPoints({ homeScore: 3, awayScore: 0 }, { homeScore: 1, awayScore: 0 }), 2)
})

test("correct result (draw) returns 2 points", () => {
  assert.equal(calcPredictionPoints({ homeScore: 1, awayScore: 1 }, { homeScore: 2, awayScore: 2 }), 2)
})

test("wrong prediction returns 0 points", () => {
  assert.equal(calcPredictionPoints({ homeScore: 2, awayScore: 0 }, { homeScore: 0, awayScore: 1 }), 0)
})

// cn tests

test("cn joins classes correctly", () => {
  assert.equal(cn("a", "b", false, null, "c"), "a b c")
})

// getCountdown tests

test("getCountdown returns 'Kicked off' for past dates", () => {
  assert.equal(getCountdown("2020-01-01T00:00:00Z"), "Kicked off")
})

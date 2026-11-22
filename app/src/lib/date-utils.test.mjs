import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getLocalDate } from "./date-utils.ts";

describe("getLocalDate", () => {
  it("calcule correctement la date à Paris", () => {
    assert.equal(
      getLocalDate(new Date("2026-11-22T23:30:00Z"), "Europe/Paris"),
      "2026-11-23"
    );
  });

  it("calcule correctement la date à New York", () => {
    assert.equal(
      getLocalDate(new Date("2026-11-22T23:30:00Z"), "America/New_York"),
      "2026-11-22"
    );
  });

  it("calcule correctement la date à Tokyo", () => {
    assert.equal(
      getLocalDate(new Date("2026-11-22T23:30:00Z"), "Asia/Tokyo"),
      "2026-11-23"
    );
  });

  it("gère correctement le changement d'heure à Paris", () => {
    assert.equal(
      getLocalDate(new Date("2026-03-29T01:30:00Z"), "Europe/Paris"),
      "2026-03-29"
    );
  });
});
import { describe, expect, it } from "vitest";
import { effectiveStatus } from "./catalogue-status";

describe("effectiveStatus", () => {
  it("keeps a published catalogue live before its expiry date", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    expect(effectiveStatus("published", tomorrow)).toBe("published");
  });

  it("marks a published catalogue expired after its expiry date", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    expect(effectiveStatus("published", yesterday)).toBe("expired");
  });

  it("keeps a draft catalogue in draft status", () => {
    expect(effectiveStatus("draft", null)).toBe("draft");
  });
});
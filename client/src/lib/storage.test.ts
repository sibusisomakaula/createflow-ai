import { describe, expect, it } from "vitest";
import { limitHistory } from "./storage";

describe("history storage", () => {
  it("keeps the newest twenty entries in order", () => {
    const entries = Array.from({ length: 25 }, (_, index) => ({ id: String(index), type: "email", title: String(index), content: "", date: String(index) }));
    expect(limitHistory(entries)).toHaveLength(20);
    expect(limitHistory(entries)[0]?.id).toBe("0");
    expect(limitHistory(entries)[19]?.id).toBe("19");
  });
});

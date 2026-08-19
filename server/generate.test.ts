import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockRejectedValue(new Error("upstream-secret-api-detail")),
}));

import { appRouter } from "./routers";

describe("generate error handling", () => {
  it("does not expose upstream provider details", async () => {
    const caller = appRouter.createCaller({} as never);
    await expect(caller.generate({ type: "email", fields: { purpose: "Draft a follow-up" } })).rejects.toThrow("generation_failed");
    await expect(caller.generate({ type: "email", fields: { purpose: "Draft a follow-up" } })).rejects.not.toThrow("upstream-secret-api-detail");
  });
});

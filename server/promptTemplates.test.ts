import { describe, expect, it } from "vitest";
import { buildPrompt, getRequiredField } from "./promptTemplates";
import { appRouter } from "./routers";

describe("CreateFlow prompt templates", () => {
  it("includes the required structured sections for email prompts", () => {
    const prompt = buildPrompt("email", { purpose: "Schedule a call", tone: "Professional", recipient: "Alex" });
    expect(prompt).toContain("ROLE:");
    expect(prompt).toContain("OBJECTIVE:");
    expect(prompt).toContain("USER CONTEXT:");
    expect(prompt).toContain("OUTPUT FORMAT:");
    expect(prompt).toContain("Schedule a call");
  });

  it("keeps code generation constraints explicit", () => {
    const prompt = buildPrompt("code", { language: "TypeScript", task: "Parse JSON" });
    expect(prompt).toContain("Do not generate malware");
    expect(prompt).toContain("TypeScript");
  });

  it("validates the generator-specific required field", () => {
    expect(getRequiredField("blog", { topic: "A topic" })).toBe(true);
    expect(getRequiredField("blog", { topic: "   " })).toBe(false);
    expect(getRequiredField("product", { name: "Lamp" })).toBe(true);
    expect(getRequiredField("code", { task: "" })).toBe(false);
  });
});


describe("generate procedure validation", () => {
  it("rejects a missing required field before calling the model", async () => {
    const caller = appRouter.createCaller({} as never);
    await expect(caller.generate({ type: "email", fields: { purpose: "" } })).rejects.toThrow("missing");
  });
});

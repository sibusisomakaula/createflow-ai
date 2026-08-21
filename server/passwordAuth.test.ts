import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from "./passwordAuth";

describe("password authentication helpers", () => {
  it("normalizes email addresses consistently", () => {
    expect(normalizeEmail("  Person@Example.COM ")).toBe("person@example.com");
  });

  it("requires a minimum length plus letters and numbers", () => {
    expect(validatePassword("short")).toBeTruthy();
    expect(validatePassword("abcdefgh")).toBeTruthy();
    expect(validatePassword("12345678")).toBeTruthy();
    expect(validatePassword("Create123")).toBeNull();
  });

  it("hashes passwords without storing the raw password and verifies them", async () => {
    const password = "CreateFlow123";
    const encoded = await hashPassword(password);
    expect(encoded).not.toContain(password);
    expect(await verifyPassword(password, encoded)).toBe(true);
    expect(await verifyPassword("WrongPassword123", encoded)).toBe(false);
  });

  it("rejects malformed password hashes", async () => {
    expect(await verifyPassword("CreateFlow123", "not-a-password-hash")).toBe(false);
  });
});

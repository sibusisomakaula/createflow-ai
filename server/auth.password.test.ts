import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "./passwordAuth";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";

const getUserByEmail = vi.fn();
const createPasswordUser = vi.fn();
const signSession = vi.fn();

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, getUserByEmail, createPasswordUser };
});

vi.mock("./_core/sdk", async importOriginal => {
  const actual = await importOriginal<typeof import("./_core/sdk")>();
  return { ...actual, sdk: { ...actual.sdk, signSession } };
});

const { appRouter } = await import("./routers");

function createContext() {
  const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }) } as TrpcContext["res"],
  };
  return { ctx, cookies };
}

const passwordUser = {
  id: 3,
  openId: "password_test-user",
  name: "Password User",
  email: "person@example.com",
  passwordHash: "",
  loginMethod: "password",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("auth password procedures", () => {
  beforeEach(() => {
    getUserByEmail.mockReset();
    createPasswordUser.mockReset();
    signSession.mockReset().mockResolvedValue("signed-session-token");
  });

  it("creates a password account and sets a session cookie", async () => {
    createPasswordUser.mockImplementation(async ({ email, name, passwordHash }: typeof passwordUser) => ({ ...passwordUser, email, name, passwordHash }));
    const { ctx, cookies } = createContext();
    const result = await appRouter.createCaller(ctx).auth.signup({ name: "Person", email: " Person@Example.com ", password: "Create123" });
    expect(result.user.email).toBe("person@example.com");
    expect(createPasswordUser).toHaveBeenCalledWith(expect.objectContaining({ email: "person@example.com", name: "Person", passwordHash: expect.stringContaining("scrypt$") }));
    expect(signSession).toHaveBeenCalledOnce();
    expect(cookies[0]).toMatchObject({ name: COOKIE_NAME, value: "signed-session-token" });
  });

  it("rejects duplicate emails before creating an account", async () => {
    getUserByEmail.mockResolvedValue(passwordUser);
    const { ctx } = createContext();
    await expect(appRouter.createCaller(ctx).auth.signup({ name: "Person", email: "person@example.com", password: "Create123" })).rejects.toMatchObject({ code: "CONFLICT" });
    expect(createPasswordUser).not.toHaveBeenCalled();
  });

  it("logs in with a valid password and rejects a wrong password", async () => {
    const encoded = await hashPassword("Create123");
    getUserByEmail.mockResolvedValue({ ...passwordUser, passwordHash: encoded });
    const { ctx, cookies } = createContext();
    const result = await appRouter.createCaller(ctx).auth.login({ email: "PERSON@example.com", password: "Create123" });
    expect(result.user.email).toBe("person@example.com");
    expect(cookies[0]?.value).toBe("signed-session-token");
    await expect(appRouter.createCaller(createContext().ctx).auth.login({ email: "person@example.com", password: "Wrong123" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects weak signup passwords", async () => {
    const { ctx } = createContext();
    await expect(appRouter.createCaller(ctx).auth.signup({ name: "Person", email: "person@example.com", password: "weak" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

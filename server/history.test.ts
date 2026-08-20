import { describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  createGeneration: vi.fn(),
  deleteGenerationByUserId: vi.fn(),
  getGenerationsByUserId: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

const user = {
  id: 42,
  openId: "private-user",
  email: "private@example.com",
  name: "Private User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("private history", () => {
  it("rejects unauthenticated history reads", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.history.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects unauthenticated history writes", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.history.create({ type: "email", title: "Private draft", content: "Do not expose this." })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("scopes authenticated reads to the current user", async () => {
    dbMocks.getGenerationsByUserId.mockResolvedValueOnce([]);
    const caller = appRouter.createCaller(createContext(user));
    await caller.history.list();
    expect(dbMocks.getGenerationsByUserId).toHaveBeenCalledWith(42);
  });

  it("prevents one account from deleting another account's history", async () => {
    dbMocks.deleteGenerationByUserId.mockImplementation(async (_id: number, userId: number) => userId === 42);
    const firstUser = appRouter.createCaller(createContext(user));
    const secondUser = appRouter.createCaller(createContext({ ...user, id: 77, openId: "other-user", email: "other@example.com" }));
    await expect(firstUser.history.delete({ id: 7 })).resolves.toBe(true);
    await expect(secondUser.history.delete({ id: 7 })).resolves.toBe(false);
    expect(dbMocks.deleteGenerationByUserId).toHaveBeenLastCalledWith(7, 77);
  });

  it("writes and deletes using the authenticated user's id", async () => {
    const saved = { id: 7, userId: 42, type: "email" as const, title: "Private draft", content: "Only for this user.", createdAt: new Date() };
    dbMocks.createGeneration.mockResolvedValueOnce(saved);
    dbMocks.deleteGenerationByUserId.mockResolvedValueOnce(true);
    const caller = appRouter.createCaller(createContext(user));

    await expect(caller.history.create({ type: "email", title: "Private draft", content: "Only for this user." })).resolves.toEqual(saved);
    await expect(caller.history.delete({ id: 7 })).resolves.toBe(true);
    expect(dbMocks.createGeneration).toHaveBeenCalledWith({ userId: 42, type: "email", title: "Private draft", content: "Only for this user." });
    expect(dbMocks.deleteGenerationByUserId).toHaveBeenCalledWith(7, 42);
  });
});

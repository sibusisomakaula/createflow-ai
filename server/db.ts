import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { normalizeEmail } from "./passwordAuth";
import { drizzle } from "drizzle-orm/mysql2";
import { Generation, generations, InsertGeneration, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPasswordUser(input: { email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) return undefined;
  const email = normalizeEmail(input.email);
  const openId = `password_${randomUUID()}`;
  const result = await db.insert(users).values({
    openId,
    email,
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    loginMethod: "password",
    lastSignedIn: new Date(),
  });
  const insertedId = Number(result[0].insertId);
  const rows = await db.select().from(users).where(eq(users.id, insertedId)).limit(1);
  return rows[0];
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getGenerationsByUserId(userId: number): Promise<Generation[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generations).where(eq(generations.userId, userId)).orderBy(desc(generations.createdAt)).limit(20);
}

export async function createGeneration(input: Omit<InsertGeneration, "id" | "createdAt">): Promise<Generation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(generations).values(input);
  const insertedId = Number(result[0].insertId);
  const rows = await db.select().from(generations).where(eq(generations.id, insertedId)).limit(1);
  return rows[0];
}

export async function deleteGenerationByUserId(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(generations).where(and(eq(generations.id, id), eq(generations.userId, userId)));
  return Number(result[0].affectedRows) > 0;
}

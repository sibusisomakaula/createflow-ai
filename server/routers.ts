import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { buildPrompt, getRequiredField } from "./promptTemplates";
import { createGeneration, deleteGenerationByUserId, getGenerationsByUserId } from "./db";
import { z } from "zod";

const generatorTypes = ["email", "blog", "social", "product", "code", "image"] as const;
const inputSchema = z.object({
  type: z.enum(generatorTypes),
  fields: z.record(z.string(), z.string()).refine(fields => Object.values(fields).join(" ").length <= 12000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  history: router({
    list: protectedProcedure.query(({ ctx }) => getGenerationsByUserId(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      type: z.enum(generatorTypes),
      title: z.string().trim().min(1).max(255),
      content: z.string().min(1).max(200000),
    })).mutation(async ({ ctx, input }) => {
      const generation = await createGeneration({ userId: ctx.user.id, type: input.type, title: input.title, content: input.content });
      if (!generation) throw new Error("storage_unavailable");
      return generation;
    }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteGenerationByUserId(input.id, ctx.user.id)),
  }),
  generate: publicProcedure.input(inputSchema).mutation(async ({ input }) => {
    try {
      if (input.type === "image") {
        const prompt = [input.fields.description, `Style: ${input.fields.style}`, `Aspect ratio: ${input.fields.ratio}`].filter(Boolean).join("\n").slice(0, 8000);
        if (!input.fields.description?.trim()) throw new Error("missing");
        const result = await generateImage({ prompt });
        return { kind: "image" as const, content: result.url };
      }
      if (!getRequiredField(input.type, input.fields)) throw new Error("missing");
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are CreateFlow AI. Follow the requested structured prompt exactly. Never fabricate user-specific facts. Return only the requested content." },
          { role: "user", content: buildPrompt(input.type, input.fields) },
        ],
        maxTokens: input.type === "code" ? 2400 : 1800,
      });
      const content = response.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) throw new Error("empty");
      return { kind: input.type === "code" ? ("code" as const) : ("text" as const), content };
    } catch (error) {
      if (error instanceof Error && error.message === "missing") throw error;
      console.error(`[CreateFlow] ${input.type} generation failed`);
      throw new Error("generation_failed");
    }
  }),
});

export type AppRouter = typeof appRouter;

import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, Output, streamText } from "ai";
import { getRequest } from "@tanstack/react-start/server";
import type { z } from "zod";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.server.ts";

export type AiResult<T> = { ok: true; data: T } | { ok: false; error: string };

const MODEL = "openai/gpt-6-astra";

function friendlyError(err: unknown): string {
  const status = APICallError.isInstance(err) ? err.statusCode : undefined;
  if (status === 402) return "Lovable AI credits have run out for this workspace. Add credits to keep generating.";
  if (status === 429) return "Lots of requests right now. Please wait a moment and try again.";
  if (status === 403) return "This AI request was blocked for this workspace. Please check your AI settings.";
  if (status === 401) return "The AI service isn't configured correctly.";
  if (status === 400) return "The AI couldn't process this input. Try shortening or simplifying it.";
  return "The AI couldn't finish this request. Please try again.";
}

/** Streams a strict-schema structured response from Lovable AI and returns the final object. */
export async function runStructured<T>(instructions: string, prompt: string, schema: z.ZodType<T>): Promise<AiResult<T>> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return { ok: false, error: "The AI service isn't configured yet." };
  const request = getRequest();
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  let streamError: unknown;
  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions,
      prompt,
      output: Output.object({ schema }),
      abortSignal: request.signal,
      onError: ({ error }) => {
        streamError = error;
      },
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    return { ok: true, data: (await result.output) as T };
  } catch (err) {
    console.error("AI request failed", streamError ?? err);
    return { ok: false, error: friendlyError(streamError ?? err) };
  }
}

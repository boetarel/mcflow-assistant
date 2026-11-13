import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runStructured, type AiResult } from "./ai.server";
import { readUrl } from "./url-reader.server";
import { NOT_SPECIFIED, bullets, isUrl as looksLikeUrl, orNotSpecified } from "./format";

export type { AiResult };
const NS = NOT_SPECIFIED;
const clean = orNotSpecified;

/* ---------- Email ---------- */
export const emailInput = z.object({
  recipient: z.string().trim().min(1).max(200),
  audience: z.enum(["client", "manager", "team"]),
  keyPoints: z.string().trim().min(3).max(6000),
  length: z.enum(["short", "medium"]),
  tone: z.enum(["formal", "friendly", "persuasive"]),
});
export type EmailInput = z.infer<typeof emailInput>;
export type EmailOutput = { subject: string; body: string };

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: EmailInput) => emailInput.parse(d))
  .handler(async ({ data }): Promise<AiResult<EmailOutput>> => {
    const words = data.length === "short" ? "60–110 words" : "130–230 words";
    return runStructured(
      `You write professional emails. Use ONLY the facts in the user's key points; never invent names, dates, numbers, commitments or details. If something essential is missing, use a clear bracketed placeholder like [date]. Body length: ${words}. Tone: ${data.tone}. Audience: the recipient is the sender's ${data.audience}. Include a greeting addressed to the recipient and end with a sign-off followed by "[Your name]". Plain text, short paragraphs, no markdown.`,
      `Recipient: ${data.recipient}\nKey points:\n${data.keyPoints}`,
      z.object({ subject: z.string(), body: z.string() }),
    );
  });

/* ---------- Research ---------- */
export type ResearchOutput = { source: string; summary: string; insights: string; recommendations: string };

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((d: { input: string }) => z.object({ input: z.string().trim().min(2).max(40000) }).parse(d))
  .handler(async ({ data }): Promise<AiResult<ResearchOutput>> => {
    const input = data.input;
    const isUrl = looksLikeUrl(input);
    let material = input;
    let source = input.length > 300 || input.includes("\n") ? "Pasted text" : `Topic: ${input}`;
    if (isUrl) {
      const page = await readUrl(input);
      if (!page.ok) return { ok: false, error: `We couldn't read that page because ${page.reason}. Please paste the article text instead.` };
      material = `Page title: ${page.title}\n\n${page.text}`;
      source = page.title;
    }
    const mode = isUrl || source === "Pasted text" ? "source" : "topic";
    const res = await runStructured(
      mode === "source"
        ? `You are a research analyst. Analyse ONLY the provided source text. Do not add facts that aren't in it. If the text is not a real article (e.g. a login wall, paywall, cookie notice, error page or navigation only), set unreadable=true and leave other fields empty. Summary: 3–5 sentences. Key insights: 3–6 concise bullets grounded in the text. Recommendations: 3–5 practical, actionable next steps for a professional.`
        : `You are a research analyst. Give a balanced, factual briefing on the user's topic from well-established knowledge. Avoid made-up statistics, quotes or sources; flag uncertainty where relevant. Set unreadable=false. Summary: 3–5 sentences. Key insights: 3–6 concise bullets. Recommendations: 3–5 practical, actionable next steps for a professional.`,
      mode === "source" ? `Source text:\n"""\n${material}\n"""` : `Topic: ${material}`,
      z.object({ unreadable: z.boolean(), summary: z.string(), keyInsights: z.array(z.string()), recommendations: z.array(z.string()) }),
    );
    if (!res.ok) return res;
    if (res.data.unreadable)
      return { ok: false, error: "That source didn't contain readable article text (it may be behind a login, paywall or cookie wall). Please paste the article text instead." };
    return { ok: true, data: { source, summary: clean(res.data.summary), insights: bullets(res.data.keyInsights), recommendations: bullets(res.data.recommendations) } };
  });

/* ---------- Meetings ---------- */
export type ActionItem = { task: string; owner: string; deadline: string };
export type MeetingOutput = { summary: string; decisions: string; actions: ActionItem[]; deadlines: string };

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: { notes: string; detail: "brief" | "detailed" }) =>
    z.object({ notes: z.string().trim().min(10).max(40000), detail: z.enum(["brief", "detailed"]) }).parse(d),
  )
  .handler(async ({ data }): Promise<AiResult<MeetingOutput>> => {
    const res = await runStructured(
      `You summarise meeting notes. Extract ONLY what is explicitly stated in the notes; never invent decisions, tasks, owners or dates. When an owner or deadline isn't stated, use exactly "${NS}". Return empty lists when nothing applies. ${data.detail === "brief" ? "Summary: 2–3 sentences." : "Summary: a thorough 1–2 paragraph overview covering the main discussion points and context."} Deadlines: each dated item from the notes as "item — date".`,
      `Meeting notes:\n"""\n${data.notes}\n"""`,
      z.object({
        summary: z.string(),
        keyDecisions: z.array(z.string()),
        actionItems: z.array(z.object({ task: z.string(), owner: z.string(), deadline: z.string() })),
        deadlines: z.array(z.string()),
      }),
    );
    if (!res.ok) return res;
    const d = res.data;
    return {
      ok: true,
      data: {
        summary: clean(d.summary),
        decisions: bullets(d.keyDecisions),
        actions: d.actionItems.map((a) => ({ task: clean(a.task), owner: clean(a.owner), deadline: clean(a.deadline) })),
        deadlines: bullets(d.deadlines),
      },
    };
  });

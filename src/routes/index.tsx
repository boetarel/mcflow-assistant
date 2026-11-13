import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Mail, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, OutputPanel, OutputSection, PageHeader, Panel, Segmented, Workspace, copyText } from "@/components/kit";
import { generateEmail, type EmailInput, type EmailOutput } from "@/lib/ai.functions";
import { EMAIL_FORM_KEY, EMAIL_RESULT_KEY, emptyEmailForm, useAiTask, useTabState } from "@/lib/workspace";


const TONES = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — McFlow" },
      { name: "description", content: "Turn key points into a polished, ready-to-send email in the tone you need." },
      { property: "og:title", content: "Smart Email Generator — McFlow" },
      { property: "og:description", content: "Turn key points into a polished, ready-to-send email in the tone you need." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [form, setForm] = useTabState<EmailInput>(EMAIL_FORM_KEY, emptyEmailForm);
  const generate = useServerFn(generateEmail);
  const task = useAiTask<EmailInput, EmailOutput>(EMAIL_RESULT_KEY, (data) => generate({ data }));
  const set = <K extends keyof EmailInput>(k: K, v: EmailInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.recipient.trim() && form.keyPoints.trim().length >= 3;
  const run = (f = form) => task.run(f);

  return (
    <>
      <PageHeader eyebrow="Email" title="Smart Email Generator">
        Give McFlow the essentials. It drafts the subject and body; you make the final call.
      </PageHeader>
      <Workspace
        input={
          <Panel title="Your brief">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (valid) run(); }}>
              <Field label="Recipient">
                <input className="field" value={form.recipient} onChange={(e) => set("recipient", e.target.value)} placeholder="e.g. Priya Naidoo, Head of Procurement" maxLength={200} />
              </Field>
              <Field label="Audience">
                <Segmented label="Audience" value={form.audience} onChange={(v) => set("audience", v)} options={[{ value: "client", label: "Client" }, { value: "manager", label: "Manager" }, { value: "team", label: "Team" }]} />
              </Field>
              <Field label="Key points" hint={`${form.keyPoints.length}/6000`}>
                <textarea className="field min-h-40" value={form.keyPoints} onChange={(e) => set("keyPoints", e.target.value)} maxLength={6000} placeholder={"What must the email say?\n- Proposal attached\n- Need sign-off by Friday"} />
              </Field>
              <div className="grid gap-4">
                <Field label="Length">
                  <Segmented label="Length" value={form.length} onChange={(v) => set("length", v)} options={[{ value: "short", label: "Short" }, { value: "medium", label: "Medium" }]} />
                </Field>
                <Field label="Tone">
                  <Segmented label="Tone" value={form.tone} onChange={(v) => set("tone", v)} options={[...TONES]} />
                </Field>
              </div>
              <Button type="submit" variant="vermilion" size="lg" className="w-full" disabled={!valid || task.loading}>
                <Sparkles /> {task.loading ? "Drafting…" : "Generate email"}
              </Button>
            </form>
          </Panel>
        }
        output={
          <OutputPanel
            title="Draft"
            loading={task.loading}
            error={task.error}
            hasData={!!task.data}
            onRetry={() => run()}
            emptyIcon={<Mail className="size-5" />}
            emptyText="Add a recipient and your key points, then generate. Your draft will appear here."
            loadingText={`Writing a ${form.tone} email…`}
            actions={
              task.data && (
                <>
                  <Button onClick={() => copyText(`Subject: ${task.data!.subject}\n\n${task.data!.body}`)}><Copy /> Copy</Button>
                  <Button variant="outline" onClick={() => run()}><RotateCcw /> Regenerate</Button>
                  <div className="w-full sm:ml-auto sm:w-72">
                    <Segmented label="Switch tone" value={form.tone} options={[...TONES]} onChange={(tone) => { const f = { ...form, tone }; setForm(f); run(f); }} />
                  </div>
                </>
              )
            }
          >
            {task.data && (
              <>
                <OutputSection title="Subject">
                  <input className="field-ghost font-serif text-xl" value={task.data.subject} onChange={(e) => task.setData({ ...task.data!, subject: e.target.value })} aria-label="Subject" />
                </OutputSection>
                <OutputSection title="Body">
                  <textarea className="field-ghost min-h-56 text-[0.95rem]" value={task.data.body} onChange={(e) => task.setData({ ...task.data!, body: e.target.value })} aria-label="Email body" />
                </OutputSection>
              </>
            )}
          </OutputPanel>
        }
      />
    </>
  );
}

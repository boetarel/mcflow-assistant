import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Mail, NotebookPen, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, OutputPanel, OutputSection, PageHeader, Panel, Segmented, Workspace, copyText } from "@/components/kit";
import { summarizeMeeting, type ActionItem, type MeetingOutput } from "@/lib/ai.functions";
import { EMAIL_FORM_KEY, EMAIL_RESULT_KEY, emptyEmailForm, useAiTask, useStore, useTabState } from "@/lib/workspace";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — McFlow" },
      { name: "description", content: "Turn raw meeting notes into a summary, decisions, action items and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — McFlow" },
      { property: "og:description", content: "Turn raw meeting notes into a summary, decisions, action items and deadlines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

type Detail = "brief" | "detailed";
const actionsText = (a: ActionItem[]) => (a.length ? a.map((x) => `• ${x.task} — Owner: ${x.owner} — Deadline: ${x.deadline}`).join("\n") : "Not specified");

function MeetingsPage() {
  const [notes, setNotes] = useTabState("meetings.notes", "");
  const [detail, setDetail] = useTabState<Detail>("meetings.detail", "brief");
  const summarize = useServerFn(summarizeMeeting);
  const task = useAiTask<{ notes: string; detail: Detail }, MeetingOutput>("meetings.result", (data) => summarize({ data }));
  const store = useStore();
  const navigate = useNavigate();
  const valid = notes.trim().length >= 10;
  const d = task.data;
  const run = () => valid && task.run({ notes: notes.trim(), detail });

  const asText = () => d && `MEETING SUMMARY\n${d.summary}\n\nKEY DECISIONS\n${d.decisions}\n\nACTION ITEMS\n${actionsText(d.actions)}\n\nDEADLINES\n${d.deadlines}`;
  const setAction = (i: number, k: keyof ActionItem, v: string) => d && task.setData({ ...d, actions: d.actions.map((a, j) => (j === i ? { ...a, [k]: v } : a)) });

  const draftFollowUp = () => {
    if (!d) return;
    store.set(EMAIL_FORM_KEY, {
      ...emptyEmailForm,
      recipient: "Meeting attendees",
      audience: "team",
      tone: "friendly",
      length: "medium",
      keyPoints: `Follow-up to our meeting. Thank attendees and recap.\n\nSummary: ${d.summary}\n\nDecisions:\n${d.decisions}\n\nAction items:\n${actionsText(d.actions)}\n\nDeadlines:\n${d.deadlines}`.slice(0, 6000),
    });
    store.set(EMAIL_RESULT_KEY, null);
    toast.success("Email brief prefilled from your meeting");
    navigate({ to: "/" });
  };

  return (
    <>
      <PageHeader eyebrow="Meetings" title="Meeting Notes Summarizer">
        Paste rough notes or a transcript. McFlow pulls out what was decided, who's doing what, and by when.
      </PageHeader>
      <Workspace
        input={
          <Panel title="Notes">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(); }}>
              <Field label="Meeting notes" hint={`${notes.length}/40000`}>
                <textarea className="field min-h-72" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={40000} placeholder={"Paste your notes here…\n\nSam: launch moved to 3 June\nLeila to send budget by Friday"} />
              </Field>
              <Field label="Summary depth">
                <Segmented label="Summary depth" value={detail} onChange={setDetail} options={[{ value: "brief", label: "Brief" }, { value: "detailed", label: "Detailed" }]} />
              </Field>
              <Button type="submit" variant="vermilion" size="lg" className="w-full" disabled={!valid || task.loading}>
                <Sparkles /> {task.loading ? "Summarising…" : "Summarise notes"}
              </Button>
            </form>
          </Panel>
        }
        output={
          <OutputPanel
            title="Summary"
            loading={task.loading}
            error={task.error}
            hasData={!!d}
            onRetry={run}
            emptyIcon={<NotebookPen className="size-5" />}
            emptyText="Paste your notes and summarise. Decisions, action items and deadlines will appear here."
            loadingText="Reading your notes…"
            actions={
              d && (
                <>
                  <Button onClick={() => copyText(asText()!)}><Copy /> Copy</Button>
                  <Button variant="outline" onClick={draftFollowUp}><Mail /> Draft follow-up email</Button>
                </>
              )
            }
          >
            {d && (
              <>
                <OutputSection title="Summary">
                  <textarea className="field-ghost text-[0.95rem]" aria-label="Summary" value={d.summary} onChange={(e) => task.setData({ ...d, summary: e.target.value })} />
                </OutputSection>
                <OutputSection title="Key decisions">
                  <textarea className="field-ghost text-[0.95rem]" aria-label="Key decisions" value={d.decisions} onChange={(e) => task.setData({ ...d, decisions: e.target.value })} />
                </OutputSection>
                <OutputSection title="Action items">
                  {d.actions.length ? (
                    <div className="space-y-2">
                      <div className="hidden grid-cols-[1fr_9rem_9rem] gap-2 text-xs text-muted-foreground sm:grid"><span>Task</span><span>Owner</span><span>Deadline</span></div>
                      {d.actions.map((a, i) => (
                        <div key={i} className="grid gap-1 rounded-lg border bg-muted/40 p-2 sm:grid-cols-[1fr_9rem_9rem] sm:gap-2">
                          <input className="field-ghost mx-0 text-sm font-medium" aria-label="Task" value={a.task} onChange={(e) => setAction(i, "task", e.target.value)} />
                          <input className="field-ghost mx-0 text-sm" aria-label="Owner" value={a.owner} onChange={(e) => setAction(i, "owner", e.target.value)} />
                          <input className="field-ghost mx-0 text-sm" aria-label="Deadline" value={a.deadline} onChange={(e) => setAction(i, "deadline", e.target.value)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-1 text-[0.95rem] text-muted-foreground">Not specified</p>
                  )}
                </OutputSection>
                <OutputSection title="Deadlines">
                  <textarea className="field-ghost text-[0.95rem]" aria-label="Deadlines" value={d.deadlines} onChange={(e) => task.setData({ ...d, deadlines: e.target.value })} />
                </OutputSection>
              </>
            )}
          </OutputPanel>
        }
      />
    </>
  );
}

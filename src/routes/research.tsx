import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, FileSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, OutputPanel, OutputSection, PageHeader, Panel, Workspace, copyText } from "@/components/kit";
import { runResearch, type ResearchOutput } from "@/lib/ai.functions";
import { useAiTask, useTabState } from "@/lib/workspace";
import { isUrl as looksLikeUrl } from "@/lib/format";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — McFlow" },
      { name: "description", content: "Summarise a topic, article or web page into insights and recommendations." },
      { property: "og:title", content: "AI Research Assistant — McFlow" },
      { property: "og:description", content: "Summarise a topic, article or web page into insights and recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const SECTIONS = [
  { key: "summary", title: "Summary" },
  { key: "insights", title: "Key insights" },
  { key: "recommendations", title: "Recommendations" },
] as const;

function ResearchPage() {
  const [input, setInput] = useTabState("research.input", "");
  const research = useServerFn(runResearch);
  const task = useAiTask<string, ResearchOutput>("research.result", (i) => research({ data: { input: i } }));
  const isUrl = looksLikeUrl(input);
  const valid = input.trim().length >= 2;
  const d = task.data;

  const notes = () =>
    d && `Research notes — ${d.source}\n\n${SECTIONS.map((s) => `${s.title.toUpperCase()}\n${d[s.key]}`).join("\n\n")}`;

  return (
    <>
      <PageHeader eyebrow="Research" title="AI Research Assistant">
        Enter a topic, paste an article, or drop in a link. Get the gist, the insights and what to do next.
      </PageHeader>
      <Workspace
        input={
          <Panel title="Source">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (valid) task.run(input.trim()); }}>
              <Field label="Topic, article or URL" hint={isUrl ? "Link detected" : `${input.length}/40000`}>
                <textarea className="field min-h-64" value={input} onChange={(e) => setInput(e.target.value)} maxLength={40000} placeholder={"e.g. The four-day work week\n\n…or paste an article\n\n…or https://example.com/article"} />
              </Field>
              <p className="text-xs text-muted-foreground">
                Links are read live. If a page can't be read (paywall, login or blocked), we'll tell you and ask you to paste the text.
              </p>
              <Button type="submit" variant="vermilion" size="lg" className="w-full" disabled={!valid || task.loading}>
                <Sparkles /> {task.loading ? "Researching…" : "Analyse"}
              </Button>
            </form>
          </Panel>
        }
        output={
          <OutputPanel
            title="Findings"
            loading={task.loading}
            error={task.error}
            hasData={!!d}
            onRetry={() => valid && task.run(input.trim())}
            emptyIcon={<FileSearch className="size-5" />}
            emptyText="Your summary, key insights and recommendations will appear here."
            loadingText={isUrl ? "Reading the page and analysing…" : "Analysing…"}
            actions={d && <Button onClick={() => copyText(notes()!, "Notes copied")}><ClipboardList /> Copy as notes</Button>}
          >
            {d && (
              <>
                <p className="text-xs text-muted-foreground">Source: <span className="text-foreground">{d.source}</span></p>
                {SECTIONS.map((s) => (
                  <OutputSection key={s.key} title={s.title}>
                    <textarea className="field-ghost text-[0.95rem]" aria-label={s.title} value={d[s.key]} onChange={(e) => task.setData({ ...d, [s.key]: e.target.value })} />
                  </OutputSection>
                ))}
              </>
            )}
          </OutputPanel>
        }
      />
    </>
  );
}

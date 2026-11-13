import type { ReactNode } from "react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function copyText(text: string, label = "Copied to clipboard") {
  navigator.clipboard.writeText(text).then(
    () => toast.success(label),
    () => toast.error("Couldn't copy. Select the text and copy manually."),
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <header className="mb-6 md:mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-vermilion">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-medium md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{children}</p>
    </header>
  );
}

export function Workspace({ input, output }: { input: ReactNode; output: ReactNode }) {
  return <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">{input}{output}</div>;
}

export function Panel({ title, actions, children, className }: { title: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("paper p-5 md:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-all",
            value === o.value ? "bg-card text-foreground shadow-soft" : "hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
      <span className="size-1.5 rounded-full bg-vermilion" /> AI-generated · editable
    </span>
  );
}

export function OutputSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t pt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function OutputPanel({ title, loading, error, hasData, onRetry, emptyIcon, emptyText, loadingText, actions, children }: {
  title: string; loading: boolean; error: string; hasData: boolean; onRetry: () => void;
  emptyIcon: ReactNode; emptyText: string; loadingText: string; actions?: ReactNode; children: ReactNode;
}) {
  return (
    <Panel title={title} actions={hasData && !loading ? <AiBadge /> : undefined} className="min-h-[22rem]">
      {loading ? (
        <div aria-live="polite" className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{loadingText}</p>
          {[90, 75, 95, 60, 80].map((w, i) => (
            <div key={i} className="h-3.5 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
          <AlertCircle className="size-6 text-destructive" />
          <p className="max-w-md text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}><RotateCcw /> Try again</Button>
        </div>
      ) : hasData ? (
        <div className="space-y-4">
          {children}
          {actions && <div className="flex flex-wrap gap-2 border-t pt-4">{actions}</div>}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-14 text-center text-muted-foreground">
          <div className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">{emptyIcon}</div>
          <p className="max-w-xs text-sm">{emptyText}</p>
        </div>
      )}
    </Panel>
  );
}



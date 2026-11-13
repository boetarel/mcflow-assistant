import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AiResult, EmailInput } from "./ai.functions";

export const EMAIL_FORM_KEY = "email.form";
export const EMAIL_RESULT_KEY = "email.result";
export const emptyEmailForm: EmailInput = { recipient: "", audience: "client", keyPoints: "", length: "short", tone: "formal" };

/** In-memory, per-tab store so work survives page switches but nothing is persisted. */
const Ctx = createContext<Map<string, unknown> | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const store = useRef(new Map<string, unknown>());
  return <Ctx.Provider value={store.current}>{children}</Ctx.Provider>;
}

export function useStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("WorkspaceProvider missing");
  return store;
}

export function useTabState<T>(key: string, initial: T) {
  const store = useStore();
  const [value, setValue] = useState<T>(() => (store.has(key) ? (store.get(key) as T) : initial));
  useEffect(() => void store.set(key, value), [store, key, value]);
  return [value, setValue] as const;
}

export function useAiTask<I, O>(key: string, call: (input: I) => Promise<AiResult<O>>) {
  const store = useStore();
  const [data, setData] = useTabState<O | null>(key, null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const run = async (input: I) => {
    setLoading(true);
    setError("");
    try {
      const res = await call(input);
      if (res.ok) {
        store.set(key, res.data);
        setData(res.data);
      } else setError(res.error);
    } catch {
      setError("Couldn't reach the AI service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  return { data, setData, loading, error, run };
}

/**
 * Login that comes to the user — any feature that needs an account pops this
 * modal on top of whatever the user is doing instead of bouncing them to a
 * login page they have to find (founder directive 2026-10-31). It is the
 * SAME sign-in as /auth (same AuthContext, same accounts) — only the
 * presentation is an overlay, and on success the user stays exactly where
 * they were, with the feature unlocked.
 *
 * Any component can summon it with `requestLogin("why")`; ProtectedRoute
 * fires it automatically, and hosting a live room asks through it too.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const LOGIN_REQUIRED_EVENT = "wl:login-required";

export function requestLogin(reason?: string) {
  window.dispatchEvent(new CustomEvent(LOGIN_REQUIRED_EVENT, { detail: { reason } }));
}

export function LoginModalHost() {
  const { user, signIn, signUp, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"in" | "up">("in");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const on = (e: Event) => {
      setReason(((e as CustomEvent).detail?.reason as string) ?? null);
      setError(null);
      setOpen(true);
    };
    window.addEventListener(LOGIN_REQUIRED_EVENT, on);
    return () => window.removeEventListener(LOGIN_REQUIRED_EVENT, on);
  }, []);

  /* Signed in (here or anywhere else) — the modal's job is done. */
  React.useEffect(() => {
    if (user && open) setOpen(false);
  }, [user, open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await signIn(em, password);
        if (error) setError(error.message || "Could not sign in. Check your email and password.");
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        const fallback = em.split("@")[0];
        const { error } = await signUp(em, password, {
          first_name: firstName.trim() || fallback,
          last_name: "",
          role: "consumer",
        });
        if (error) {
          setError(error.message || "Could not create the account.");
          return;
        }
        /* If email confirmation left no session, sign in directly. */
        await signIn(em, password);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "microsoft") => {
    setError(null);
    const { error } = provider === "google" ? await signInWithGoogle() : await signInWithMicrosoft();
    if (error) setError(error.message || "That sign-in did not start. Try email instead.");
  };

  const inputCls =
    "w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Log in">
      <div className="relative w-full max-w-sm rounded-[1.75rem] bg-white p-7 shadow-2xl sm:p-8">
        <button
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue-600">Wonderlands account</div>
        <h2 className="mt-1.5 text-xl font-semibold text-zinc-900">{mode === "in" ? "Log in" : "Create your account"}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          {reason ?? "This feature needs an account. It takes a few seconds — you will stay right here."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-zinc-100 p-1 text-sm">
          {(["in", "up"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`rounded-full py-1.5 transition ${mode === m ? "bg-zinc-900 font-medium text-white" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              {m === "in" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          {mode === "up" && (
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" autoComplete="given-name" className={inputCls} />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" autoComplete="email" className={inputCls} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} className={inputCls} />
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50">
            {busy ? "One moment…" : mode === "in" ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200" /> or <span className="h-px flex-1 bg-zinc-200" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => void oauth("google")} className="rounded-full border border-zinc-200 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50">
            Google
          </button>
          <button onClick={() => void oauth("microsoft")} className="rounded-full border border-zinc-200 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50">
            Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}

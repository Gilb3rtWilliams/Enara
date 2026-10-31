import { FormEvent, useState } from "react";
import { AuthHeader, Field, FieldError, Icon } from "../components/ui";
import { hashPassword } from "../lib/auth";
import { useFlow } from "../lib/flow";
import { useStore } from "../lib/store";

export function Login() {
  const { go } = useFlow();
  const { data, update } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const profile = data.profile;
    if (!profile) return setError("There’s no account in this browser yet. Create one to get started.");
    setBusy(true);
    try {
      const hash = await hashPassword(password, profile.salt);
      if (email.trim().toLowerCase() !== profile.email || hash !== profile.passHash) {
        return setError("That email and password don’t match the account in this browser.");
      }
      update((d) => ({ ...d, signedIn: true }));
      go(data.results.length ? "dashboard" : "assessment", { section: 0 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AuthHeader onBack={() => go("welcome")} />
      <main className="screen-content auth-content">
        <div className="title-block">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to Enara</h1>
          <p>Continue your private health assessment.</p>
        </div>
        <form onSubmit={submit} className="form-stack" noValidate>
          <Field label="Email address" name="email" type="email" placeholder="you@example.com" icon="mail" value={email} onChange={setEmail} autoComplete="email" />
          <Field label="Password" name="password" type="password" placeholder="Enter your password" icon="lock" value={password} onChange={setPassword} autoComplete="current-password" />
          <button
            type="button"
            className="text-button forgot-button"
            onClick={() => window.alert("Password reset isn’t available yet.\n\nYour Enara account is stored in this browser only, so it can’t be reset by email. You can delete your data from the profile menu and create a new account.")}
          >
            Forgot password?
          </button>
          <FieldError>{error}</FieldError>
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
            <Icon name="arrow" size={19} />
          </button>
        </form>
        <p className="auth-switch">
          New to Enara?{" "}
          <button type="button" className="text-button" onClick={() => go("signup")}>
            Create account
          </button>
        </p>
      </main>
    </>
  );
}

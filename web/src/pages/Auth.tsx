import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChoiceGroup, Field, FieldError } from "../components/Form";
import { Icon } from "../components/Icon";
import { hashPassword, newSalt } from "../lib/auth";
import { useStore } from "../lib/store";
import { useTitle } from "../lib/useTitle";
import { ageFromDob } from "../lib/validation";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignIn() {
  useTitle("Sign in · Enara");
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
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
      navigate(from ?? (data.results.length ? "/dashboard" : "/check"), { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">Welcome back</p>
      <h1>Sign in to Enara</h1>
      <p className="auth-lead">Continue your private health assessment.</p>
      <form onSubmit={submit} className="form" noValidate>
        <Field label="Email address" name="email" type="email" placeholder="you@example.com" icon="mail" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Password" name="password" type="password" placeholder="Enter your password" icon="lock" value={password} onChange={setPassword} autoComplete="current-password" />
        <button
          type="button"
          className="text-link align-right"
          onClick={() => window.alert("Password reset isn’t available yet.\n\nYour Enara account is stored in this browser only, so it can’t be reset by email. You can delete your data from the account menu and create a new account.")}
        >
          Forgot password?
        </button>
        <FieldError>{error}</FieldError>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"} <Icon name="arrow" size={19} />
        </button>
      </form>
      <p className="auth-switch">
        New to Enara? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}

export function SignUp() {
  useTitle("Create your account · Enara");
  const navigate = useNavigate();
  const { update } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"female" | "intersex" | "">("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const clear = (k: string) => setErrors((e) => ({ ...e, [k]: undefined }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const e: Record<string, string> = {};
    const age = dob ? ageFromDob(dob) : null;
    if (!name.trim()) e.name = "Tell us what to call you.";
    if (!EMAIL.test(email.trim())) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Use at least 8 characters.";
    if (age === null) e.dob = "Enter your date of birth.";
    else if (age < 10 || age > 70) e.dob = "This assessment is designed for ages 10 to 70.";
    if (!sex) e.sex = "Please choose an option.";
    if (!agree) e.agree = "Please agree to continue.";
    setErrors(e);
    if (Object.keys(e).length || !sex || age === null) return;

    setBusy(true);
    try {
      const salt = newSalt();
      const passHash = await hashPassword(password, salt);
      update((d) => ({
        ...d,
        signedIn: true,
        profile: { email: email.trim().toLowerCase(), name: name.trim(), dob, sex, salt, passHash },
        draft: { ...d.draft, age: d.draft.age || String(age) },
      }));
      navigate("/check", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">Your account</p>
      <h1>Let’s get you started</h1>
      <p className="auth-lead">Create a private account to save your progress and results on this device.</p>
      <form onSubmit={submit} className="form" noValidate>
        <Field label="Preferred name" name="name" placeholder="e.g. Maya" icon="user" value={name} onChange={(v) => { setName(v); clear("name"); }} error={errors.name} autoComplete="given-name" />
        <Field label="Email address" name="email" type="email" placeholder="you@example.com" icon="mail" value={email} onChange={(v) => { setEmail(v); clear("email"); }} error={errors.email} autoComplete="email" />
        <Field label="Create password" name="password" type="password" placeholder="At least 8 characters" icon="lock" value={password} onChange={(v) => { setPassword(v); clear("password"); }} error={errors.password} autoComplete="new-password" />
        <div className="form-grid two">
          <Field label="Date of birth" name="birthdate" type="date" value={dob} max={today} onChange={(v) => { setDob(v); clear("dob"); }} error={errors.dob} autoComplete="bday" />
          <ChoiceGroup
            label="Sex assigned at birth"
            name="sex"
            options={[{ label: "Female", value: "female" as const }, { label: "Intersex", value: "intersex" as const }]}
            value={sex}
            onChange={(v) => { setSex(v); clear("sex"); }}
            error={errors.sex}
          />
        </div>
        <div>
          <label className="consent">
            <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); clear("agree"); }} />
            <span>
              I understand Enara is a screening tool, not a diagnosis, and I agree to the <Link to="/privacy" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Privacy notice</Link> (opens in a new tab).
            </span>
          </label>
          <FieldError>{errors.agree}</FieldError>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Setting up…" : "Create account and start"} <Icon name="arrow" size={19} />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}

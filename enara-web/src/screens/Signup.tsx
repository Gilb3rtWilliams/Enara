import { FormEvent, useState } from "react";
import { AuthHeader, Field, FieldError, Icon } from "../components/ui";
import { useFlow } from "../lib/flow";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Signup() {
  const { go } = useFlow();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; agree?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const e: typeof errors = {};
    if (!EMAIL.test(email.trim())) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Use at least 8 characters.";
    if (!agree) e.agree = "Please agree to continue.";
    setErrors(e);
    if (Object.keys(e).length === 0) go("profile", { signup: { email: email.trim().toLowerCase(), password } });
  }

  return (
    <>
      <AuthHeader onBack={() => go("welcome")} step="Step 1 of 2" />
      <main className="screen-content auth-content">
        <div className="title-block">
          <p className="eyebrow">Your account</p>
          <h1>Let’s get you started</h1>
          <p>Create a secure account to save your progress and results.</p>
        </div>
        <form onSubmit={submit} className="form-stack" noValidate>
          <Field label="Email address" name="email" type="email" placeholder="you@example.com" icon="mail" value={email} onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }} error={errors.email} autoComplete="email" />
          <Field label="Create password" name="password" type="password" placeholder="At least 8 characters" icon="lock" value={password} onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }} error={errors.password} autoComplete="new-password" />
          <div>
            <label className="consent-row">
              <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrors((x) => ({ ...x, agree: undefined })); }} />
              <span>
                I agree to the <button type="button">Terms</button> and <button type="button">Privacy Policy</button>.
              </span>
            </label>
            <FieldError>{errors.agree}</FieldError>
          </div>
          <button className="primary-button" type="submit">
            Continue
            <Icon name="arrow" size={19} />
          </button>
        </form>
        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" className="text-button" onClick={() => go("login")}>
            Sign in
          </button>
        </p>
      </main>
    </>
  );
}

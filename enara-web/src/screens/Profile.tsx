import { FormEvent, useState } from "react";
import { AuthHeader, ChoiceGroup, Field, Icon } from "../components/ui";
import { hashPassword, newSalt } from "../lib/auth";
import { useFlow } from "../lib/flow";
import { useStore } from "../lib/store";
import { ageFromDob } from "../lib/validation";

export function Profile() {
  const { flow, go } = useFlow();
  const { update } = useStore();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"female" | "intersex" | "">("");
  const [errors, setErrors] = useState<{ name?: string; dob?: string; sex?: string }>({});
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const e: typeof errors = {};
    const age = dob ? ageFromDob(dob) : null;
    if (!name.trim()) e.name = "Tell us what to call you.";
    if (age === null) e.dob = "Enter your date of birth.";
    else if (age < 10 || age > 70) e.dob = "This assessment is designed for ages 10 to 70.";
    if (!sex) e.sex = "Please choose an option.";
    setErrors(e);
    if (Object.keys(e).length || !flow.signup || !sex || age === null) return;

    setBusy(true);
    try {
      const salt = newSalt();
      const passHash = await hashPassword(flow.signup.password, salt);
      update((d) => ({
        ...d,
        signedIn: true,
        profile: { email: flow.signup!.email, name: name.trim(), dob, sex, salt, passHash },
        draft: { ...d.draft, age: d.draft.age || String(age) },
      }));
      go("assessment", { section: 0, signup: null });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AuthHeader onBack={() => go("signup")} step="Step 2 of 2" />
      <main className="screen-content auth-content">
        <div className="profile-icon">
          <Icon name="user" size={25} />
        </div>
        <div className="title-block">
          <p className="eyebrow">Your profile</p>
          <h1>What should we call you?</h1>
          <p>A few details to make your experience feel more personal.</p>
        </div>
        <form onSubmit={submit} className="form-stack" noValidate>
          <Field label="Preferred name" name="name" placeholder="e.g. Maya" icon="user" value={name} onChange={(v) => { setName(v); setErrors((x) => ({ ...x, name: undefined })); }} error={errors.name} autoComplete="given-name" />
          <Field label="Date of birth" name="birthdate" type="date" icon="calendar" value={dob} max={today} onChange={(v) => { setDob(v); setErrors((x) => ({ ...x, dob: undefined })); }} error={errors.dob} autoComplete="bday" />
          <ChoiceGroup
            label="Sex assigned at birth"
            name="sex"
            options={[{ label: "Female", value: "female" as const }, { label: "Intersex", value: "intersex" as const }]}
            value={sex}
            onChange={(v) => { setSex(v); setErrors((x) => ({ ...x, sex: undefined })); }}
            error={errors.sex}
          />
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Setting up…" : "Start assessment"}
            <Icon name="arrow" size={19} />
          </button>
        </form>
        <p className="microcopy">This takes about 4 minutes. You can pause at any time.</p>
      </main>
    </>
  );
}

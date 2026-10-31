import { FormEvent, useState } from "react";
import { ApiError, predict } from "../lib/api";
import { AuthHeader, Field, Icon } from "../components/ui";
import { useFlow } from "../lib/flow";
import { useStore } from "../lib/store";
import { Labs } from "../lib/types";
import { Errors, LAB_SPEC, rangeNote, validateLabs } from "../lib/validation";

export function TierTwo() {
  const { go } = useFlow();
  const { data } = useStore();
  const base = data.results[0]; // the saved Tier 1 assessment these results belong to
  const [labs, setLabs] = useState<Labs>({ ca125: "", crp: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (k: keyof Labs, v: string) => {
    setLabs((l) => ({ ...l, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errs = validateLabs(labs);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k]) || !base) return;
    setBusy(true);
    setApiError(null);
    try {
      const prediction = await predict(base.answers, labs);
      if (!prediction.tier2) {
        setApiError("The Tier 2 result couldn’t be calculated for these answers. Please try again.");
        return;
      }
      go("finalResult", { pending: { prediction, answers: base.answers, labs } });
      window.scrollTo({ top: 0 });
    } catch (e) {
      setApiError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const note = (k: keyof Labs) => {
    const s = LAB_SPEC[k];
    return rangeNote(labs[k], s.min, s.max, s.train);
  };

  return (
    <>
      <AuthHeader onBack={() => go("dashboard")} step="Tier 2" />
      <main className="screen-content auth-content">
        <div className="tier-badge">Hospital blood tests</div>
        <div className="title-block">
          <p className="eyebrow">Clinical follow-up</p>
          <h1>Add your Tier 2 results</h1>
          <p>Enter results only from a hospital or accredited laboratory report. These biomarkers should be interpreted by a healthcare professional.</p>
        </div>
        <form onSubmit={submit} className="form-stack" noValidate>
          <Field label="CA-125 level" name="ca125" type="number" inputMode="decimal" placeholder="e.g. 24" suffix="U/mL" value={labs.ca125} onChange={(v) => set("ca125", v)} error={errors.ca125} note={note("ca125")} />
          <Field label="CRP level" name="crp" type="number" inputMode="decimal" placeholder="e.g. 3.1" suffix="mg/L" value={labs.crp} onChange={(v) => set("crp", v)} error={errors.crp} note={note("crp")} />
          <div className="clinical-note">
            <Icon name="shield" size={20} />
            <p>CA-125 and CRP cannot diagnose endometriosis on their own. Enara uses them only as supporting clinical context.</p>
          </div>
          {apiError ? <p className="error-banner" role="alert">{apiError}</p> : null}
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Calculating…" : "Save hospital results"}
            <Icon name="check" size={19} />
          </button>
        </form>
      </main>
    </>
  );
}

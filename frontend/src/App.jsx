import { useEffect, useRef, useState } from "react";
import { STEPS, buildPayload, initialValues, validateFields } from "./fields.js";
import { predict } from "./api.js";
import { Field } from "./components/Fields.jsx";
import BmiHelper from "./components/BmiHelper.jsx";
import Result from "./components/Result.jsx";

function Intro({ onStart }) {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <h1 id="intro-title">A two-step symptom check for endometriosis risk</h1>
      <p className="lede">
        Answer twelve questions about your body, cycle and symptoms. If your score comes back elevated,
        you can add two blood test values for a more reliable estimate. It takes about three minutes.
      </p>

      <ol className="track">
        <li>
          <strong>Symptoms</strong>
          <span>Instant. Uses your answers only.</span>
        </li>
        <li>
          <strong>Blood test values</strong>
          <span>Only if step 1 is elevated. CA-125 and CRP.</span>
        </li>
      </ol>

      <p className="disclaimer">
        This is a screening tool trained on a synthetic dataset. It cannot diagnose endometriosis and is not a
        substitute for seeing a doctor.
      </p>
      <button type="button" className="btn btn-primary" onClick={onStart}>Start the check</button>
    </section>
  );
}

function Progress({ index }) {
  return (
    <nav className="progress" aria-label="Progress">
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.id} className={i === index ? "current" : i < index ? "done" : ""} aria-current={i === index ? "step" : undefined}>
            <span className="progress-n">{i + 1}</span>
            <span className="progress-t">{s.title}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function App() {
  const [stage, setStage] = useState("intro"); // intro | form | result
  const [stepIdx, setStepIdx] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [labError, setLabError] = useState(null);
  const headingRef = useRef(null);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  // Move focus to the step heading whenever the step changes.
  useEffect(() => {
    if (stage === "form") headingRef.current?.focus();
  }, [stage, stepIdx]);

  const setValue = (name, v) => {
    setValues((vals) => ({ ...vals, [name]: v }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const run = async (labs) => {
    const payload = buildPayload(values, labs);
    const data = await predict(payload);
    setResult(data);
    setStage("result");
  };

  const next = async () => {
    const errs = validateFields(step.fields, values);
    setErrors(errs);
    const firstBad = step.fields.find((f) => errs[f.name]);
    if (firstBad) {
      document.getElementById(firstBad.name)?.focus() ??
        document.querySelector(`input[name="${firstBad.name}"]`)?.focus();
      return;
    }
    if (!isLast) {
      setStepIdx(stepIdx + 1);
      return;
    }
    setBusy(true);
    setApiError(null);
    try {
      await run(null);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const submitLabs = async (labs) => {
    setBusy(true);
    setLabError(null);
    try {
      await run(labs);
    } catch (e) {
      setLabError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setValues(initialValues());
    setErrors({});
    setResult(null);
    setStepIdx(0);
    setApiError(null);
    setLabError(null);
    setStage("intro");
  };

  const edit = () => {
    setResult(null);
    setLabError(null);
    setStepIdx(0);
    setStage("form");
  };

  return (
    <div className="app">
      <header className="site-header">
        <span className="ribbon" aria-hidden="true" />
        <span className="site-name">Endometriosis risk check</span>
      </header>

      <main className="main">
        {stage === "intro" && <Intro onStart={() => setStage("form")} />}

        {stage === "form" && (
          <div className="form-layout">
            <Progress index={stepIdx} />
            <form
              className="step"
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              noValidate
            >
              <h2 tabIndex={-1} ref={headingRef}>{step.title}</h2>
              <p className="step-intro">{step.intro}</p>

              <div className={`fields${step.id === "about" || step.id === "cycle" ? " two-col" : ""}`}>
                {step.fields.map((f) => (
                  <Field key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={setValue} />
                ))}
              </div>

              {step.id === "about" ? <BmiHelper onUse={(b) => setValue("bmi", b)} /> : null}

              {apiError ? <p className="error banner" role="alert">{apiError}</p> : null}

              <div className="actions">
                {stepIdx > 0 ? (
                  <button type="button" className="btn btn-quiet" onClick={() => setStepIdx(stepIdx - 1)}>Back</button>
                ) : (
                  <button type="button" className="btn btn-quiet" onClick={() => setStage("intro")}>Back</button>
                )}
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {isLast ? (busy ? "Calculating…" : "See my result") : "Continue"}
                </button>
              </div>
            </form>
          </div>
        )}

        {stage === "result" && result && (
          <Result
            result={result}
            onLabs={submitLabs}
            labBusy={busy}
            labError={labError}
            onEdit={edit}
            onRestart={restart}
          />
        )}
      </main>

      <footer className="site-footer">
        Screening tool built on synthetic data. Not a diagnosis. See a qualified healthcare professional about symptoms that persist or worsen.
      </footer>
    </div>
  );
}

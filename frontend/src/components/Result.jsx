import { useEffect, useRef, useState } from "react";
import { LAB_FIELDS, validateFields } from "../fields.js";
import { NumberField } from "./Fields.jsx";

const OUTCOMES = {
  no_action: {
    tone: "ok",
    title: "Low symptom risk",
    lead: "Your answers did not reach the model’s elevated-risk cutoff.",
  },
  order_lab_kit: {
    tone: "alert",
    title: "Elevated symptom risk",
    lead: "Your answers reached the model’s elevated-risk cutoff. Two blood test values can make the estimate more reliable.",
  },
  see_doctor: {
    tone: "alert",
    title: "Elevated risk with lab results",
    lead: "Your symptoms and lab values together reached the model’s elevated-risk cutoff.",
  },
  monitor_symptoms: {
    tone: "ok",
    title: "Lower risk with lab results",
    lead: "Your symptoms and lab values together stayed below the model’s elevated-risk cutoff.",
  },
};

const fmt = (p) => (p >= 0.995 ? ">99%" : p < 0.005 ? "<1%" : `${Math.round(p * 100)}%`);

function Meter({ label, probability, threshold, tone }) {
  const cut = Math.round(threshold * 100);
  return (
    <div className="meter">
      <div className="meter-head">
        <span>{label}</span>
        <strong>{fmt(probability)}</strong>
      </div>
      <div
        className="meter-track"
        role="img"
        aria-label={`${label}: ${fmt(probability)}. The elevated-risk cutoff is ${cut}%.`}
      >
        <div className={`meter-fill ${tone}`} style={{ width: `${Math.min(100, probability * 100)}%` }} />
        <div className="meter-cut" style={{ left: `${cut}%` }} />
      </div>
      <div className="meter-scale" aria-hidden="true">
        <span>0%</span>
        <span className="meter-cut-label" style={{ left: `${cut}%` }}>cutoff {cut}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function LabForm({ onSubmit, busy, error }) {
  const [labs, setLabs] = useState({ ca_125_level: "", crp_level: "" });
  const [errors, setErrors] = useState({});

  const change = (name, v) => {
    setLabs((l) => ({ ...l, [name]: v }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validateFields(LAB_FIELDS, labs);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(labs);
  };

  return (
    <form className="panel labs" onSubmit={submit} noValidate>
      <h3>Add your blood test values</h3>
      <p>Enter both values from your CA-125 and CRP results. The model then re-scores you using your symptoms and these two numbers.</p>
      <div className="fields two-col">
        {LAB_FIELDS.map((f) => (
          <NumberField key={f.name} field={f} value={labs[f.name]} error={errors[f.name]} onChange={change} />
        ))}
      </div>
      {error ? <p className="error banner" role="alert">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Calculating…" : "Update my result"}
      </button>
    </form>
  );
}

function Explanation({ text }) {
  const blocks = text.split("\n\n").map((b) => b.trim()).filter(Boolean);
  return (
    <div className="explanation">
      {blocks.map((block, i) => {
        const [first, ...rest] = block.split("\n");
        const isHeading = rest.length > 0 && /^[A-Z0-9 ]+$/.test(first);
        if (isHeading) {
          const sentence = first.charAt(0) + first.slice(1).toLowerCase();
          return (
            <div key={i}>
              <h4>{sentence}</h4>
              <p>{rest.join(" ")}</p>
            </div>
          );
        }
        return <p key={i}>{block.replace(/\n/g, " ")}</p>;
      })}
    </div>
  );
}

export default function Result({ result, onLabs, labBusy, labError, onEdit, onRestart }) {
  const headingRef = useRef(null);
  const outcome = OUTCOMES[result.next_step];

  useEffect(() => {
    headingRef.current?.focus();
  }, [result.next_step]);

  return (
    <section className="result" aria-labelledby="result-title">
      <div className={`verdict ${outcome.tone}`}>
        <h2 id="result-title" tabIndex={-1} ref={headingRef}>{outcome.title}</h2>
        <p>{outcome.lead}</p>
      </div>

      <div className="panel">
        <Meter
          label="Symptoms only"
          probability={result.tier1.probability}
          threshold={result.threshold}
          tone={result.tier1.elevated_risk ? "alert" : "ok"}
        />
        {result.tier2 ? (
          <Meter
            label="Symptoms and lab results"
            probability={result.tier2.probability}
            threshold={result.threshold}
            tone={result.tier2.elevated_risk ? "alert" : "ok"}
          />
        ) : null}
        <p className="recommendation">{result.recommendation}</p>
      </div>

      {result.next_step === "order_lab_kit" ? (
        <LabForm onSubmit={onLabs} busy={labBusy} error={labError} />
      ) : null}

      {result.warnings?.length ? (
        <div className="panel warnings">
          <h3>Things to know about this result</h3>
          <ul>
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      ) : null}

      <details className="panel more">
        <summary>Read the full explanation</summary>
        <Explanation text={result.explanation} />
      </details>

      <p className="disclaimer">{result.disclaimer}</p>

      <div className="actions">
        <button type="button" className="btn btn-quiet" onClick={onEdit}>Change my answers</button>
        <button type="button" className="btn btn-quiet" onClick={onRestart}>Start over</button>
      </div>
    </section>
  );
}

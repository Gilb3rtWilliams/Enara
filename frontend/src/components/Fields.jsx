import { rangeNote } from "../fields.js";

function Shell({ field, error, note, children, as = "div" }) {
  const Tag = as;
  return (
    <Tag className={`field${error ? " has-error" : ""}`}>
      {children}
      {field.hint && as !== "fieldset" ? <p className="hint" id={`${field.name}-hint`}>{field.hint}</p> : null}
      {note && !error ? <p className="note">{note}</p> : null}
      {error ? <p className="error" id={`${field.name}-error`} role="alert">{error}</p> : null}
    </Tag>
  );
}

export function NumberField({ field, value, error, onChange }) {
  const note = rangeNote(field, value);
  const describedBy = [field.hint && `${field.name}-hint`, error && `${field.name}-error`].filter(Boolean).join(" ");
  return (
    <Shell field={field} error={error} note={note}>
      <label htmlFor={field.name} className="label">{field.label}</label>
      <div className="input-wrap">
        <input
          id={field.name}
          name={field.name}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
        />
        {field.unit ? <span className="unit">{field.unit}</span> : null}
      </div>
    </Shell>
  );
}

export function ScaleField({ field, value, error, onChange }) {
  const points = Array.from({ length: field.max - field.min + 1 }, (_, i) => i + field.min);
  return (
    <Shell field={field} error={error} as="fieldset">
      <legend className="label">{field.label}</legend>
      {field.hint ? <p className="hint" id={`${field.name}-hint`}>{field.hint}</p> : null}
      <div className="scale" role="radiogroup" aria-label={field.label}>
        {points.map((p) => (
          <label key={p} className={`scale-pt${value === p ? " on" : ""}`}>
            <input
              type="radio"
              name={field.name}
              value={p}
              checked={value === p}
              onChange={() => onChange(field.name, p)}
            />
            <span>{p}</span>
          </label>
        ))}
      </div>
      <div className="scale-ends" aria-hidden="true">
        <span>None</span>
        <span>Worst</span>
      </div>
    </Shell>
  );
}

export function BinaryField({ field, value, error, onChange }) {
  return (
    <Shell field={field} error={error} as="fieldset">
      <legend className="label">{field.label}</legend>
      <div className="binary" role="radiogroup" aria-label={field.label}>
        {[
          [1, "Yes"],
          [0, "No"],
        ].map(([v, text]) => (
          <label key={v} className={`pill${value === v ? " on" : ""}`}>
            <input type="radio" name={field.name} value={v} checked={value === v} onChange={() => onChange(field.name, v)} />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </Shell>
  );
}

export function Field({ field, ...props }) {
  if (field.kind === "scale") return <ScaleField field={field} {...props} />;
  if (field.kind === "binary") return <BinaryField field={field} {...props} />;
  return <NumberField field={field} {...props} />;
}

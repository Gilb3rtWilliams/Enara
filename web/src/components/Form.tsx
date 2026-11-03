import { Icon, IconName } from "./Icon";

export function FieldError({ children }: { children?: string | null }) {
  return children ? (
    <span className="field-error" role="alert">
      {children}
    </span>
  ) : null;
}

export function Field({
  label, name, type = "text", placeholder, icon, suffix, value, onChange, error, note, hint, inputMode, autoComplete, max,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: IconName;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  note?: string | null;
  hint?: string;
  inputMode?: "decimal" | "numeric" | "email" | "text";
  autoComplete?: string;
  max?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {hint ? <span className="field-hint">{hint}</span> : null}
      <span className="control">
        {icon && (
          <span className="control-icon">
            <Icon name={icon} size={19} />
          </span>
        )}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          max={max}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={`${icon ? "has-icon" : ""}${suffix ? " has-suffix" : ""}${error ? " is-invalid" : ""}`}
        />
        {suffix && <span className="control-suffix">{suffix}</span>}
      </span>
      {note && !error ? <span className="field-note">{note}</span> : null}
      <FieldError>{error}</FieldError>
    </label>
  );
}

export function ScoreSlider({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="slider-card">
      <div className="slider-top">
        <div>
          <span className="field-label">{label}</span>
          <p>{hint}</p>
        </div>
        <output aria-label={`${label} score`}>{value}</output>
      </div>
      <input aria-label={label} type="range" min="0" max="10" step="1" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="slider-ends">
        <span>None</span>
        <span>Severe</span>
      </div>
    </div>
  );
}

export function ChoiceGroup<T extends string>({
  label, name, options, value, onChange, error,
}: {
  label: string;
  name: string;
  options: { label: string; value: T }[];
  value: T | "";
  onChange: (v: T) => void;
  error?: string | null;
}) {
  return (
    <fieldset className="field choice-field">
      <legend className="field-label">{label}</legend>
      <div className="choice-row">
        {options.map((o) => (
          <label className="choice" key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <FieldError>{error}</FieldError>
    </fieldset>
  );
}

/** Ring that follows the real score. p is 0-1. */
export function ScoreRing({ p, text, label }: { p: number; text: string; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0.02, p)) * 1000) / 10;
  return (
    <div className="score-ring" style={{ ["--p" as string]: `${pct}%` }} role="img" aria-label={`${text} ${label}`}>
      <div>
        <strong>{text}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

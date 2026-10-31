import { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  flower: (
    <>
      <path d="M12 12c-4-1-5-5-3-7 2-2 5 0 3 7Z" />
      <path d="M12 12c1-4 5-5 7-3 2 2 0 5-7 3Z" />
      <path d="M12 12c4 1 5 5 3 7-2 2-5 0-3-7Z" />
      <path d="M12 12c-1 4-5 5-7 3-2-2 0-5 7-3Z" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  arrow: <path d="m9 18 6-6-6-6" />,
  back: <path d="m15 18-6-6 6-6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4m8-4v4M3 10h18" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  shield: (
    <>
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.4 4.1L17 9l-3.6 1.9L12 15l-1.4-4.1L7 9l3.6-1.9L12 3Z" />
      <path d="m18.5 15 .7 2.1L21 18l-1.8.9-.7 2.1-.7-2.1L16 18l1.8-.9.7-2.1Z" />
    </>
  ),
};

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Icon name="flower" size={compact ? 18 : 23} />
      </span>
      <span className={compact ? "brand-name brand-name-small" : "brand-name"}>Enara</span>
    </div>
  );
}

export function AuthHeader({ onBack, step }: { onBack: () => void; step?: string }) {
  return (
    <header className="topbar">
      <button type="button" className="icon-button" onClick={onBack} aria-label="Go back">
        <Icon name="back" />
      </button>
      {step ? <span className="topbar-step">{step}</span> : <Brand compact />}
      <span className="icon-spacer" />
    </header>
  );
}

export function FieldError({ children }: { children?: string | null }) {
  return children ? (
    <span className="field-error" role="alert">
      {children}
    </span>
  ) : null;
}

export function Field({
  label, name, type = "text", placeholder, icon, suffix, value, onChange, error, note, inputMode, autoComplete, max,
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
  inputMode?: "decimal" | "numeric" | "email" | "text";
  autoComplete?: string;
  max?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        {icon && (
          <span className="input-icon">
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
          className={`${icon ? "has-icon" : suffix ? "has-suffix" : ""}${error ? " is-invalid" : ""}`}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </span>
      {note && !error ? <span className="field-note">{note}</span> : null}
      <FieldError>{error}</FieldError>
    </label>
  );
}

export function ScoreSlider({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (value: number) => void }) {
  const fill = `${value * 10}%`;
  return (
    <div className="slider-card">
      <div className="slider-heading">
        <div>
          <span className="field-label">{label}</span>
          <p>{hint}</p>
        </div>
        <output aria-label={`${label} score`}>{value}</output>
      </div>
      <input
        aria-label={label}
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        style={{ ["--fill" as string]: fill }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="range-labels">
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
    <fieldset className="field">
      <legend className="field-label">{label}</legend>
      <div className="choice-grid">
        {options.map((o) => (
          <label className="choice-card" key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <FieldError>{error}</FieldError>
    </fieldset>
  );
}

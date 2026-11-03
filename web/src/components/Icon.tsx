import { ReactNode } from "react";
import { Link } from "react-router-dom";

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
  mail: (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>),
  lock: (<><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4m8-4v4M3 10h18" /></>),
  home: (<><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>),
  history: (<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>),
  check: <path d="m5 12 4 4L19 6" />,
  shield: (<><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>),
  spark: (<><path d="m12 3 1.4 4.1L17 9l-3.6 1.9L12 15l-1.4-4.1L7 9l3.6-1.9L12 3Z" /><path d="m18.5 15 .7 2.1L21 18l-1.8.9-.7 2.1-.7-2.1L16 18l1.8-.9.7-2.1Z" /></>),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  drop: <path d="M12 3c3.5 4.2 6 7.2 6 10.4A6 6 0 0 1 6 13.4C6 10.2 8.5 7.2 12 3Z" />,
  pulse: <path d="M3 12h4l2.5-6 4 12L16 12h5" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
};

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

/** The Enara mark: plum rounded square with the white flower, plus the wordmark. */
export function Brand({ to = "/", size = "md", light = false }: { to?: string | null; size?: "sm" | "md" | "lg"; light?: boolean }) {
  const inner = (
    <>
      <span className={`brand-mark brand-${size}`}>
        <Icon name="flower" size={size === "lg" ? 34 : size === "sm" ? 17 : 22} />
      </span>
      <span className={`brand-name brand-name-${size}${light ? " brand-name-light" : ""}`}>Enara</span>
    </>
  );
  return to ? (
    <Link to={to} className="brand" aria-label="Enara home">
      {inner}
    </Link>
  ) : (
    <span className="brand">{inner}</span>
  );
}

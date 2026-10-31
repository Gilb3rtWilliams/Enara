import { useEffect, useRef, useState } from "react";
import { useFlow } from "../lib/flow";
import { useStore } from "../lib/store";
import { Icon } from "./ui";

export type Tab = "dashboard" | "history" | "calendar";

export function BottomNav({ active, onNavigate }: { active: Tab; onNavigate: (screen: Tab) => void }) {
  const items = [
    { id: "dashboard" as const, label: "Dashboard", icon: "home" as const },
    { id: "history" as const, label: "History", icon: "history" as const },
    { id: "calendar" as const, label: "Calendar", icon: "calendar" as const },
  ];
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          className={active === item.id ? "nav-tab nav-tab-active" : "nav-tab"}
          onClick={() => onNavigate(item.id)}
          aria-current={active === item.id ? "page" : undefined}
        >
          <Icon name={item.icon} size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/** The round initial in the header; opens a small menu with sign out and delete-my-data. */
export function AvatarMenu() {
  const { go } = useFlow();
  const { data, update, wipe } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = data.profile?.name ?? "";

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="avatar-wrap" ref={ref}>
      <button type="button" className="avatar avatar-button" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        {(name.trim()[0] ?? "E").toUpperCase()}
      </button>
      {open ? (
        <div className="avatar-menu" role="menu">
          <p>{data.profile?.email}</p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              update((d) => ({ ...d, signedIn: false }));
              go("welcome");
            }}
          >
            Sign out
          </button>
          <button
            type="button"
            role="menuitem"
            className="danger"
            onClick={() => {
              if (window.confirm("Delete everything?\n\nThis removes your account, results and cycle log from this browser. It can’t be undone.")) {
                wipe();
                go("welcome");
              }
            }}
          >
            Delete my data
          </button>
        </div>
      ) : null}
    </div>
  );
}

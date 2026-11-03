import { useEffect, useRef, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { Brand, Icon } from "./Icon";

const DISCLAIMER = "Enara is a screening tool, not a diagnosis. If you have severe or sudden pain, heavy bleeding, fainting, or feel acutely unwell, seek urgent medical care.";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export function useSignedIn() {
  const { data } = useStore();
  return data.signedIn && !!data.profile;
}

/**
 * Checks access once, when someone enters the signed-in area. If they sign out while inside it, the sign-out
 * action navigates away itself, so the guard must not also react to the session changing.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data } = useStore();
  const location = useLocation();
  const [allowed] = useState(() => data.signedIn && !!data.profile);
  if (allowed) return <>{children}</>;
  return <Navigate to={data.profile ? "/signin" : "/signup"} replace state={{ from: location.pathname }} />;
}

/* ---------------- public pages ---------------- */

export function PublicLayout() {
  const signedIn = useSignedIn();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  useEffect(() => setOpen(false), [pathname, hash]);

  const links = (
    <>
      <Link to={{ pathname: "/", hash: "#how" }}>How it works</Link>
      <Link to="/about">About the model</Link>
      <Link to="/privacy">Privacy</Link>
      <Link to={{ pathname: "/", hash: "#faq" }}>FAQ</Link>
    </>
  );

  return (
    <div className="site">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container header-row">
          <Brand />
          <nav className="main-nav" aria-label="Main">{links}</nav>
          <div className="header-actions">
            {signedIn ? (
              <Link className="btn btn-primary btn-sm" to="/dashboard">Open dashboard</Link>
            ) : (
              <>
                <Link className="text-link" to="/signin">Sign in</Link>
                <Link className="btn btn-primary btn-sm" to="/signup">Start the check</Link>
              </>
            )}
            <button type="button" className="menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {open ? (
          <nav className="mobile-menu" aria-label="Mobile">
            {links}
            {!signedIn && <Link to="/signin">Sign in</Link>}
          </nav>
        ) : null}
      </header>
      <div id="main">
        <Outlet />
      </div>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Brand />
            <p className="footer-blurb">A private, two-step symptom check that helps you understand your endometriosis risk and what to ask your doctor next.</p>
          </div>
          <div>
            <h4>Enara</h4>
            <Link to={{ pathname: "/", hash: "#how" }}>How it works</Link>
            <Link to="/about">About the model</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
          <div>
            <h4>Your account</h4>
            <Link to="/signin">Sign in</Link>
            <Link to="/signup">Create an account</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div className="container footer-note">
          <p>{DISCLAIMER}</p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- sign in / sign up ---------------- */

export function AuthLayout() {
  return (
    <div className="auth-split">
      <div className="auth-main">
        <div className="auth-top">
          <Brand />
          <Link to="/" className="text-link back-link">
            <Icon name="back" size={16} /> Back to site
          </Link>
        </div>
        <div className="auth-form-wrap">
          <Outlet />
        </div>
        <p className="auth-fine">Enara is a screening tool, not a diagnosis.</p>
      </div>
      <aside className="auth-aside" aria-hidden="true">
        <i className="orbit o1" />
        <i className="orbit o2" />
        <i className="petal p1" />
        <i className="petal p2" />
        <i className="petal p3" />
        <div className="aside-card">
          <p className="eyebrow">Private by design</p>
          <ul>
            <li><Icon name="shield" size={18} /> Your account and results are saved on this device only</li>
            <li><Icon name="lock" size={18} /> Only the answers needed for a score are sent to the Enara service</li>
            <li><Icon name="check" size={18} /> Delete everything at any time from the account menu</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

/* ---------------- signed-in app ---------------- */

export function AvatarMenu() {
  const navigate = useNavigate();
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
      <button type="button" className="avatar" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        {(name.trim()[0] ?? "E").toUpperCase()}
      </button>
      {open ? (
        <div className="avatar-menu" role="menu">
          <p>
            <strong>{name}</strong>
            {data.profile?.email}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              // leave the signed-in area first; otherwise the auth guard would redirect to /signin
              navigate("/", { flushSync: true });
              update((d) => ({ ...d, signedIn: false }));
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
                navigate("/", { flushSync: true });
                wipe();
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

export function AppLayout() {
  return (
    <div className="site app-site">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container header-row">
          <Brand to="/dashboard" />
          <nav className="app-tabs" aria-label="App">
            <NavLink to="/dashboard"><Icon name="home" size={19} /><span>Dashboard</span></NavLink>
            <NavLink to="/history"><Icon name="history" size={19} /><span>History</span></NavLink>
            <NavLink to="/calendar"><Icon name="calendar" size={19} /><span>Calendar</span></NavLink>
          </nav>
          <div className="header-actions">
            <Link className="btn btn-quiet btn-sm new-check" to="/check">
              <Icon name="plus" size={16} /> New check
            </Link>
            <AvatarMenu />
          </div>
        </div>
      </header>
      <main id="main" className="app-main container">
        <Outlet />
      </main>
      <footer className="app-footer container">
        <p>{DISCLAIMER}</p>
      </footer>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useTitle } from "../lib/useTitle";

export function NotFound() {
  useTitle("Page not found · Enara");
  return (
    <section className="prose-page container not-found">
      <p className="eyebrow">404</p>
      <h1>We couldn’t find that page</h1>
      <p className="lede">The link may be old, or the page may have moved.</p>
      <Link className="btn btn-primary" to="/">Back to Enara</Link>
    </section>
  );
}

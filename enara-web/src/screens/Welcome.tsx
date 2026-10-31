import { useFlow } from "../lib/flow";
import { Icon } from "../components/ui";

export function Welcome() {
  const { go } = useFlow();
  return (
    <section className="welcome-screen">
      <div className="welcome-visual">
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="petal petal-one" />
        <div className="petal petal-two" />
        <div className="petal petal-three" />
        <div className="welcome-brand">
          <span className="welcome-mark">
            <Icon name="flower" size={34} />
          </span>
          <span>Enara</span>
        </div>
      </div>
      <div className="welcome-content">
        <p className="eyebrow">Understand your symptoms</p>
        <h1>Clarity starts with listening to your body.</h1>
        <p className="lead">A private, guided assessment to help you better understand your endometriosis risk.</p>
        <div className="button-stack">
          <button type="button" className="primary-button" onClick={() => go("login")}>
            Sign in
            <Icon name="arrow" size={19} />
          </button>
          <button type="button" className="secondary-button" onClick={() => go("signup")}>
            Create an account
          </button>
        </div>
        <p className="privacy-note">
          <Icon name="shield" size={15} />
          Your health information stays private
        </p>
      </div>
    </section>
  );
}

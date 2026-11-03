import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useSignedIn } from "../components/Layout";
import { useTitle } from "../lib/useTitle";

const FAQ = [
  {
    q: "Does Enara diagnose endometriosis?",
    a: "No. Enara is a screening tool. It looks for patterns in your answers that are associated with endometriosis and tells you whether they are lower or elevated. Only a qualified clinician can diagnose endometriosis, usually after an examination and further tests.",
  },
  {
    q: "What are CA-125 and CRP?",
    a: "Two blood markers that a hospital or laboratory can measure. Both can be raised by many conditions, so they can’t confirm endometriosis on their own. Enara uses them only as supporting context in the optional second step.",
  },
  {
    q: "Where is my data stored?",
    a: "Your account, saved results and cycle log are stored in this browser on this device. Only the answers needed to calculate a score are sent to the Enara service, and you can delete everything from the account menu.",
  },
  {
    q: "Do I need an account?",
    a: "A local account (email and password) protects your saved results on this device. It isn’t a server account, so it can’t be reset by email, and results don’t move between devices.",
  },
  {
    q: "How reliable is the result?",
    a: "The current model was trained on a synthetic dataset and has not been validated on real patients or reviewed by clinicians. Treat results as an illustration of how the tool works, not as medical information. The About page explains the model and its limits.",
  },
];

export function Home() {
  useTitle("Enara: a private symptom check for endometriosis risk");
  const signedIn = useSignedIn();
  const start = signedIn ? "/check" : "/signup";

  return (
    <>
      {/* hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Understand your symptoms</p>
            <h1>Clarity starts with listening to your body.</h1>
            <p className="lede">
              Enara is a private, two-step symptom check that helps you understand your endometriosis risk, and what to ask your doctor next.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to={start}>
                Start the check <Icon name="arrow" size={19} />
              </Link>
              <Link className="btn btn-quiet btn-lg" to={{ pathname: "/", hash: "#how" }}>
                See how it works
              </Link>
            </div>
            <ul className="trust-row">
              <li><Icon name="history" size={17} /> About 4 minutes</li>
              <li><Icon name="shield" size={17} /> Saved only on your device</li>
              <li><Icon name="check" size={17} /> Not a diagnosis</li>
            </ul>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <i className="orbit o1" />
            <i className="orbit o2" />
            <i className="petal p1" />
            <i className="petal p2" />
            <i className="petal p3" />
            <div className="float-mark">
              <span className="brand-mark brand-lg"><Icon name="flower" size={34} /></span>
              <span className="brand-name brand-name-lg">Enara</span>
            </div>
            <div className="pathway-card">
              <p className="eyebrow">Your testing pathway</p>
              <ol>
                <li>
                  <span className="dot done"><Icon name="check" size={15} /></span>
                  <div><strong>Tier 1 · Symptom check</strong><small>From your phone or laptop</small></div>
                </li>
                <li>
                  <span className="dot">2</span>
                  <div><strong>Tier 2 · Blood test values</strong><small>Optional, adds CA-125 and CRP</small></div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>Two steps, one clearer picture</h2>
            <p>Start with what you can do at home. Add lab results only if the first step suggests it.</p>
          </div>
          <ol className="steps">
            <li className="card step">
              <span className="step-num">1</span>
              <h3>Answer a few questions</h3>
              <p>Tell us about your cycle, rate five symptoms from 0 to 10, and share your history. It takes about four minutes.</p>
            </li>
            <li className="card step">
              <span className="step-num">2</span>
              <h3>Get your Tier 1 indication</h3>
              <p>A trained model turns your answers into an indication of lower or elevated risk, with a plain-language explanation.</p>
            </li>
            <li className="card step">
              <span className="step-num">3</span>
              <h3>Add blood tests if suggested</h3>
              <p>If your result is elevated, enter CA-125 and CRP values from a hospital report for a combined Tier 2 result to share with your doctor.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* what it looks at */}
      <section className="section section-white">
        <div className="container split">
          <div className="section-head left">
            <p className="eyebrow">What Enara looks at</p>
            <h2>The things clinicians ask about</h2>
            <p>
              Twelve answers in Tier 1, and two blood values in Tier 2. Enara also keeps a private cycle calendar and a history of your results, so you can see how things change and bring a summary to your appointment.
            </p>
            <Link className="btn btn-primary" to={start}>
              Start the check <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="factor-grid">
            <div className="factor"><Icon name="calendar" size={22} /><strong>Cycle and body</strong><small>Age, BMI, cycle length, first period</small></div>
            <div className="factor"><Icon name="pulse" size={22} /><strong>Period and pelvic pain</strong><small>Rated 0 to 10</small></div>
            <div className="factor"><Icon name="heart" size={22} /><strong>Pain during sex</strong><small>During or after</small></div>
            <div className="factor"><Icon name="drop" size={22} /><strong>Bowel and urinary symptoms</strong><small>Pain, urgency, frequency</small></div>
            <div className="factor"><Icon name="user" size={22} /><strong>History and wellbeing</strong><small>Family history, infertility, how you feel</small></div>
            <div className="factor factor-accent"><Icon name="spark" size={22} /><strong>Optional blood values</strong><small>CA-125 and CRP from a lab report</small></div>
          </div>
        </div>
      </section>

      {/* careful */}
      <section className="section careful">
        <div className="container">
          <div className="section-head light">
            <p className="eyebrow">Built to be careful</p>
            <h2>Honest about what it can and can’t do</h2>
          </div>
          <div className="careful-grid">
            <div>
              <Icon name="shield" size={26} />
              <h3>Not a diagnosis</h3>
              <p>Results are screening insights. Every result points you back to a clinician for examination and testing.</p>
            </div>
            <div>
              <Icon name="lock" size={26} />
              <h3>Private by design</h3>
              <p>Your results and cycle log stay on your device. Only the answers needed for a score are sent to the service.</p>
            </div>
            <div>
              <Icon name="check" size={26} />
              <h3>Clear about its limits</h3>
              <p>The current model learned from a synthetic dataset. <Link to="/about">Read how it works and where it falls short.</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="section" id="faq">
        <div className="container faq-wrap">
          <div className="section-head left">
            <p className="eyebrow">Questions</p>
            <h2>Good things to know before you start</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* final call to action */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready when you are</h2>
            <p>Four minutes, no pressure, and you can pause at any time.</p>
            <Link className="btn btn-primary btn-lg" to={start}>
              Start the check <Icon name="arrow" size={19} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

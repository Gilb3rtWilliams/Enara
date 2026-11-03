import { Link } from "react-router-dom";
import { useTitle } from "../lib/useTitle";

export function About() {
  useTitle("About the model · Enara");
  return (
    <article className="prose-page container">
      <p className="eyebrow">About the model</p>
      <h1>How Enara works</h1>
      <p className="lede">Enara combines two small machine-learning models. This page explains what they look at, how they were tested, and where they fall short.</p>

      <h2>Two tiers</h2>
      <p>
        <strong>Tier 1</strong> uses twelve answers you give in the app: age, BMI, cycle length, age at first period, five symptom scores (period pain, pelvic pain, pain during sex, painful bowel movements, urinary symptoms), family history, infertility, and a wellbeing score.
      </p>
      <p>
        <strong>Tier 2</strong> uses the same twelve answers plus two blood values, CA-125 and CRP. It is only suggested when Tier 1 is elevated.
      </p>
      <p>Each model gives a probability between 0 and 100%. A score at or above 50% is shown as “elevated”, and anything lower is shown as “lower”. Enara describes the score as a “pattern match”, because it is not a calibrated clinical risk.</p>

      <h2>How the models were tested</h2>
      <p>Both models are logistic regressions, trained on 5,000 records and tested on a held-out 20% (1,000 records).</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>ROC AUC</th></tr>
          </thead>
          <tbody>
            <tr><td>Tier 1 (symptoms)</td><td>69.4%</td><td>69.1%</td><td>57.8%</td><td>0.75</td></tr>
            <tr><td>Tier 2 (symptoms + blood)</td><td>99.7%</td><td>99.3%</td><td>100%</td><td>1.00</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Limits you should know about</h2>
      <ul>
        <li><strong>The data is synthetic.</strong> The models have not been validated on real patients or reviewed by clinicians. The near-perfect Tier 2 result reflects how the data was generated, not what a clinic would see.</li>
        <li><strong>Tier 1 misses about four in ten positive cases</strong> at the default cutoff, so a lower result does not rule anything out.</li>
        <li><strong>CA-125 and CRP are non-specific.</strong> Many conditions can raise them, and they are not used on their own to diagnose endometriosis.</li>
        <li><strong>Cycle predictions are estimates</strong> based on the periods you log and your cycle length.</li>
      </ul>

      <p className="prose-cta">
        <Link className="btn btn-primary" to="/signup">Start the check</Link>
      </p>
    </article>
  );
}

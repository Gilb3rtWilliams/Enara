import { useState } from "react";

export default function BmiHelper({ onUse }) {
  const [cm, setCm] = useState("");
  const [kg, setKg] = useState("");
  const h = Number(cm) / 100;
  const w = Number(kg);
  const bmi = h > 0 && w > 0 ? w / (h * h) : null;
  const valid = bmi !== null && bmi >= 10 && bmi <= 70;

  return (
    <details className="helper">
      <summary>Don’t know your BMI?</summary>
      <div className="helper-body">
        <div className="helper-row">
          <label>
            Height (cm)
            <input type="number" inputMode="decimal" value={cm} onChange={(e) => setCm(e.target.value)} />
          </label>
          <label>
            Weight (kg)
            <input type="number" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
          </label>
        </div>
        <button type="button" className="btn btn-quiet" disabled={!valid} onClick={() => onUse(bmi.toFixed(1))}>
          {valid ? `Use BMI ${bmi.toFixed(1)}` : "Enter height and weight"}
        </button>
      </div>
    </details>
  );
}

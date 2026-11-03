import { doctorSummary } from "./summary";
import { SavedResult } from "./types";

/** Share (or copy) a plain-text summary a person can show their doctor. */
export async function shareSummary(r: Pick<SavedResult, "prediction" | "answers" | "labs" | "date">, name?: string) {
  const text = doctorSummary(r, name);
  try {
    if (navigator.share) {
      await navigator.share({ title: "Enara screening summary", text });
      return;
    }
    await navigator.clipboard.writeText(text);
    window.alert("Your summary was copied. Paste it into a message or document to share it with your doctor.");
  } catch (e) {
    if ((e as DOMException)?.name === "AbortError") return; // person closed the share sheet
    window.prompt("Copy this summary to share with your doctor:", text);
  }
}

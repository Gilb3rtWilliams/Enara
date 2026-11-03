import { Share } from "react-native";
import { notify } from "../dialog";
import { Pending } from "../flow";
import { doctorSummary } from "../summary";
import { SavedResult } from "../types";

export const recordFrom = (p: Pending): SavedResult => ({
  id: Date.now().toString(36),
  date: new Date().toISOString(),
  prediction: p.prediction,
  answers: p.answers,
  labs: p.labs,
});

export async function shareSummary(r: Pick<SavedResult, "prediction" | "answers" | "labs" | "date">, name?: string) {
  try {
    await Share.share({ message: doctorSummary(r, name), title: "Enara screening summary" });
  } catch {
    notify("Couldn’t open the share sheet", "Try again, or take a screenshot of your result to show your doctor.");
  }
}

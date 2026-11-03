import { Pending } from "./session";
import { SavedResult } from "./types";

export const recordFrom = (p: Pending): SavedResult => ({
  id: Date.now().toString(36),
  date: new Date().toISOString(),
  prediction: p.prediction,
  answers: p.answers,
  labs: p.labs,
});

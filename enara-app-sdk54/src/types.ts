export type YesNo = "Yes" | "No" | "";

export type Answers = {
  age: string;
  bmi: string;
  cycleLength: string;
  menarcheAge: string;
  dysmenorrhea: number;
  pelvicPain: number;
  dyspareunia: number;
  dyschezia: number;
  urinary: number;
  familyHistory: YesNo;
  infertility: YesNo;
  mentalHealth: number;
};

export type Labs = { ca125: string; crp: string };

export const initialAnswers: Answers = {
  age: "",
  bmi: "",
  cycleLength: "",
  menarcheAge: "",
  dysmenorrhea: 0,
  pelvicPain: 0,
  dyspareunia: 0,
  dyschezia: 0,
  urinary: 0,
  familyHistory: "",
  infertility: "",
  mentalHealth: 5,
};

export type TierResult = { probability: number; elevated_risk: boolean };

/** Shape returned by POST /predict. */
export type Prediction = {
  tier1: TierResult;
  tier2: TierResult | null;
  next_step: "no_action" | "order_lab_kit" | "see_doctor" | "monitor_symptoms";
  recommendation: string;
  explanation: string;
  warnings: string[];
  threshold: number;
  disclaimer: string;
};

export type Profile = {
  email: string;
  name: string;
  dob: string; // YYYY-MM-DD
  sex: "female" | "intersex" | "";
  salt: string;
  passHash: string;
};

/** One saved assessment on the device. */
export type SavedResult = {
  id: string;
  date: string; // ISO timestamp
  prediction: Prediction;
  answers: Answers;
  labs: Labs | null;
};

export type CheckIn = { flow?: number; pain?: number; mood?: number };

export type CycleData = {
  periodDays: string[]; // YYYY-MM-DD
  checkins: Record<string, CheckIn>;
};

export type AppData = {
  profile: Profile | null;
  signedIn: boolean;
  draft: Answers;
  results: SavedResult[]; // newest first
  cycle: CycleData;
};

export const emptyData: AppData = {
  profile: null,
  signedIn: false,
  draft: initialAnswers,
  results: [],
  cycle: { periodDays: [], checkins: {} },
};

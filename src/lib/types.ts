import { CompatibilityResult, EvaluationResult } from "./ai";

export type CandidateStatus = "pending" | "analyzing" | "analyzed" | "interviewing" | "evaluated";

export interface Candidate {
  id: string;
  fileName: string;
  cvText: string;
  status: CandidateStatus;
  compatibility?: CompatibilityResult;
  questions?: string[];
  answers?: string[];
  recruiterNotes?: string;
  evaluation?: EvaluationResult;
}

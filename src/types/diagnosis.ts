export interface DiagnosisIssue {
  issue: string;
  detail: string;
  severity: "high" | "medium" | "low";
}

export interface ActionWeek {
  week: number;
  focus: string;
  actions: string[];
}

export interface Diagnosis {
  headline: string;
  overallScore: number;
  summary: string;
  issues: DiagnosisIssue[];
  actionPlan: ActionWeek[];
  quickWins: string[];
  generatedAt: string;
}

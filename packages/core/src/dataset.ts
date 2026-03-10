export interface Golden {
  input: string;
  actualOutput?: string;
  expectedOutput?: string;
  context?: string[];
  retrievalContext?: string[];
}

export interface EvaluationDataset {
  name?: string;
  goldens: Golden[];
}

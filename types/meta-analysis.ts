export interface Study {
  study_id: string;
  study_label: string;
  effect_size: number;
  se: number;
  weight: number;
  year?: number;
  author?: string;
  [key: string]: any; // For additional moderator variables
}

export interface OverallEffect {
  estimate: number;
  ci_lower: number;
  ci_upper: number;
  p_value: number;
}

export interface MetaAnalysisState {
  studies: Study[];
  effectMeasure: string;
  modelType: 'FE' | 'RE';
  method?: string;
  moderators?: string[];
  results?: any;
  error?: string;
  loading: boolean;
}

export interface ForestPlotData {
  studies: Study[];
  overallEffect: number;
  ciLower: number;
  ciUpper: number;
  effectMeasure: string;
}

export interface FunnelPlotData {
  studies: Study[];
  effectMeasure: string;
  overallEffect?: number;
}

export interface HeterogeneityData {
  iSquared: number;
  tauSquared: number;
  hSquared: number;
  qStatistic: number;
  qDf: number;
  qPvalue: number;
}

export interface SubgroupData {
  subgroupVar: string;
  subgroups: Record<string, {
    studies: Study[];
    results: any;
  }>;
  betweenGroupStats: {
    q: number;
    df: number;
    pValue: number;
  };
}

export interface SensitivityData {
  baseline: {
    studies: Study[];
    results: any;
  };
  leaveOneOut: Array<{
    studyId: string;
    studyLabel: string;
    results: any;
    percentChange: number;
  }>;
}

export interface PublicationBiasData {
  egger?: {
    intercept: number;
    slope: number;
    seIntercept: number;
    pValue: number;
    interpretation: string;
  };
  trimAndFill?: {
    k0: number;
    estimateOriginal: number;
    estimateAdjusted: number;
    ciLowerAdjusted: number;
    ciUpperAdjusted: number;
    interpretation: string;
  };
  failSafeN?: {
    n: number;
    interpretation: string;
  };
}

export interface HeterogeneityResults {
  i_squared: number;
  q_statistic: number;
  q_pvalue: number;
  q_df: number;
  tau_squared: number;
  tau: number;
  h_squared: number;
  h: number;
} 
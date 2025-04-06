export interface Study {
  study_id: string;
  study_label: string;
  effect_size: number;
  se: number;
  weight: number;
  year?: number;
  author?: string;
  sample_size?: {
    treatment: number;
    control: number;
  };
  confidence_interval?: [number, number];
  p_value?: number;
}

export interface OverallEffect {
  estimate: number;
  ci_lower: number;
  ci_upper: number;
  p_value: number;
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

export interface PublicationBiasResults {
  egger_test: {
    intercept: number;
    se: number;
    t_value: number;
    p_value: number;
    ci_lower: number;
    ci_upper: number;
  };
  begg_test: {
    rank_correlation: number;
    p_value: number;
  };
  trim_and_fill: {
    original_estimate: number;
    adjusted_estimate: number;
    n_missing: number;
    studies_added: Study[];
  };
  fail_safe_n: {
    rosenthal: number;
    orwin: number;
  };
}

export interface MetaRegressionResults {
  r_squared: number;
  q_statistic: number;
  q_df: number;
  q_pvalue: number;
  moderators: {
    name: string;
    coefficient: number;
    se: number;
    t_value: number;
    p_value: number;
  }[];
}

export interface SensitivityResults {
  leave_one_out: {
    [key: string]: {
      estimate: number;
      ci_lower: number;
      ci_upper: number;
      p_value: number;
    };
  };
  cumulative: {
    [key: string]: {
      estimate: number;
      ci_lower: number;
      ci_upper: number;
      p_value: number;
    };
  };
} 
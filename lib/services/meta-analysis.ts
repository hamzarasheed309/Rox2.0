import { Study } from '@/types/meta-analysis';

export interface MetaAnalysisParameters {
  modelType: 'FE' | 'RE';
  effectMeasure: string;
  method?: string;
  moderators?: string[];
}

export interface MetaAnalysisResults {
  overallEffect: number;
  ciLower: number;
  ciUpper: number;
  pValue: number;
  heterogeneity: {
    iSquared: number;
    tauSquared: number;
    hSquared: number;
    qStatistic: number;
    qDf: number;
    qPvalue: number;
  };
  predictionInterval?: {
    lower: number;
    upper: number;
  };
}

export interface SubgroupResults {
  subgroups: Record<string, MetaAnalysisResults>;
  betweenGroupQ: number;
  betweenGroupDf: number;
  betweenGroupPvalue: number;
}

export interface SensitivityResults {
  baseline: MetaAnalysisResults;
  leaveOneOut: Array<{
    studyId: string;
    studyLabel: string;
    effectSize: number;
    ciLower: number;
    ciUpper: number;
    pValue: number;
    iSquared: number;
    percentChange: number;
  }>;
}

export interface PublicationBiasResults {
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

export class MetaAnalysisService {
  private static async callApi(operation: string, data: any, parameters: any) {
    const response = await fetch('/api/meta-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        data,
        parameters,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to perform meta-analysis');
    }

    return response.json();
  }

  static async runAnalysis(studies: Study[], parameters: MetaAnalysisParameters): Promise<MetaAnalysisResults> {
    const { results } = await this.callApi('run_analysis', studies, parameters);
    return results;
  }

  static async runSubgroupAnalysis(
    studies: Study[],
    subgroupVar: string,
    parameters: MetaAnalysisParameters
  ): Promise<SubgroupResults> {
    const { results } = await this.callApi('subgroup_analysis', studies, {
      ...parameters,
      subgroupVar,
    });
    return results;
  }

  static async runSensitivityAnalysis(
    studies: Study[],
    parameters: MetaAnalysisParameters
  ): Promise<SensitivityResults> {
    const { results } = await this.callApi('sensitivity_analysis', studies, parameters);
    return results;
  }

  static async assessPublicationBias(
    studies: Study[],
    methods: string[] = ['egger', 'trim_and_fill', 'fail_safe_n']
  ): Promise<PublicationBiasResults> {
    const { results } = await this.callApi('publication_bias', studies, { methods });
    return results;
  }
} 
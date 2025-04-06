"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUploader } from "@/components/meta-analysis/file-uploader"
import { StudyTable } from "@/components/meta-analysis/study-table"
import ForestPlot from "@/components/meta-analysis/forest-plot"
import { FunnelPlot } from "@/components/meta-analysis/funnel-plot"
import { HeterogeneityAnalysis } from "@/components/meta-analysis/heterogeneity-analysis"
import { SubgroupAnalysis } from "@/components/meta-analysis/subgroup-analysis"
import { SensitivityAnalysis } from "@/components/meta-analysis/sensitivity-analysis"
import { PublicationBiasTests } from "@/components/meta-analysis/publication-bias-tests"
import { LLMAnalysis } from "@/components/meta-analysis/llm-analysis"
import { InfoIcon, Upload, FileText, BarChart2, PieChart, TrendingUp, AlertCircle, Brain } from "lucide-react"
import { MetaAnalysisService } from "@/lib/services/meta-analysis"
import { Study, MetaAnalysisState } from "@/types/meta-analysis"

// Define component-specific interfaces to match the component props
interface ComponentStudy {
  study_id: string
  study_label: string
  effect_size: number
  se: number
  weight: number
  year?: number
  author?: string
  [key: string]: any
}

interface ComponentSubgroupResults {
  subgroups: {
    [key: string]: {
      studies: ComponentStudy[]
      overall_effect: {
        estimate: number
        ci_lower: number
        ci_upper: number
        p_value: number
      }
      heterogeneity: {
        q_statistic: number
        q_df: number
        q_pvalue: number
        i_squared: number
        tau_squared: number
        tau: number
        h_squared: number
        h: number
      }
    }
  }
  between_groups: {
    q_statistic: number
    q_df: number
    p_value: number
  }
}

interface ComponentSensitivityResults {
  leave_one_out: {
    [study_id: string]: {
      studies: ComponentStudy[]
      overall_effect: {
        estimate: number
        ci_lower: number
        ci_upper: number
        p_value: number
      }
      heterogeneity: {
        q_statistic: number
        q_df: number
        q_pvalue: number
        i_squared: number
        tau_squared: number
        tau: number
        h_squared: number
        h: number
      }
    }
  }
  cumulative: {
    [study_id: string]: {
      studies: ComponentStudy[]
      overall_effect: {
        estimate: number
        ci_lower: number
        ci_upper: number
        p_value: number
      }
      heterogeneity: {
        q_statistic: number
        q_df: number
        q_pvalue: number
        i_squared: number
        tau_squared: number
        tau: number
        h_squared: number
        h: number
      }
    }
  }
}

interface ComponentPublicationBiasResults {
  egger_test: {
    intercept: number
    se: number
    t_value: number
    p_value: number
    ci_lower: number
    ci_upper: number
  }
  begg_test: {
    rank_correlation: number
    p_value: number
  }
  trim_and_fill: {
    original_estimate: number
    adjusted_estimate: number
    n_missing: number
    studies_added: ComponentStudy[]
  }
  fail_safe_n: {
    rosenthal: number
    orwin: number
  }
}

export default function MetaAnalysisPage() {
  const [state, setState] = useState<MetaAnalysisState>({
    studies: [],
    effectMeasure: 'OR',
    modelType: 'RE',
    method: 'REML',
    loading: false,
  })

  const handleFileUpload = async (studies: Study[]) => {
    setState(prev => ({ ...prev, studies, loading: false }))
  }

  const runAnalysis = async () => {
    if (state.studies.length === 0) {
      setState(prev => ({ ...prev, error: 'Please upload study data first' }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: undefined }))

    try {
      const results = await MetaAnalysisService.runAnalysis(state.studies, {
        modelType: state.modelType,
        effectMeasure: state.effectMeasure,
        method: state.method,
      })

      setState(prev => ({
        ...prev,
        results,
        loading: false,
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }))
    }
  }

  const runSubgroupAnalysis = async (subgroupVar: string): Promise<ComponentSubgroupResults> => {
    try {
      const results = await MetaAnalysisService.runSubgroupAnalysis(
        state.studies,
        subgroupVar,
        {
          modelType: state.modelType,
          effectMeasure: state.effectMeasure,
          method: state.method,
        }
      )
      
      // Transform the results to match the component's expected format
      return {
        subgroups: {},
        between_groups: {
          q_statistic: results.betweenGroupQ,
          q_df: results.betweenGroupDf,
          p_value: results.betweenGroupPvalue
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const runSensitivityAnalysis = async (): Promise<ComponentSensitivityResults> => {
    try {
      const results = await MetaAnalysisService.runSensitivityAnalysis(
        state.studies,
        {
          modelType: state.modelType,
          effectMeasure: state.effectMeasure,
          method: state.method,
        }
      )
      
      // Transform the results to match the component's expected format
      return {
        leave_one_out: {},
        cumulative: {}
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const runPublicationBiasTests = async (): Promise<ComponentPublicationBiasResults> => {
    try {
      const results = await MetaAnalysisService.assessPublicationBias(state.studies)
      
      // Transform the results to match the component's expected format
      return {
        egger_test: {
          intercept: results.egger?.intercept || 0,
          se: results.egger?.seIntercept || 0,
          t_value: 0,
          p_value: results.egger?.pValue || 0,
          ci_lower: 0,
          ci_upper: 0
        },
        begg_test: {
          rank_correlation: 0,
          p_value: 0
        },
        trim_and_fill: {
          original_estimate: results.trimAndFill?.estimateOriginal || 0,
          adjusted_estimate: results.trimAndFill?.estimateAdjusted || 0,
          n_missing: results.trimAndFill?.k0 || 0,
          studies_added: []
        },
        fail_safe_n: {
          rosenthal: results.failSafeN?.n || 0,
          orwin: 0
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Helper function to ensure studies have required weight property
  const ensureStudyWeights = (studies: Study[]): ComponentStudy[] => {
    return studies.map(study => ({
      ...study,
      weight: study.weight || 0
    }))
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Meta-Analysis</h1>
        <p className="text-muted-foreground">
          Combine findings across multiple studies with comprehensive statistical analysis
        </p>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Tabs value="data-import" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="data-import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Data Import</span>
          </TabsTrigger>
          <TabsTrigger value="study-table" className="flex items-center gap-2" disabled={state.studies.length === 0}>
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Studies</span>
          </TabsTrigger>
          <TabsTrigger value="forest-plot" className="flex items-center gap-2" disabled={!state.results}>
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Forest Plot</span>
          </TabsTrigger>
          <TabsTrigger value="funnel-plot" className="flex items-center gap-2" disabled={!state.results}>
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Funnel Plot</span>
          </TabsTrigger>
          <TabsTrigger value="heterogeneity" className="flex items-center gap-2" disabled={!state.results}>
            <InfoIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Heterogeneity</span>
          </TabsTrigger>
          <TabsTrigger value="subgroup" className="flex items-center gap-2" disabled={!state.results}>
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Subgroup</span>
          </TabsTrigger>
          <TabsTrigger value="sensitivity" className="flex items-center gap-2" disabled={!state.results}>
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Sensitivity</span>
          </TabsTrigger>
          <TabsTrigger value="publication-bias" className="flex items-center gap-2" disabled={!state.results}>
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Publication Bias</span>
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2" disabled={state.studies.length === 0}>
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Analysis</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Upload your study data in CSV, Excel, or JSON format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader onUpload={handleFileUpload} />
              
              {state.studies.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="effect-measure">Effect Measure</Label>
                      <Select value={state.effectMeasure} onValueChange={(value) => setState(prev => ({ ...prev, effectMeasure: value }))} >
                        <SelectTrigger id="effect-measure">
                          <SelectValue placeholder="Select effect measure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OR">Odds Ratio (OR)</SelectItem>
                          <SelectItem value="RR">Risk Ratio (RR)</SelectItem>
                          <SelectItem value="SMD">Standardized Mean Difference (SMD)</SelectItem>
                          <SelectItem value="MD">Mean Difference (MD)</SelectItem>
                          <SelectItem value="COR">Correlation Coefficient (COR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="model-type">Model Type</Label>
                      <Select value={state.modelType} onValueChange={(value: 'FE' | 'RE') => setState(prev => ({ ...prev, modelType: value }))} >
                        <SelectTrigger id="model-type">
                          <SelectValue placeholder="Select model type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FE">Fixed Effects</SelectItem>
                          <SelectItem value="RE">Random Effects</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="method">Method</Label>
                      <Select value={state.method} onValueChange={(value) => setState(prev => ({ ...prev, method: value }))} >
                        <SelectTrigger id="method">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REML">REML</SelectItem>
                          <SelectItem value="DL">DerSimonian-Laird</SelectItem>
                          <SelectItem value="PM">Paule-Mandel</SelectItem>
                          <SelectItem value="ML">Maximum Likelihood</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={runAnalysis} className="w-full" disabled={state.loading || state.studies.length === 0}>
                    {state.loading ? 'Running Analysis...' : 'Run Meta-Analysis'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="study-table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Data</CardTitle>
              <CardDescription>
                Review and edit your study data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudyTable studies={ensureStudyWeights(state.studies)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forest-plot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forest Plot</CardTitle>
              <CardDescription>
                Visualize the effect sizes and confidence intervals for each study
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              {state.results && state.studies.length > 0 && (
                <ForestPlot
                  studies={ensureStudyWeights(state.studies)}
                  overallEffect={{
                    estimate: state.results.overallEffect ?? 0,
                    ci_lower: state.results.ciLower ?? 0,
                    ci_upper: state.results.ciUpper ?? 0,
                    p_value: state.results.pValue ?? 0
                  }}
                  effectMeasure={state.effectMeasure}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel-plot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Plot</CardTitle>
              <CardDescription>
                Assess publication bias and small-study effects
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              {state.results && state.studies.length > 0 && (
                <FunnelPlot
                  studies={ensureStudyWeights(state.studies)}
                  effectMeasure={state.effectMeasure}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heterogeneity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Heterogeneity Analysis</CardTitle>
              <CardDescription>
                Assess the variability between studies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.results && (
                <HeterogeneityAnalysis 
                  studies={ensureStudyWeights(state.studies)}
                  effectMeasure={state.effectMeasure}
                  onRunAnalysis={async () => {
                    // This is a placeholder function that returns the heterogeneity results from the state
                    return {
                      q_statistic: state.results.heterogeneity.qStatistic,
                      q_df: state.results.heterogeneity.qDf,
                      q_pvalue: state.results.heterogeneity.qPvalue,
                      i_squared: state.results.heterogeneity.iSquared,
                      tau_squared: state.results.heterogeneity.tauSquared,
                      tau: Math.sqrt(state.results.heterogeneity.tauSquared),
                      h_squared: state.results.heterogeneity.hSquared,
                      h: Math.sqrt(state.results.heterogeneity.hSquared)
                    }
                  }}
                  results={{
                    q_statistic: state.results.heterogeneity.qStatistic,
                    q_df: state.results.heterogeneity.qDf,
                    q_pvalue: state.results.heterogeneity.qPvalue,
                    i_squared: state.results.heterogeneity.iSquared,
                    tau_squared: state.results.heterogeneity.tauSquared,
                    tau: Math.sqrt(state.results.heterogeneity.tauSquared),
                    h_squared: state.results.heterogeneity.hSquared,
                    h: Math.sqrt(state.results.heterogeneity.hSquared)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subgroup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subgroup Analysis</CardTitle>
              <CardDescription>
                Analyze effects across different subgroups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubgroupAnalysis
                studies={ensureStudyWeights(state.studies)}
                effectMeasure={state.effectMeasure}
                onRunAnalysis={runSubgroupAnalysis}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis</CardTitle>
              <CardDescription>
                Assess the robustness of your results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SensitivityAnalysis
                studies={ensureStudyWeights(state.studies)}
                effectMeasure={state.effectMeasure}
                onRunAnalysis={runSensitivityAnalysis}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publication-bias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publication Bias Tests</CardTitle>
              <CardDescription>
                Assess the presence of publication bias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PublicationBiasTests
                studies={ensureStudyWeights(state.studies)}
                effectMeasure={state.effectMeasure}
                onRunTests={runPublicationBiasTests}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Get intelligent insights and interactive explanations for your meta-analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LLMAnalysis
                studies={ensureStudyWeights(state.studies)}
                effectMeasure={state.effectMeasure}
                modelType={state.modelType}
                method={state.method}
                results={state.results}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
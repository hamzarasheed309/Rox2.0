"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicationBiasTests } from "@/components/meta-analysis/publication-bias-tests"
import { FileUploader } from "@/components/meta-analysis/file-uploader"
import { StudyTable } from "@/components/meta-analysis/study-table"
import ForestPlot from "@/components/meta-analysis/forest-plot"
import { FunnelPlot } from "@/components/meta-analysis/funnel-plot"
import { HeterogeneityAnalysis } from "@/components/meta-analysis/heterogeneity-analysis"
import MetaRegressionAnalysis from "@/components/meta-analysis/meta-regression-analysis"
import { SensitivityAnalysis } from "@/components/meta-analysis/sensitivity-analysis"
import { SubgroupAnalysis } from "@/components/meta-analysis/subgroup-analysis"
import MetaLLMInterface from "@/components/meta-llm/meta-llm-interface"
import AIInsights from "@/components/meta-analysis/ai-insights"
import { Study, OverallEffect } from "@/types/meta-analysis"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Upload, FileText, Brain } from "lucide-react"

// Mock data for demonstration
const mockData = {
  publicationBias: {
    eggerTest: {
      intercept: 1.23,
      pValue: 0.042,
    },
    trimAndFill: {
      adjustedEffectSize: 1.35,
      missingStudies: 3,
    },
  },
  heterogeneity: {
    iSquared: 68.4,
    qValue: 25.6,
    qPValue: 0.002,
    tauSquared: 0.156,
  },
  studies: [
    {
      id: "1",
      name: "Smith et al. (2018)",
      year: 2018,
      authors: "Smith, J., Jones, K.",
      sampleSize: { treatment: 150, control: 150 },
      effectSize: 1.5,
      confidenceInterval: [0.8, 2.8],
      weight: 15,
      pValue: 0.001,
    },
    {
      id: "2",
      name: "Johnson et al. (2019)",
      year: 2019,
      authors: "Johnson, A., Brown, B.",
      sampleSize: { treatment: 200, control: 200 },
      effectSize: 2.1,
      confidenceInterval: [1.3, 3.4],
      weight: 18,
      pValue: 0.0005,
    },
    // Add more mock studies as needed
  ],
}

// Helper function to calculate the error function (erf)
function erf(x: number): number {
  // Approximation of the error function
  const t = 1.0 / (1.0 + 0.5 * Math.abs(x));
  const tau = t * Math.exp(-x * x - 1.26551223 + 
    t * (1.00002368 + 
    t * (0.37409196 + 
    t * (0.09678418 + 
    t * (-0.18628806 + 
    t * (0.27886807 + 
    t * (-1.13520398 + 
    t * (1.48851587 + 
    t * (-0.82215223 + 
    t * 0.17087277)))))))));
  return x >= 0 ? 1 - tau : tau - 1;
}

export default function MetaAnalysisPage(): React.ReactElement {
  const [studies, setStudies] = useState<Study[]>([])
  const [activeTab, setActiveTab] = useState("ai-assistant")

  const handleStudyUpload = (uploadedStudies: Study[]) => {
    setStudies(uploadedStudies)
  }

  // Helper function to ensure studies have required weight property
  const ensureStudyWeights = (studies: Study[]): Study[] => {
    return studies.map(study => ({
      ...study,
      weight: study.weight || 1 / Math.pow(study.se, 2)
    }))
  }

  // Convert mock data to the expected format
  const formattedStudies: Study[] = studies.length > 0 
    ? studies 
    : mockData.studies.map(study => ({
        study_id: study.id,
        study_label: study.name,
        effect_size: study.effectSize,
        se: (study.confidenceInterval[1] - study.confidenceInterval[0]) / (2 * 1.96),
        weight: study.weight || 1 / Math.pow((study.confidenceInterval[1] - study.confidenceInterval[0]) / (2 * 1.96), 2),
        year: study.year,
        author: study.authors,
        sample_size: study.sampleSize,
        confidence_interval: study.confidenceInterval,
        p_value: study.pValue
      }))

  // Calculate overall effect for forest plot
  const calculateOverallEffect = (): OverallEffect => {
    if (formattedStudies.length === 0) {
      return {
        estimate: 0,
        ci_lower: 0,
        ci_upper: 0,
        p_value: 1
      }
    }
    
    const weightedSum = formattedStudies.reduce((sum, study) => sum + study.effect_size * study.weight, 0)
    const totalWeight = formattedStudies.reduce((sum, study) => sum + study.weight, 0)
    const weightedMean = weightedSum / totalWeight
    
    const se = Math.sqrt(1 / totalWeight)
    const ci_lower = weightedMean - 1.96 * se
    const ci_upper = weightedMean + 1.96 * se
    const z = Math.abs(weightedMean / se)
    const p_value = 2 * (1 - 0.5 * (1 + erf(z / Math.sqrt(2))))
    
    return {
      estimate: weightedMean,
      ci_lower,
      ci_upper,
      p_value
    }
  }

  const overallEffect = calculateOverallEffect()

  const handlePublicationBiasTests = async () => {
    // Mock implementation for now
    return {
      egger_test: {
        intercept: 1.23,
        se: 0.5,
        t_value: 2.46,
        p_value: 0.042,
        ci_lower: 0.23,
        ci_upper: 2.23
      },
      begg_test: {
        rank_correlation: 0.32,
        p_value: 0.08
      },
      trim_and_fill: {
        original_estimate: 1.5,
        adjusted_estimate: 1.35,
        n_missing: 3,
        studies_added: []
      },
      fail_safe_n: {
        rosenthal: 15,
        orwin: 8
      }
    }
  }

  const handleSensitivityAnalysis = async () => {
    // Mock implementation for now
    return {
      leave_one_out: {},
      cumulative: {}
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meta-Analysis Results</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="forest-plot">Forest Plot</TabsTrigger>
          <TabsTrigger value="funnel-plot">Funnel Plot</TabsTrigger>
          <TabsTrigger value="heterogeneity">Heterogeneity</TabsTrigger>
          <TabsTrigger value="publication-bias">Publication Bias</TabsTrigger>
          <TabsTrigger value="meta-regression">Meta-Regression</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
          <TabsTrigger value="subgroup">Subgroup</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <MetaLLMInterface />
            </CardContent>
          </Card>
          
          <AIInsights studies={formattedStudies} />
        </TabsContent>

        <TabsContent value="forest-plot">
          <Card>
            <CardHeader>
              <CardTitle>Forest Plot</CardTitle>
            </CardHeader>
            <CardContent>
              <ForestPlot 
                studies={formattedStudies}
                overallEffect={overallEffect}
                effectMeasure="SMD"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel-plot">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Plot</CardTitle>
            </CardHeader>
            <CardContent>
              <FunnelPlot 
                studies={formattedStudies}
                effectMeasure="SMD"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heterogeneity">
          <Card>
            <CardHeader>
              <CardTitle>Heterogeneity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <HeterogeneityAnalysis 
                studies={formattedStudies}
                effectMeasure="SMD"
                onRunAnalysis={async () => {
                  // Mock implementation for now
                  return {
                    i_squared: 68.4,
                    q_statistic: 25.6,
                    q_pvalue: 0.002,
                    q_df: 10,
                    tau_squared: 0.156,
                    tau: 0.395,
                    h_squared: 2.56,
                    h: 1.6
                  };
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publication-bias">
          <Card>
            <CardHeader>
              <CardTitle>Publication Bias Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <PublicationBiasTests 
                studies={formattedStudies}
                effectMeasure="SMD"
                onRunTests={handlePublicationBiasTests}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta-regression">
          <Card>
            <CardHeader>
              <CardTitle>Meta-Regression Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <MetaRegressionAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity">
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <SensitivityAnalysis 
                studies={formattedStudies}
                effectMeasure="SMD"
                onRunAnalysis={handleSensitivityAnalysis}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subgroup">
          <Card>
            <CardHeader>
              <CardTitle>Subgroup Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <SubgroupAnalysis
                studies={ensureStudyWeights(formattedStudies)}
                effectMeasure="SMD"
                onRunAnalysis={async (moderator: string) => {
                  // Mock implementation for now
                  return {
                    subgroups: {
                      "Group A": {
                        studies: ensureStudyWeights(formattedStudies.slice(0, 2)),
                        overall_effect: {
                          estimate: 0.5,
                          ci_lower: 0.2,
                          ci_upper: 0.8,
                          p_value: 0.001
                        },
                        heterogeneity: {
                          q_statistic: 2.5,
                          q_df: 1,
                          q_pvalue: 0.11,
                          i_squared: 45.5,
                          tau_squared: 0.02,
                          tau: 0.14,
                          h_squared: 1.83,
                          h: 1.35
                        }
                      },
                      "Group B": {
                        studies: ensureStudyWeights(formattedStudies.slice(2)),
                        overall_effect: {
                          estimate: 0.7,
                          ci_lower: 0.4,
                          ci_upper: 1.0,
                          p_value: 0.002
                        },
                        heterogeneity: {
                          q_statistic: 3.1,
                          q_df: 1,
                          q_pvalue: 0.08,
                          i_squared: 52.3,
                          tau_squared: 0.03,
                          tau: 0.17,
                          h_squared: 2.1,
                          h: 1.45
                        }
                      }
                    },
                    between_groups: {
                      q_statistic: 3.5,
                      q_df: 1,
                      p_value: 0.06
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Study Data</CardTitle>
        </CardHeader>
        <CardContent>
          <StudyTable studies={formattedStudies} />
        </CardContent>
      </Card>
    </div>
  )
} 
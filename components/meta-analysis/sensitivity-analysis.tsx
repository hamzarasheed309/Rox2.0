"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ForestPlot } from "./forest-plot"

interface Study {
  study_id: string
  study_label: string
  effect_size: number
  se: number
  weight: number
  year?: number
  author?: string
  [key: string]: any
}

interface SensitivityResults {
  leave_one_out: {
    [study_id: string]: {
      studies: Study[]
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
      studies: Study[]
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

interface SensitivityAnalysisProps {
  studies: Study[]
  effectMeasure: string
  onRunAnalysis: () => Promise<SensitivityResults>
}

export function SensitivityAnalysis({ studies, effectMeasure, onRunAnalysis }: SensitivityAnalysisProps) {
  const [results, setResults] = useState<SensitivityResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"leave_one_out" | "cumulative">("leave_one_out")

  const handleRunAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const sensitivityResults = await onRunAnalysis()
      setResults(sensitivityResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Sensitivity Analysis</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleRunAnalysis}
              disabled={loading}
            >
              {loading ? "Running Analysis..." : "Run Analysis"}
            </Button>

            {results && (
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "leave_one_out" ? "default" : "outline"}
                  onClick={() => setActiveTab("leave_one_out")}
                >
                  Leave-One-Out
                </Button>
                <Button
                  variant={activeTab === "cumulative" ? "default" : "outline"}
                  onClick={() => setActiveTab("cumulative")}
                >
                  Cumulative
                </Button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {results && (
            <div className="space-y-6">
              {activeTab === "leave_one_out" ? (
                // Leave-one-out analysis
                Object.entries(results.leave_one_out).map(([studyId, data]) => (
                  <div key={studyId} className="space-y-4">
                    <h4 className="text-sm font-medium">
                      Excluding {data.studies[0].study_label}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Overall Effect</h5>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Estimate: </span>
                            <span>{data.overall_effect.estimate.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">95% CI: </span>
                            <span>[{data.overall_effect.ci_lower.toFixed(3)}, {data.overall_effect.ci_upper.toFixed(3)}]</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">P-value: </span>
                            <span>{data.overall_effect.p_value.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">Heterogeneity</h5>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">I²: </span>
                            <span>{data.heterogeneity.i_squared.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Q-statistic: </span>
                            <span>{data.heterogeneity.q_statistic.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">P-value: </span>
                            <span>{data.heterogeneity.q_pvalue.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <ForestPlot
                      studies={data.studies}
                      overallEffect={data.overall_effect}
                      effectMeasure={effectMeasure}
                    />
                  </div>
                ))
              ) : (
                // Cumulative analysis
                Object.entries(results.cumulative).map(([studyId, data]) => (
                  <div key={studyId} className="space-y-4">
                    <h4 className="text-sm font-medium">
                      Up to {data.studies[data.studies.length - 1].study_label}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Overall Effect</h5>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Estimate: </span>
                            <span>{data.overall_effect.estimate.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">95% CI: </span>
                            <span>[{data.overall_effect.ci_lower.toFixed(3)}, {data.overall_effect.ci_upper.toFixed(3)}]</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">P-value: </span>
                            <span>{data.overall_effect.p_value.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">Heterogeneity</h5>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">I²: </span>
                            <span>{data.heterogeneity.i_squared.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Q-statistic: </span>
                            <span>{data.heterogeneity.q_statistic.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">P-value: </span>
                            <span>{data.heterogeneity.q_pvalue.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <ForestPlot
                      studies={data.studies}
                      overallEffect={data.overall_effect}
                      effectMeasure={effectMeasure}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface SubgroupResults {
  subgroups: {
    [key: string]: {
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
  between_groups: {
    q_statistic: number
    q_df: number
    p_value: number
  }
}

interface SubgroupAnalysisProps {
  studies: Study[]
  effectMeasure: string
  onRunAnalysis: (moderator: string) => Promise<SubgroupResults>
}

export function SubgroupAnalysis({ studies, effectMeasure, onRunAnalysis }: SubgroupAnalysisProps) {
  const [selectedModerator, setSelectedModerator] = useState<string>("")
  const [results, setResults] = useState<SubgroupResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get unique moderators from studies
  const moderators = Object.keys(studies[0] || {}).filter(key => 
    !["study_id", "study_label", "effect_size", "se", "weight"].includes(key)
  )

  const handleRunAnalysis = async () => {
    if (!selectedModerator) {
      setError("Please select a moderator variable")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const subgroupResults = await onRunAnalysis(selectedModerator)
      setResults(subgroupResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Subgroup Analysis</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={selectedModerator}
              onValueChange={setSelectedModerator}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select moderator" />
              </SelectTrigger>
              <SelectContent>
                {moderators.map(moderator => (
                  <SelectItem key={moderator} value={moderator}>
                    {moderator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleRunAnalysis}
              disabled={loading || !selectedModerator}
            >
              {loading ? "Running Analysis..." : "Run Analysis"}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {results && (
            <div className="space-y-6">
              {/* Between-groups test */}
              <div>
                <h4 className="text-sm font-medium mb-2">Between-groups Test</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Q-statistic: </span>
                    <span>{results.between_groups.q_statistic.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Degrees of freedom: </span>
                    <span>{results.between_groups.q_df}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P-value: </span>
                    <span>{results.between_groups.p_value.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Subgroup results */}
              {Object.entries(results.subgroups).map(([group, data]) => (
                <div key={group} className="space-y-4">
                  <h4 className="text-sm font-medium">{group}</h4>
                  
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
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}


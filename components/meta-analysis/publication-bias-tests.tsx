"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FunnelPlot } from "./funnel-plot"

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

interface PublicationBiasResults {
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
    studies_added: Study[]
  }
  fail_safe_n: {
    rosenthal: number
    orwin: number
  }
}

interface PublicationBiasTestsProps {
  studies: Study[]
  effectMeasure: string
  onRunTests: () => Promise<PublicationBiasResults>
}

export function PublicationBiasTests({ studies, effectMeasure, onRunTests }: PublicationBiasTestsProps) {
  const [results, setResults] = useState<PublicationBiasResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRunTests = async () => {
    setLoading(true)
    setError(null)

    try {
      const biasResults = await onRunTests()
      setResults(biasResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Publication Bias Analysis</h3>
        
        <div className="space-y-4">
          <Button 
            onClick={handleRunTests}
            disabled={loading}
          >
            {loading ? "Running Tests..." : "Run Tests"}
          </Button>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {results && (
            <div className="space-y-6">
              {/* Funnel Plot */}
              <div>
                <h4 className="text-sm font-medium mb-2">Funnel Plot</h4>
                <FunnelPlot
                  studies={studies}
                  effectMeasure={effectMeasure}
                />
              </div>

              {/* Egger's Test */}
              <div>
                <h4 className="text-sm font-medium mb-2">Egger's Test</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Intercept: </span>
                    <span>{results.egger_test.intercept.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Standard Error: </span>
                    <span>{results.egger_test.se.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">t-value: </span>
                    <span>{results.egger_test.t_value.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P-value: </span>
                    <span>{results.egger_test.p_value.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">95% CI: </span>
                    <span>[{results.egger_test.ci_lower.toFixed(3)}, {results.egger_test.ci_upper.toFixed(3)}]</span>
                  </div>
                </div>
              </div>

              {/* Begg's Test */}
              <div>
                <h4 className="text-sm font-medium mb-2">Begg's Test</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rank Correlation: </span>
                    <span>{results.begg_test.rank_correlation.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P-value: </span>
                    <span>{results.begg_test.p_value.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Trim and Fill */}
              <div>
                <h4 className="text-sm font-medium mb-2">Trim and Fill Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Original Estimate: </span>
                    <span>{results.trim_and_fill.original_estimate.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Adjusted Estimate: </span>
                    <span>{results.trim_and_fill.adjusted_estimate.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Missing Studies: </span>
                    <span>{results.trim_and_fill.n_missing}</span>
                  </div>
                </div>
              </div>

              {/* Fail-safe N */}
              <div>
                <h4 className="text-sm font-medium mb-2">Fail-safe N</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rosenthal's N: </span>
                    <span>{results.fail_safe_n.rosenthal}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Orwin's N: </span>
                    <span>{results.fail_safe_n.orwin}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}


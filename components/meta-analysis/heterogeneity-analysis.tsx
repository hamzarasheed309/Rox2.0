"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Study } from "@/types/meta-analysis"
import { Loader2 } from "lucide-react"

interface HeterogeneityResults {
  q_statistic: number
  q_df: number
  q_pvalue: number
  i_squared: number
  tau_squared: number
  tau: number
  h_squared: number
  h: number
}

interface HeterogeneityAnalysisProps {
  studies: Study[]
  effectMeasure: string
  onRunAnalysis: () => Promise<HeterogeneityResults>
  results?: HeterogeneityResults
}

export function HeterogeneityAnalysis({ studies, effectMeasure, onRunAnalysis, results: initialResults }: HeterogeneityAnalysisProps) {
  const [results, setResults] = useState<HeterogeneityResults | null>(initialResults || null)
  const [loading, setLoading] = useState(false)

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const analysisResults = await onRunAnalysis()
      setResults(analysisResults)
    } catch (error) {
      console.error("Error running heterogeneity analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (studies.length > 0 && !initialResults) {
      runAnalysis()
    }
  }, [studies, effectMeasure, initialResults])

  // Update results when initialResults changes
  useEffect(() => {
    if (initialResults) {
      setResults(initialResults)
    }
  }, [initialResults])

  const getHeterogeneityLevel = (iSquared: number) => {
    if (iSquared < 25) return "Low"
    if (iSquared < 50) return "Moderate"
    if (iSquared < 75) return "Substantial"
    return "Considerable"
  }

  const getHeterogeneityColor = (iSquared: number) => {
    if (iSquared < 25) return "bg-green-500"
    if (iSquared < 50) return "bg-yellow-500"
    if (iSquared < 75) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Heterogeneity Analysis</h3>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Analyzing heterogeneity...</span>
          </div>
        ) : results ? (
          <div className="space-y-6">
            {/* I-squared */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">I-squared</span>
                <span className="text-sm text-muted-foreground">
                  {results.i_squared.toFixed(1)}% ({getHeterogeneityLevel(results.i_squared)})
                </span>
              </div>
              <Progress 
                value={results.i_squared} 
                className={getHeterogeneityColor(results.i_squared)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Percentage of total variation across studies due to heterogeneity
              </p>
            </div>

            {/* Q-statistic */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Q-statistic</span>
                <span className="text-sm text-muted-foreground">
                  {results.q_statistic.toFixed(2)} (df = {results.q_df}, p = {results.q_pvalue.toFixed(3)})
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Test for heterogeneity across studies
              </p>
            </div>

            {/* Tau-squared */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Tau-squared</span>
                <span className="text-sm text-muted-foreground">
                  {results.tau_squared.toFixed(3)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Between-study variance
              </p>
            </div>

            {/* H-statistic */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">H-statistic</span>
                <span className="text-sm text-muted-foreground">
                  {results.h.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Ratio of standard deviation of the pooled effect to the standard deviation expected under the null hypothesis
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No studies available for heterogeneity analysis.</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={runAnalysis}
              disabled={studies.length === 0}
            >
              Run Analysis
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}


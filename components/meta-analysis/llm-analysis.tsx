"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Study } from "@/types/meta-analysis"
import { Loader2, Lightbulb, ArrowRight, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface LLMAnalysisProps {
  studies: Study[]
  effectMeasure: string
  modelType: string
  method?: string
  results?: any
}

interface LLMResponse {
  insights: string
  recommendations: string[]
  interpretation: string
  visualizationSuggestions?: string[]
}

interface InteractiveResponse {
  explanation: string
}

export function LLMAnalysis({ studies, effectMeasure, modelType, method, results }: LLMAnalysisProps) {
  const [query, setQuery] = useState("")
  const [analysisType, setAnalysisType] = useState("general")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [llmResponse, setLlmResponse] = useState<LLMResponse | null>(null)
  const [interactiveResponse, setInteractiveResponse] = useState<InteractiveResponse | null>(null)
  const [activeTab, setActiveTab] = useState("insights")

  // Generate default query based on analysis type
  useEffect(() => {
    if (analysisType === "general") {
      setQuery("Analyze the overall meta-analysis results and provide insights.")
    } else if (analysisType === "heterogeneity") {
      setQuery("Analyze the heterogeneity in the meta-analysis and provide recommendations.")
    } else if (analysisType === "publication_bias") {
      setQuery("Assess potential publication bias in the meta-analysis and provide recommendations.")
    } else if (analysisType === "sensitivity") {
      setQuery("Perform a sensitivity analysis and identify influential studies.")
    } else if (analysisType === "subgroup") {
      setQuery("Analyze potential subgroup differences and identify significant moderators.")
    } else if (analysisType === "meta_regression") {
      setQuery("Perform a meta-regression analysis and identify significant predictors.")
    }
  }, [analysisType])

  const generateInsights = async () => {
    if (studies.length === 0) {
      setError("No studies available for analysis")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/meta-analysis/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          studies,
          analysisType,
          context: `Effect Measure: ${effectMeasure}, Model Type: ${modelType}, Method: ${method || "Not specified"}`
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate insights")
      }

      const data = await response.json()
      setLlmResponse(data.data)
    } catch (error: any) {
      setError(error.message || "An error occurred while generating insights")
      console.error("Error generating insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateInteractiveExplanation = async () => {
    if (!results) {
      setError("No results available for interactive explanation")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/meta-analysis/interactive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          results,
          analysisType,
          query,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate interactive explanation")
      }

      const data = await response.json()
      setInteractiveResponse(data.data)
    } catch (error: any) {
      setError(error.message || "An error occurred while generating interactive explanation")
      console.error("Error generating interactive explanation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          AI-Powered Meta-Analysis
        </CardTitle>
        <CardDescription>
          Get intelligent insights and interactive explanations for your meta-analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Type</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Analysis</SelectItem>
                  <SelectItem value="heterogeneity">Heterogeneity Analysis</SelectItem>
                  <SelectItem value="publication_bias">Publication Bias</SelectItem>
                  <SelectItem value="sensitivity">Sensitivity Analysis</SelectItem>
                  <SelectItem value="subgroup">Subgroup Analysis</SelectItem>
                  <SelectItem value="meta_regression">Meta-Regression</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Query</label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query for the AI analysis"
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={generateInsights} 
              disabled={loading || studies.length === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
            <Button 
              onClick={generateInteractiveExplanation} 
              disabled={loading || !results}
              variant="outline"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Explanation...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Interactive Explanation
                </>
              )}
            </Button>
          </div>
        </div>

        {(llmResponse || interactiveResponse) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-3 gap-2">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="interactive">Interactive</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="mt-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Key Insights</h3>
                <p className="whitespace-pre-line">{llmResponse?.insights}</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Interpretation</h3>
                <p className="whitespace-pre-line">{llmResponse?.interpretation}</p>
              </div>
              
              {llmResponse?.visualizationSuggestions && llmResponse.visualizationSuggestions.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Visualization Suggestions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {llmResponse.visualizationSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Recommendations</h3>
                {llmResponse?.recommendations && llmResponse.recommendations.length > 0 ? (
                  <ul className="list-decimal pl-5 space-y-2">
                    {llmResponse.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">{index + 1}.</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No recommendations available.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="interactive" className="mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Interactive Explanation</h3>
                {interactiveResponse ? (
                  <div className="whitespace-pre-line">{interactiveResponse.explanation}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Click the "Interactive Explanation" button to generate an interactive explanation of your results.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
} 
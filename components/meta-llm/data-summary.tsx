"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain } from "lucide-react"

export default function DataSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dataset Overview</CardTitle>
          <CardDescription>
            Summary statistics for your meta-analysis data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Studies</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Sample Size</p>
              <p className="text-2xl font-bold">3,842</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Publication Years</p>
              <p className="text-2xl font-bold">2010-2023</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Study Designs</p>
              <p className="text-2xl font-bold">4 types</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Study Design Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">RCT</span>
                <span className="text-sm font-medium">14 (58.3%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "58.3%" }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Cohort</span>
                <span className="text-sm font-medium">6 (25.0%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "25.0%" }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Case-Control</span>
                <span className="text-sm font-medium">3 (12.5%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "12.5%" }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Cross-sectional</span>
                <span className="text-sm font-medium">1 (4.2%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "4.2%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Effect Size Distribution</CardTitle>
          <CardDescription>
            Distribution of effect sizes across studies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Mean Effect Size</p>
              <p className="text-2xl font-bold">1.42</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Median Effect Size</p>
              <p className="text-2xl font-bold">1.31</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Range</p>
              <p className="text-2xl font-bold">0.78 - 2.45</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Standard Deviation</p>
              <p className="text-2xl font-bold">0.42</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Significant vs. Non-significant</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm">Significant (p &lt; 0.05)</span>
              <span className="text-sm font-medium">18 (75.0%)</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: "75.0%" }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Non-significant</span>
              <span className="text-sm font-medium">6 (25.0%)</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="bg-gray-400 h-full rounded-full" style={{ width: "25.0%" }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Data Quality Assessment</CardTitle>
          <CardDescription>
            Evaluation of data completeness and quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Missing Data</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Effect Sizes</span>
                  <span className="text-sm font-medium text-green-600">0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Standard Errors</span>
                  <span className="text-sm font-medium text-yellow-600">4.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sample Sizes</span>
                  <span className="text-sm font-medium text-green-600">0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Study Characteristics</span>
                  <span className="text-sm font-medium text-yellow-600">8.3%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Potential Issues</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Outliers</span>
                  <span className="text-sm font-medium text-yellow-600">2 studies</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inconsistent Effect Direction</span>
                  <span className="text-sm font-medium text-yellow-600">1 study</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Small Sample Size</span>
                  <span className="text-sm font-medium text-yellow-600">3 studies</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Entry Errors</span>
                  <span className="text-sm font-medium text-green-600">None detected</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Risk of Bias</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low Risk</span>
                  <span className="text-sm font-medium">14 (58.3%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moderate Risk</span>
                  <span className="text-sm font-medium">7 (29.2%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">High Risk</span>
                  <span className="text-sm font-medium">3 (12.5%)</span>
                </div>
              </div>
            </div>
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">AI Data Assessment</AlertTitle>
            <AlertDescription className="text-blue-700">
              Your dataset is generally of good quality with minimal missing data. I've identified 2 potential outliers that may warrant further investigation. The distribution of effect sizes suggests moderate heterogeneity, which should be addressed in your analysis model selection.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}


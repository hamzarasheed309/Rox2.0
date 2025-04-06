"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MetaRegressionAnalysis() {
  // Mock data for meta-regression
  const regressionData = {
    modelFit: {
      rSquared: 0.42,
      pValue: 0.031,
    },
    predictors: [
      {
        name: "Publication Year",
        coefficient: -0.032,
        standardError: 0.014,
        pValue: 0.021,
        ci: [-0.059, -0.005],
      },
      {
        name: "Sample Size",
        coefficient: -0.0004,
        standardError: 0.0003,
        pValue: 0.176,
        ci: [-0.001, 0.0002],
      },
      {
        name: "Mean Age",
        coefficient: 0.018,
        standardError: 0.011,
        pValue: 0.103,
        ci: [-0.004, 0.04],
      },
    ],
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Meta-Regression Analysis</h3>
            <Badge
              variant="outline"
              className={`${regressionData.modelFit.pValue < 0.05 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              Model p = {regressionData.modelFit.pValue.toFixed(3)}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            This analysis examines how study characteristics influence the effect size. The model explains{" "}
            {(regressionData.modelFit.rSquared * 100).toFixed(1)}% of the between-study variance.
          </p>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Predictor</TableHead>
                  <TableHead className="text-right">Coefficient</TableHead>
                  <TableHead className="text-right">Standard Error</TableHead>
                  <TableHead className="text-right">95% CI</TableHead>
                  <TableHead className="text-right">P-value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regressionData.predictors.map((predictor, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{predictor.name}</TableCell>
                    <TableCell className="text-right">{predictor.coefficient.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{predictor.standardError.toFixed(4)}</TableCell>
                    <TableCell className="text-right">
                      [{predictor.ci[0].toFixed(4)}, {predictor.ci[1].toFixed(4)}]
                    </TableCell>
                    <TableCell className="text-right">
                      {predictor.pValue < 0.05 ? (
                        <span className="text-green-600 font-medium">
                          {predictor.pValue < 0.001 ? "< 0.001" : predictor.pValue.toFixed(3)}
                        </span>
                      ) : (
                        <span>{predictor.pValue.toFixed(3)}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Interpretation</h4>
            <p className="text-sm">
              The meta-regression model is statistically significant (p = {regressionData.modelFit.pValue.toFixed(3)}),
              indicating that the included predictors explain a meaningful portion of the heterogeneity between studies.
              <br />
              <br />
              Publication year is significantly associated with effect size (p ={" "}
              {regressionData.predictors[0].pValue.toFixed(3)}), with more recent studies reporting smaller effects
              (coefficient = {regressionData.predictors[0].coefficient.toFixed(3)}). This suggests a potential time
              trend, possibly due to improvements in study methodology or changes in treatment protocols over time.
              <br />
              <br />
              Sample size and mean age did not significantly predict effect size, although the negative coefficient for
              sample size (-0.0004) is consistent with small-study effects, where smaller studies tend to report larger
              effects.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


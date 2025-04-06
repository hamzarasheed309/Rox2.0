import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Study } from "@/types/meta-analysis";
import { Loader2 } from "lucide-react";

interface AIInsightsProps {
  studies: Study[];
}

interface Insight {
  title: string;
  description: string;
  type: "info" | "warning" | "success";
}

const AIInsights: React.FC<AIInsightsProps> = ({ studies }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateInsights = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock insights based on the studies data
      const mockInsights: Insight[] = [];
      
      if (studies.length === 0) {
        mockInsights.push({
          title: "No studies available",
          description: "Upload studies to get AI-powered insights about your meta-analysis.",
          type: "info"
        });
      } else {
        // Check for heterogeneity
        const effectSizes = studies.map(study => study.effect_size);
        const meanEffectSize = effectSizes.reduce((sum, size) => sum + size, 0) / effectSizes.length;
        const variance = effectSizes.reduce((sum, size) => sum + Math.pow(size - meanEffectSize, 2), 0) / effectSizes.length;
        
        if (variance > 0.5) {
          mockInsights.push({
            title: "High heterogeneity detected",
            description: "Your studies show significant variation in effect sizes. Consider subgroup analysis or meta-regression to explore sources of heterogeneity.",
            type: "warning"
          });
        }
        
        // Check for publication bias
        const pValues = studies.map(study => study.p_value);
        const significantStudies = pValues.filter(p => p < 0.05).length;
        const nonSignificantStudies = pValues.filter(p => p >= 0.05).length;
        
        if (significantStudies > nonSignificantStudies * 2) {
          mockInsights.push({
            title: "Potential publication bias",
            description: "There appears to be an imbalance between significant and non-significant studies. Consider running publication bias tests.",
            type: "warning"
          });
        }
        
        // Check for sample size
        const smallStudies = studies.filter(study => 
          (study.sample_size?.treatment || 0) + (study.sample_size?.control || 0) < 100
        );
        
        if (smallStudies.length > studies.length / 2) {
          mockInsights.push({
            title: "Small sample sizes",
            description: "Many of your studies have small sample sizes, which may affect the reliability of your meta-analysis results.",
            type: "warning"
          });
        }
        
        // Add a positive insight if everything looks good
        if (mockInsights.length === 0) {
          mockInsights.push({
            title: "Good quality meta-analysis",
            description: "Your studies show good consistency and quality. The results appear reliable.",
            type: "success"
          });
        }
      }
      
      setInsights(mockInsights);
      setLoading(false);
    };
    
    generateInsights();
  }, [studies]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Generating insights...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  insight.type === "info" ? "bg-blue-50 border-blue-200" :
                  insight.type === "warning" ? "bg-amber-50 border-amber-200" :
                  "bg-green-50 border-green-200"
                }`}
              >
                <h3 className="font-medium">{insight.title}</h3>
                <p className="text-sm mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights; 
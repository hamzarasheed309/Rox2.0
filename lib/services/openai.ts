import OpenAI from 'openai';
import { Study } from '@/types/meta-analysis';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MetaAnalysisPrompt {
  query: string;
  studies: Study[];
  analysisType: string;
  context?: string;
}

export interface MetaAnalysisResponse {
  insights: string;
  recommendations: string[];
  interpretation: string;
  visualizationSuggestions?: string[];
}

export class OpenAIService {
  /**
   * Generate insights and recommendations for meta-analysis data
   */
  static async generateMetaAnalysisInsights(prompt: MetaAnalysisPrompt): Promise<MetaAnalysisResponse> {
    try {
      // Format the studies data for the prompt
      const studiesText = prompt.studies.map(study => 
        `Study: ${study.study_label}, Effect Size: ${study.effect_size}, SE: ${study.se}, Weight: ${study.weight}`
      ).join('\n');
      
      // Create the system message based on the analysis type
      let systemMessage = "You are an expert in meta-analysis and statistical methodology. ";
      
      switch (prompt.analysisType) {
        case 'heterogeneity':
          systemMessage += "Analyze the heterogeneity in the provided meta-analysis studies. Explain the I-squared, Q-statistic, and tau-squared values. Provide recommendations for addressing heterogeneity if present.";
          break;
        case 'publication_bias':
          systemMessage += "Assess potential publication bias in the provided meta-analysis studies. Explain the results of Egger's test, Begg's test, and trim-and-fill analysis if available. Provide recommendations for addressing publication bias.";
          break;
        case 'sensitivity':
          systemMessage += "Perform a sensitivity analysis on the provided meta-analysis studies. Identify influential studies and explain how they affect the overall results. Provide recommendations for addressing sensitivity issues.";
          break;
        case 'subgroup':
          systemMessage += "Analyze potential subgroup differences in the provided meta-analysis studies. Identify significant moderators and explain their impact on the overall results. Provide recommendations for subgroup analyses.";
          break;
        case 'meta_regression':
          systemMessage += "Perform a meta-regression analysis on the provided meta-analysis studies. Identify significant predictors and explain their impact on the overall results. Provide recommendations for meta-regression analyses.";
          break;
        default:
          systemMessage += "Provide comprehensive insights about the meta-analysis studies. Identify key findings, potential issues, and recommendations for improving the analysis.";
      }
      
      // Create the user message
      const userMessage = `
        Analysis Type: ${prompt.analysisType}
        Query: ${prompt.query}
        
        Studies:
        ${studiesText}
        
        ${prompt.context ? `Additional Context: ${prompt.context}` : ''}
        
        Please provide:
        1. Key insights about the data
        2. Specific recommendations for improving the analysis
        3. Interpretation of the results
        4. Suggestions for visualizations that would help understand the data better
      `;
      
      // Call the OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      // Parse the response
      const content = response.choices[0].message.content || "";
      
      // Extract insights, recommendations, and interpretation
      const insightsMatch = content.match(/Key insights:(.*?)(?=Specific recommendations:|$)/s);
      const recommendationsMatch = content.match(/Specific recommendations:(.*?)(?=Interpretation:|$)/s);
      const interpretationMatch = content.match(/Interpretation:(.*?)(?=Suggestions for visualizations:|$)/s);
      const visualizationMatch = content.match(/Suggestions for visualizations:(.*?)$/s);
      
      const insights = insightsMatch ? insightsMatch[1].trim() : "No insights provided.";
      const recommendationsText = recommendationsMatch ? recommendationsMatch[1].trim() : "No recommendations provided.";
      const interpretation = interpretationMatch ? interpretationMatch[1].trim() : "No interpretation provided.";
      
      // Extract recommendations as an array
      const recommendations = recommendationsText
        .split(/\d+\.\s+/)
        .filter(rec => rec.trim().length > 0)
        .map(rec => rec.trim());
      
      // Extract visualization suggestions
      let visualizationSuggestions: string[] = [];
      if (visualizationMatch) {
        visualizationSuggestions = visualizationMatch[1]
          .split(/\d+\.\s+/)
          .filter(viz => viz.trim().length > 0)
          .map(viz => viz.trim());
      }
      
      return {
        insights,
        recommendations,
        interpretation,
        visualizationSuggestions: visualizationSuggestions.length > 0 ? visualizationSuggestions : undefined
      };
    } catch (error) {
      console.error("Error generating meta-analysis insights:", error);
      throw new Error("Failed to generate meta-analysis insights");
    }
  }
  
  /**
   * Generate interactive explanations for meta-analysis results
   */
  static async generateInteractiveExplanation(
    results: any,
    analysisType: string,
    query: string
  ): Promise<string> {
    try {
      // Create the system message based on the analysis type
      let systemMessage = "You are an expert in meta-analysis and statistical methodology. ";
      
      switch (analysisType) {
        case 'heterogeneity':
          systemMessage += "Explain the heterogeneity analysis results in a clear, interactive way that a researcher can understand. Focus on the I-squared, Q-statistic, and tau-squared values.";
          break;
        case 'publication_bias':
          systemMessage += "Explain the publication bias analysis results in a clear, interactive way that a researcher can understand. Focus on the Egger's test, Begg's test, and trim-and-fill analysis results.";
          break;
        case 'sensitivity':
          systemMessage += "Explain the sensitivity analysis results in a clear, interactive way that a researcher can understand. Focus on the leave-one-out analysis and cumulative meta-analysis results.";
          break;
        case 'subgroup':
          systemMessage += "Explain the subgroup analysis results in a clear, interactive way that a researcher can understand. Focus on the between-group differences and subgroup-specific results.";
          break;
        case 'meta_regression':
          systemMessage += "Explain the meta-regression analysis results in a clear, interactive way that a researcher can understand. Focus on the significant predictors and their impact on the overall results.";
          break;
        default:
          systemMessage += "Explain the meta-analysis results in a clear, interactive way that a researcher can understand.";
      }
      
      // Create the user message
      const userMessage = `
        Analysis Type: ${analysisType}
        Query: ${query}
        
        Results:
        ${JSON.stringify(results, null, 2)}
        
        Please provide an interactive explanation of these results that:
        1. Explains the key findings in plain language
        2. Highlights the most important statistics
        3. Provides context for interpreting the results
        4. Suggests what the researcher should focus on next
      `;
      
      // Call the OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      
      return response.choices[0].message.content || "No explanation provided.";
    } catch (error) {
      console.error("Error generating interactive explanation:", error);
      throw new Error("Failed to generate interactive explanation");
    }
  }
} 
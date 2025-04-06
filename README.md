# Meta-Analysis Platform with LLM Integration

A comprehensive meta-analysis platform with OpenAI-powered insights and interactive explanations.

## Features

### Core Meta-Analysis Features

- **Data Import**: Upload study data in CSV, Excel, or JSON format
- **Forest Plot**: Visualize effect sizes and confidence intervals
- **Funnel Plot**: Assess publication bias and small-study effects
- **Heterogeneity Analysis**: Evaluate variability between studies
- **Subgroup Analysis**: Analyze effects across different subgroups
- **Sensitivity Analysis**: Assess the robustness of results
- **Publication Bias Tests**: Detect and address publication bias

### AI-Powered Features

- **Intelligent Insights**: Get AI-generated insights about your meta-analysis data
- **Interactive Explanations**: Receive clear, interactive explanations of your results
- **Recommendations**: Get specific recommendations for improving your analysis
- **Visualization Suggestions**: Receive suggestions for visualizations that would help understand your data better

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```
3. Create a `.env.local` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Usage

1. **Import Data**: Upload your study data in the Data Import tab
2. **Configure Analysis**: Select effect measure, model type, and method
3. **Run Analysis**: Click "Run Meta-Analysis" to perform the analysis
4. **Explore Results**: Navigate through the different tabs to explore your results
5. **AI Analysis**: Use the AI Analysis tab to get intelligent insights and interactive explanations

## AI Analysis Types

- **General Analysis**: Get comprehensive insights about your meta-analysis
- **Heterogeneity Analysis**: Analyze the heterogeneity in your meta-analysis
- **Publication Bias**: Assess potential publication bias
- **Sensitivity Analysis**: Identify influential studies
- **Subgroup Analysis**: Analyze potential subgroup differences
- **Meta-Regression**: Identify significant predictors

## License

This project is licensed under the MIT License - see the LICENSE file for details.

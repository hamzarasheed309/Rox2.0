import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const { query, studies, analysisType } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: "No query provided" },
        { status: 400 }
      );
    }
    
    if (!studies || !Array.isArray(studies) || studies.length === 0) {
      return NextResponse.json(
        { error: "No study data provided" },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for this analysis job
    const jobId = uuidv4();
    
    // Save the studies data to a temporary file
    const studiesFilePath = path.join(uploadsDir, `${jobId}_studies.json`);
    fs.writeFileSync(studiesFilePath, JSON.stringify(studies));
    
    // Save the query to a temporary file
    const queryFilePath = path.join(uploadsDir, `${jobId}_query.txt`);
    fs.writeFileSync(queryFilePath, query);
    
    // Determine which R script to run based on the analysis type
    let rScriptName = "ai_insights.R";
    if (analysisType) {
      switch (analysisType) {
        case "heterogeneity":
          rScriptName = "heterogeneity_analysis.R";
          break;
        case "publication_bias":
          rScriptName = "publication_bias.R";
          break;
        case "sensitivity":
          rScriptName = "sensitivity_analysis.R";
          break;
        case "subgroup":
          rScriptName = "subgroup_analysis.R";
          break;
        case "meta_regression":
          rScriptName = "meta_regression.R";
          break;
        default:
          rScriptName = "ai_insights.R";
      }
    }
    
    // Process the data using R
    const rScriptPath = path.join(process.cwd(), "meta-analysis-backend", "R", rScriptName);
    
    // Execute the R script
    const { stdout, stderr } = await execAsync(
      `Rscript ${rScriptPath} ${studiesFilePath} ${queryFilePath} ${jobId}`
    );
    
    // Read the processed data
    const processedDataPath = path.join(uploadsDir, `${jobId}_analysis.json`);
    let analysisResult = {};
    
    if (fs.existsSync(processedDataPath)) {
      const processedDataContent = fs.readFileSync(processedDataPath, "utf-8");
      analysisResult = JSON.parse(processedDataContent);
      
      // Clean up temporary files
      fs.unlinkSync(studiesFilePath);
      fs.unlinkSync(queryFilePath);
      fs.unlinkSync(processedDataPath);
    }
    
    return NextResponse.json({
      success: true,
      jobId,
      data: analysisResult,
      message: "Analysis completed successfully"
    });
  } catch (error) {
    console.error("Error analyzing data:", error);
    return NextResponse.json(
      { error: "Failed to analyze data", details: (error as Error).message },
      { status: 500 }
    );
  }
} 
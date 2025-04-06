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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Generate a unique ID for this processing job
    const jobId = uuidv4();
    const fileExtension = path.extname(file.name);
    const fileName = `${jobId}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);
    
    // Process the document using R
    const rScriptPath = path.join(process.cwd(), "meta-analysis-backend", "R", "document_processor.R");
    
    // Execute the R script
    const { stdout, stderr } = await execAsync(`Rscript ${rScriptPath} ${filePath} ${jobId}`);
    
    // Read the processed data
    const processedDataPath = path.join(uploadsDir, `${jobId}_processed.json`);
    let processedData = {};
    
    if (fs.existsSync(processedDataPath)) {
      const processedDataContent = fs.readFileSync(processedDataPath, "utf-8");
      processedData = JSON.parse(processedDataContent);
      
      // Clean up temporary files
      fs.unlinkSync(filePath);
      fs.unlinkSync(processedDataPath);
    }
    
    return NextResponse.json({
      success: true,
      jobId,
      data: processedData,
      message: "Document processed successfully"
    });
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      { error: "Failed to process document", details: (error as Error).message },
      { status: 500 }
    );
  }
} 
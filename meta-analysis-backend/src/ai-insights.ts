import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Study } from '../../types/meta-analysis';

interface AIInsightsResponse {
  success: boolean;
  response: string;
  metadata: {
    n_studies: number;
    query: string;
    processing_time: string;
  };
}

/**
 * Process a user query about meta-analysis data using R
 * @param studies Array of studies to analyze
 * @param query User's query about the meta-analysis
 * @returns Promise resolving to the AI-generated response
 */
export async function processQuery(studies: Study[], query: string): Promise<AIInsightsResponse> {
  return new Promise((resolve, reject) => {
    // Create a unique job ID
    const jobId = uuidv4();
    
    // Create temporary files for data exchange
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const studiesFile = path.join(tempDir, `${jobId}_studies.json`);
    const queryFile = path.join(tempDir, `${jobId}_query.txt`);
    
    // Write studies data to temporary file
    fs.writeFileSync(studiesFile, JSON.stringify(studies));
    
    // Write query to temporary file
    fs.writeFileSync(queryFile, query);
    
    // Path to the R script
    const rScriptPath = path.join(__dirname, '../../R/ai_insights.R');
    
    // Spawn R process
    const rProcess = spawn('Rscript', [rScriptPath, studiesFile, queryFile, jobId]);
    
    let stdout = '';
    let stderr = '';
    
    // Collect stdout
    rProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    // Collect stderr
    rProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Handle process completion
    rProcess.on('close', (code) => {
      // Clean up temporary files
      try {
        fs.unlinkSync(studiesFile);
        fs.unlinkSync(queryFile);
        
        // Also clean up the output file if it exists
        const outputFile = path.join(tempDir, `${jobId}_analysis.json`);
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
        }
      } catch (error) {
        console.error('Error cleaning up temporary files:', error);
      }
      
      if (code !== 0) {
        reject(new Error(`R process exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        // Parse the JSON response from stdout
        const response = JSON.parse(stdout) as AIInsightsResponse;
        resolve(response);
      } catch (error) {
        reject(new Error(`Failed to parse R output: ${error.message}\nOutput: ${stdout}`));
      }
    });
    
    // Handle process errors
    rProcess.on('error', (error) => {
      reject(new Error(`Failed to start R process: ${error.message}`));
    });
  });
}

/**
 * Check if R and required packages are installed
 * @returns Promise resolving to true if R is available with required packages
 */
export async function checkRAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    const rProcess = spawn('Rscript', ['-e', 'packageVersion("metafor")']);
    
    rProcess.on('close', (code) => {
      resolve(code === 0);
    });
    
    rProcess.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Get a list of available analysis types
 * @returns Array of available analysis types
 */
export function getAvailableAnalyses(): string[] {
  return [
    'heterogeneity',
    'publication_bias',
    'moderators',
    'outliers',
    'trends',
    'clusters',
    'text_mining'
  ];
} 
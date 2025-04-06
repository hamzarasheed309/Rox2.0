import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Helper function to run R script
async function runRScript(scriptPath: string, args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const rProcess = spawn('Rscript', [scriptPath, ...args]);
    let output = '';
    let error = '';

    rProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    rProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    rProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`R script failed: ${error}`));
      } else {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(new Error('Failed to parse R script output'));
        }
      }
    });
  });
}

// Helper function to validate study data
function validateStudyData(data: any[]): boolean {
  if (!Array.isArray(data)) return false;
  return data.every(study => 
    typeof study === 'object' &&
    typeof study.study_id === 'string' &&
    typeof study.study_label === 'string' &&
    typeof study.effect_size === 'number' &&
    typeof study.se === 'number'
  );
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { operation, data, parameters } = body;

    // Validate operation type
    if (!['run_analysis', 'subgroup_analysis', 'sensitivity_analysis', 'publication_bias'].includes(operation)) {
      return NextResponse.json(
        { success: false, message: 'Invalid operation' },
        { status: 400 }
      );
    }

    // Validate study data
    if (!validateStudyData(data)) {
      return NextResponse.json(
        { success: false, message: 'Invalid study data format' },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Write data to temporary file
    const dataPath = path.join(tempDir, `${currentUser.id}_${Date.now()}.json`);
    await fs.writeFile(dataPath, JSON.stringify(data));

    // Determine which R script to run
    let scriptPath: string;
    switch (operation) {
      case 'run_analysis':
        scriptPath = path.join(process.cwd(), 'meta-analysis-backend', 'R', 'run_analysis.R');
        break;
      case 'subgroup_analysis':
        scriptPath = path.join(process.cwd(), 'meta-analysis-backend', 'R', 'subgroup_analysis.R');
        break;
      case 'sensitivity_analysis':
        scriptPath = path.join(process.cwd(), 'meta-analysis-backend', 'R', 'sensitivity_analysis.R');
        break;
      case 'publication_bias':
        scriptPath = path.join(process.cwd(), 'meta-analysis-backend', 'R', 'publication_bias.R');
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid operation' },
          { status: 400 }
        );
    }

    // Verify R script exists
    try {
      await fs.access(scriptPath);
    } catch {
      return NextResponse.json(
        { success: false, message: 'R script not found' },
        { status: 500 }
      );
    }

    // Run the appropriate R script
    const results = await runRScript(scriptPath, [dataPath, JSON.stringify(parameters)]);

    // Clean up temporary file
    await fs.unlink(dataPath);

    return NextResponse.json(
      { success: true, results },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Meta-analysis error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 
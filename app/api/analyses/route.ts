import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createAnalysisSchema = z.object({
  name: z.string().min(1, 'Analysis name is required'),
  description: z.string().optional(),
  datasetId: z.string().uuid('Invalid dataset ID'),
  type: z.enum(['DESCRIPTIVE', 'INFERENTIAL', 'SURVIVAL', 'CUSTOM']),
  parameters: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = createAnalysisSchema.parse(body);
    
    // Check if dataset exists and belongs to user
    const dataset = await prisma.dataset.findUnique({
      where: {
        id: validatedData.datasetId,
        userId: currentUser.id,
      },
    });
    
    if (!dataset) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dataset not found' 
        },
        { status: 404 }
      );
    }
    
    // Check analysis type availability based on plan
    if (currentUser.plan === 'BASIC' && validatedData.type !== 'DESCRIPTIVE') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Advanced analysis types are not available in the Basic plan' 
        },
        { status: 403 }
      );
    }
    
    // Create analysis
    const analysis = await prisma.analysis.create({
      data: {
        ...validatedData,
        userId: currentUser.id,
        results: {}, // Empty results initially
      },
      include: {
        dataset: {
          select: {
            name: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    // TODO: Trigger analysis job
    // This would typically be handled by a background job processor
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Analysis created successfully',
        analysis
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          errors: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while creating the analysis' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get('datasetId');
    const projectId = searchParams.get('projectId');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    
    // Prepare where clause
    const where: any = {
      userId: currentUser.id,
      isArchived: includeArchived ? undefined : false,
    };
    
    if (datasetId) {
      where.datasetId = datasetId;
    }
    
    if (projectId) {
      where.dataset = {
        projectId,
      };
    }
    
    // Get analyses
    const analyses = await prisma.analysis.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        dataset: {
          select: {
            name: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        analyses
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Get analyses error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching analyses' 
      },
      { status: 500 }
    );
  }
} 
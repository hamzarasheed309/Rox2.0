import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateAnalysisSchema = z.object({
  name: z.string().min(1, 'Analysis name is required').optional(),
  description: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  results: z.record(z.any()).optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Get analysis
    const analysis = await prisma.analysis.findUnique({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
      include: {
        dataset: {
          select: {
            id: true,
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
    
    if (!analysis) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Analysis not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        analysis
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analysis error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching the analysis' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateAnalysisSchema.parse(body);
    
    // Update analysis
    const analysis = await prisma.analysis.update({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
      data: validatedData,
      include: {
        dataset: {
          select: {
            id: true,
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
        message: 'Analysis updated successfully',
        analysis
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Update analysis error:', error);
    
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
    
    // Generic error handling for not found errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Record to update not found')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Analysis not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while updating the analysis' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Delete analysis
    await prisma.analysis.delete({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Analysis deleted successfully' 
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Delete analysis error:', error);
    
    // Generic error handling for not found errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Record to delete not found')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Analysis not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while deleting the analysis' 
      },
      { status: 500 }
    );
  }
} 
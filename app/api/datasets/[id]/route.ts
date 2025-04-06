import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateDatasetSchema = z.object({
  name: z.string().min(1, 'Dataset name is required').optional(),
  description: z.string().optional(),
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
    
    // Get dataset
    const dataset = await prisma.dataset.findUnique({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        analyses: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
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
    
    return NextResponse.json(
      { 
        success: true, 
        dataset
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dataset error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching the dataset' 
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
    const validatedData = updateDatasetSchema.parse(body);
    
    // Update dataset
    const dataset = await prisma.dataset.update({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
      data: validatedData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Dataset updated successfully',
        dataset
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Update dataset error:', error);
    
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
          message: 'Dataset not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while updating the dataset' 
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
    
    // Delete dataset
    await prisma.dataset.delete({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Dataset deleted successfully' 
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Delete dataset error:', error);
    
    // Generic error handling for not found errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Record to delete not found')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dataset not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while deleting the dataset' 
      },
      { status: 500 }
    );
  }
} 
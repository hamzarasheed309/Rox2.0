import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
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
    
    // Get project
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
      include: {
        datasets: {
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            _count: {
              select: {
                analyses: true,
              },
            },
          },
        },
      },
    });
    
    if (!project) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Project not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        project
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get project error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching the project' 
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
    const validatedData = updateProjectSchema.parse(body);
    
    // Update project
    const project = await prisma.project.update({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
      data: validatedData,
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Project updated successfully',
        project
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update project error:', error);
    
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
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Project not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while updating the project' 
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
    
    // Delete project
    await prisma.project.delete({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Project deleted successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete project error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Project not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while deleting the project' 
      },
      { status: 500 }
    );
  }
} 
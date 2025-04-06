import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
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
    const validatedData = createProjectSchema.parse(body);
    
    // Check user's project limit based on plan
    const projectCount = await prisma.project.count({
      where: { 
        userId: currentUser.id,
        isArchived: false,
      },
    });
    
    const projectLimit = currentUser.plan === 'BASIC' ? 5 : Infinity;
    
    if (projectCount >= projectLimit) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Project limit reached for your plan' 
        },
        { status: 403 }
      );
    }
    
    // Create project
    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        userId: currentUser.id,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Project created successfully',
        project
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    
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
        message: 'An error occurred while creating the project' 
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
    const includeArchived = searchParams.get('includeArchived') === 'true';
    
    // Get projects
    const projects = await prisma.project.findMany({
      where: {
        userId: currentUser.id,
        isArchived: includeArchived ? undefined : false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        _count: {
          select: {
            datasets: true,
          },
        },
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        projects
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get projects error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching projects' 
      },
      { status: 500 }
    );
  }
} 
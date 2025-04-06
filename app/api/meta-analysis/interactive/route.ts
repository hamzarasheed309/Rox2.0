import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openai';
import { getCurrentUser } from '@/lib/auth';

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
    const { results, analysisType, query } = body;

    // Validate required fields
    if (!results) {
      return NextResponse.json(
        { success: false, message: 'No results provided' },
        { status: 400 }
      );
    }

    if (!analysisType) {
      return NextResponse.json(
        { success: false, message: 'No analysis type provided' },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'No query provided' },
        { status: 400 }
      );
    }

    // Generate interactive explanation using OpenAI
    const explanation = await OpenAIService.generateInteractiveExplanation(
      results,
      analysisType,
      query
    );

    return NextResponse.json(
      { success: true, data: { explanation } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Interactive explanation error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 
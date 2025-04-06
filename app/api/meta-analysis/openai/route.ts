import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService, MetaAnalysisPrompt } from '@/lib/services/openai';
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
    const { query, studies, analysisType, context } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { success: false, message: 'No query provided' },
        { status: 400 }
      );
    }

    if (!studies || !Array.isArray(studies) || studies.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No study data provided' },
        { status: 400 }
      );
    }

    if (!analysisType) {
      return NextResponse.json(
        { success: false, message: 'No analysis type provided' },
        { status: 400 }
      );
    }

    // Create the prompt
    const prompt: MetaAnalysisPrompt = {
      query,
      studies,
      analysisType,
      context
    };

    // Generate insights using OpenAI
    const response = await OpenAIService.generateMetaAnalysisInsights(prompt);

    return NextResponse.json(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('OpenAI meta-analysis error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 
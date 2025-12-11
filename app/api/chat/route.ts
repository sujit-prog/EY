import { NextRequest, NextResponse } from 'next/server';
import { LoanOrchestrator } from '@/lib/orchestrator/orchestrator';

// Store orchestrators in memory (in production, use Redis or database)
const orchestrators = new Map<string, LoanOrchestrator>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create orchestrator for this session
    const session = sessionId || 'default';
    let orchestrator = orchestrators.get(session);
    
    if (!orchestrator) {
      orchestrator = new LoanOrchestrator();
      orchestrators.set(session, orchestrator);
    }

    // Process the message
    const response = await orchestrator.processMessage(message);

    // Get current context
    const context = orchestrator.getContext();

    return NextResponse.json({
      response,
      context: {
        currentStage: context.currentStage,
        applicationId: context.applicationId,
        customerId: context.customerId
      }
    });
  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Loan Processing API is running',
    endpoints: {
      chat: 'POST /api/chat'
    }
  });
}
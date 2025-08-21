import { NextRequest, NextResponse } from 'next/server';
import { answerQueryOnLoans } from '@/lib/loans-query';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loansData, question } = body;

    if (!loansData || !question) {
      return NextResponse.json(
        { error: 'Missing loansData or question in request body.' },
        { status: 400 }
      );
    }

    const response = await answerQueryOnLoans(loansData, question);
    return NextResponse.json({ response });
  } catch (err) {
    console.error('[AI QUERY ERROR]:', err);
    return NextResponse.json(
      { error: 'Failed to generate AI response. Please try again later.' },
      { status: 500 }
    );
  }
}


export const dynamic = 'force-dynamic';

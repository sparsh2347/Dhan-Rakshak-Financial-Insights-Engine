// app/api/receipt/receipt-query/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { answerQueryOnReceipts } from '@/lib/receipt-query';

export async function POST(req: NextRequest) : Promise<Response> {
  try {
    const body = await req.json();
    const { receipts, question } = body;

    if (!receipts || !question) {
      return NextResponse.json(
        { error: 'Missing userId or question in request body.' },
        { status: 400 }
      );
    }

    console.log(`[AI QUERY]: Received question for userId: ${receipts}`);
    const response = await answerQueryOnReceipts(receipts, question);

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

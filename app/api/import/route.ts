import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { isValidUrl } from '@/lib/validation';
import { parseJobUrl } from '@/lib/parser';

const importSchema = z.object({
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { url } = importSchema.parse(body);

    // Validate URL for SSRF protection
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL or blocked for security reasons' },
        { status: 400 }
      );
    }

    // Parse the job URL
    const extractedFields = await parseJobUrl(url);

    return NextResponse.json({
      success: true,
      extractedFields,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to parse job URL', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

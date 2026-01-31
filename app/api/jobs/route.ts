import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jobSchema, isValidUrl, extractDomain } from '@/lib/validation';
import { z } from 'zod';
import { JobStatus } from '@prisma/client';

// GET /api/jobs - List jobs with filtering and search
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== 'ALL') {
      where.status = status as JobStatus;
    }

    if (search) {
      where.OR = [
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = jobSchema.parse(body);

    // Validate URL
    if (!isValidUrl(data.url)) {
      return NextResponse.json(
        { error: 'Invalid URL or blocked for security reasons' },
        { status: 400 }
      );
    }

    const sourceDomain = extractDomain(data.url);

    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        url: data.url,
        jobTitle: data.jobTitle,
        company: data.company,
        location: data.location || null,
        description: data.description || null,
        status: (data.status as JobStatus) || 'SAVED',
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
        notes: data.notes || null,
        sourceDomain,
      },
    });

    // Create initial status history
    await prisma.jobStatusHistory.create({
      data: {
        jobId: job.id,
        fromStatus: null,
        toStatus: job.status,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

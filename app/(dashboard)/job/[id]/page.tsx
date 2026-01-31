import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import JobDetailClient from '@/components/JobDetailClient';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: {
          changedAt: 'desc',
        },
      },
    },
  });

  if (!job) {
    redirect('/dashboard');
  }

  if (job.userId !== session.user.id) {
    redirect('/dashboard');
  }

  return <JobDetailClient job={job} />;
}

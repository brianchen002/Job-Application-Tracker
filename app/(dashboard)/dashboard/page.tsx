import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JobTable from '@/components/JobTable';
import JobFilters from '@/components/JobFilters';
import Link from 'next/link';
import { JobStatus } from '@prisma/client';

interface SearchParams {
  status?: string;
  search?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  if (!session?.user) {
    return null;
  }

  const where: any = {
    userId: session.user.id,
  };

  if (params.status && params.status !== 'ALL') {
    where.status = params.status as JobStatus;
  }

  if (params.search) {
    where.OR = [
      { jobTitle: { contains: params.search, mode: 'insensitive' } },
      { company: { contains: params.search, mode: 'insensitive' } },
      { location: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const stats = await prisma.job.groupBy({
    by: ['status'],
    where: {
      userId: session.user.id,
    },
    _count: true,
  });

  const statusCounts = stats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    },
    {} as Record<JobStatus, number>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and manage your job applications
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/import"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Import Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Saved</p>
          <p className="text-2xl font-bold text-gray-900">
            {statusCounts.SAVED || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Applied</p>
          <p className="text-2xl font-bold text-blue-600">
            {statusCounts.APPLIED || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Interviewing</p>
          <p className="text-2xl font-bold text-yellow-600">
            {statusCounts.INTERVIEWING || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Offer</p>
          <p className="text-2xl font-bold text-green-600">
            {statusCounts.OFFER || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {statusCounts.REJECTED || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Ghosted</p>
          <p className="text-2xl font-bold text-gray-600">
            {statusCounts.GHOSTED || 0}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <JobFilters />
        <JobTable initialJobs={jobs} />
      </div>
    </div>
  );
}

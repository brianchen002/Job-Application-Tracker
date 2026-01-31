import { PrismaClient, JobStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a demo user
  const hashedPassword = await hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('Created user:', user.email);

  // Create sample jobs
  const jobs: Array<{
    url: string;
    jobTitle: string;
    company: string;
    location: string;
    description: string;
    status: JobStatus;
    sourceDomain: string;
    appliedDate?: Date;
  }> = [
    {
      url: 'https://example.com/job/senior-frontend',
      jobTitle: 'Senior Frontend Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      description: 'Build amazing user interfaces with React and TypeScript',
      status: JobStatus.APPLIED,
      sourceDomain: 'example.com',
      appliedDate: new Date('2024-01-15'),
    },
    {
      url: 'https://example.com/job/fullstack-dev',
      jobTitle: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      description: 'Work on both frontend and backend of our SaaS platform',
      status: JobStatus.INTERVIEWING,
      sourceDomain: 'example.com',
      appliedDate: new Date('2024-01-10'),
    },
    {
      url: 'https://example.com/job/backend-eng',
      jobTitle: 'Backend Engineer',
      company: 'BigTech Inc',
      location: 'New York, NY',
      description: 'Design and build scalable microservices',
      status: JobStatus.SAVED,
      sourceDomain: 'example.com',
    },
    {
      url: 'https://example.com/job/devops',
      jobTitle: 'DevOps Engineer',
      company: 'Cloud Solutions',
      location: 'Austin, TX',
      description: 'Manage cloud infrastructure and CI/CD pipelines',
      status: JobStatus.REJECTED,
      sourceDomain: 'example.com',
      appliedDate: new Date('2024-01-05'),
    },
    {
      url: 'https://example.com/job/product-eng',
      jobTitle: 'Product Engineer',
      company: 'Innovation Labs',
      location: 'Seattle, WA',
      description: 'Bridge the gap between product and engineering',
      status: JobStatus.OFFER,
      sourceDomain: 'example.com',
      appliedDate: new Date('2024-01-08'),
    },
  ];

  for (const jobData of jobs) {
    const job = await prisma.job.create({
      data: {
        ...jobData,
        userId: user.id,
      },
    });

    // Create initial status history
    await prisma.jobStatusHistory.create({
      data: {
        jobId: job.id,
        fromStatus: null,
        toStatus: JobStatus.SAVED,
        changedAt: new Date(job.createdAt.getTime() - 1000),
      },
    });

    // If status is not SAVED, add another history entry
    if (job.status !== JobStatus.SAVED) {
      await prisma.jobStatusHistory.create({
        data: {
          jobId: job.id,
          fromStatus: JobStatus.SAVED,
          toStatus: job.status,
          changedAt: job.appliedDate || job.createdAt,
        },
      });
    }

    console.log('Created job:', job.jobTitle);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

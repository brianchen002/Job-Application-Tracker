import { z } from 'zod';

// SSRF protection: block private IP ranges and localhost
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
];

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^fc00:/,
  /^fe80:/,
];

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // Check for blocked hosts
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTS.includes(hostname)) {
      return false;
    }

    // Check for private IP ranges
    for (const range of PRIVATE_IP_RANGES) {
      if (range.test(hostname)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function sanitizeText(text: string): string {
  // Basic sanitization - remove script tags and trim
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

export const jobSchema = z.object({
  url: z.string().url(),
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'GHOSTED']).optional(),
  appliedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateJobSchema = jobSchema.partial().extend({
  id: z.string(),
});

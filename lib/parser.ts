import { JSDOM } from 'jsdom';
import { sanitizeText, extractDomain } from './validation';

export interface ParsedJobData {
  jobTitle: string;
  company: string;
  location: string;
  description: string;
  sourceDomain: string;
}

export async function parseJobUrl(url: string): Promise<ParsedJobData> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobTrackerBot/1.0)',
    },
    signal: AbortSignal.timeout(10000), // 10 second timeout
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Try Open Graph tags first
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');

  // Fallback to regular meta tags
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
  const pageTitle = document.querySelector('title')?.textContent;

  // Extract data
  let jobTitle = sanitizeText(ogTitle || pageTitle || '');
  let company = sanitizeText(ogSiteName || '');
  let description = sanitizeText(ogDescription || metaDescription || '');
  let location = '';

  // Try to extract location from structured data
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd?.textContent) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      if (data['@type'] === 'JobPosting') {
        jobTitle = data.title || jobTitle;
        company = data.hiringOrganization?.name || company;
        location = data.jobLocation?.address?.addressLocality ||
                   data.jobLocation?.address?.addressRegion ||
                   location;
        description = data.description || description;
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  // If we still don't have a company, try to extract from common patterns
  if (!company) {
    // Look for company in URL path
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      company = pathParts[0];
    }
  }

  const sourceDomain = extractDomain(url);

  return {
    jobTitle: jobTitle || 'Unknown Position',
    company: company || sourceDomain,
    location: location || 'Not specified',
    description: description.slice(0, 500), // Limit description length
    sourceDomain,
  };
}

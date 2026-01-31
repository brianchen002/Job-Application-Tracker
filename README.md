# Job Application Tracker

A full-stack web application for tracking job applications with URL import, status management, and application history.

## Features

- **Authentication**: Secure email/password authentication using NextAuth
- **Job Import**: Import jobs by pasting URLs with automatic metadata extraction
- **Status Tracking**: Track applications through 6 stages (Saved, Applied, Interviewing, Offer, Rejected, Ghosted)
- **Status History**: Complete timeline of status changes for each job
- **Search & Filter**: Find jobs by title, company, location, and status
- **Dashboard**: Overview with statistics and sortable job table
- **Notes**: Add personal notes to each job application

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth with credentials provider
- **Parsing**: JSDOM for web scraping and Open Graph metadata extraction

## Installation

### Prerequisites

- Node.js 18+ and npm

### Setup Steps

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   The `.env` file is already created with default values:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   For production, generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. Click "Register" to create an account
2. Sign in with your credentials
3. You'll be redirected to the dashboard

### Importing a Job

1. Click "Import Job" in the navigation
2. Paste a job posting URL (e.g., from LinkedIn, Indeed, company career pages)
3. Click "Fetch Details" - the system will attempt to extract:
   - Job title
   - Company name
   - Location
   - Description
4. Review and edit the extracted fields
5. Click "Save Job" to add it to your tracker

### Managing Jobs

- **Dashboard**: View all jobs with status filters and search
- **Update Status**: Click the status dropdown in the table for quick updates
- **View Details**: Click job title or "View" to see full details and history
- **Edit Job**: Click "Edit" on the detail page to modify any field
- **Delete Job**: Click "Delete" in the table (with confirmation)

### Status History

Each job maintains a complete history of status changes with timestamps. View the timeline on the job detail page.

## How Import Works

The import feature uses server-side fetching to avoid CORS issues:

1. **URL Validation**: Checks for valid HTTP/HTTPS URLs and blocks private IPs (SSRF protection)
2. **Fetching**: Server-side fetch retrieves the HTML
3. **Parsing Priority**:
   - JSON-LD structured data (JobPosting schema)
   - Open Graph tags (og:title, og:site_name, og:description)
   - Standard meta tags
   - Page title and content

### Limitations

- **CORS/Blocking**: Some websites block automated scraping
- **Accuracy**: Parsing quality depends on website structure
- **Rate Limits**: No built-in rate limiting (add if needed)
- **Authentication**: Cannot access login-required pages
- **JavaScript-rendered content**: Only parses static HTML

### Supported Sites

Works best with:
- Job boards using standard metadata (LinkedIn, Indeed, Glassdoor)
- Company career pages with structured data
- Sites with Open Graph tags

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── (dashboard)/
│   │   ├── dashboard/      # Main dashboard
│   │   ├── import/         # Job import page
│   │   └── job/[id]/       # Job detail page
│   ├── api/
│   │   ├── auth/           # NextAuth routes
│   │   ├── register/       # User registration
│   │   ├── import/         # Job URL parsing
│   │   └── jobs/           # Job CRUD operations
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuthProvider.tsx    # NextAuth session provider
│   ├── Header.tsx          # Navigation header
│   ├── JobTable.tsx        # Jobs table with inline editing
│   ├── JobFilters.tsx      # Search and status filters
│   └── JobDetailClient.tsx # Job detail view
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client singleton
│   ├── validation.ts       # Input validation and SSRF protection
│   └── parser.ts           # Job URL parsing logic
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
└── types/
    └── next-auth.d.ts      # NextAuth TypeScript definitions
```

## Database Schema

### User
- id, email, password, name, timestamps

### Job
- id, userId, url, jobTitle, company, location, description
- status (enum), appliedDate, notes, sourceDomain
- timestamps, indexes on userId, status, updatedAt

### JobStatusHistory
- id, jobId, fromStatus, toStatus, changedAt
- Tracks all status changes with timestamps

## Security Features

- **SSRF Protection**: Blocks localhost and private IP ranges
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Zod schemas for all API inputs
- **Authentication**: Session-based auth with JWT
- **Authorization**: Users can only access their own data
- **XSS Prevention**: Basic script tag sanitization

## API Endpoints

### Authentication
- `POST /api/register` - Create new user
- `POST /api/auth/signin` - Sign in (NextAuth)
- `GET /api/auth/signout` - Sign out (NextAuth)

### Jobs
- `GET /api/jobs` - List jobs (with filters: status, search)
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job with history
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Import
- `POST /api/import` - Parse job URL and extract metadata

## Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma migrate dev       # Create and apply migration
npx prisma studio           # Open Prisma Studio GUI
npx prisma generate         # Regenerate Prisma Client

# Linting
npm run lint         # Run ESLint
```

## Future Improvements

### High Priority
- [ ] Data export (CSV, JSON)
- [ ] Email notifications for follow-ups
- [ ] Application deadline tracking
- [ ] Contact information for each job
- [ ] Interview preparation notes

### Medium Priority
- [ ] Kanban board view
- [ ] Resume/cover letter attachment storage
- [ ] Application analytics and insights
- [ ] Browser extension for one-click import
- [ ] Mobile responsive improvements

### Low Priority
- [ ] Team collaboration features
- [ ] Integration with job boards APIs
- [ ] Calendar integration
- [ ] Salary tracking and comparison
- [ ] Document templates

### Technical Improvements
- [ ] Rate limiting on import endpoint
- [ ] Retry logic for failed fetches
- [ ] Better error handling and user feedback
- [ ] Loading states and optimistic updates
- [ ] Pagination for large job lists
- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Unit and E2E tests

## Troubleshooting

### Import not working
- **CORS errors**: Server-side fetch should prevent this, but some sites block all automated access
- **Parsing issues**: Review extracted data and edit manually
- **Timeout**: Some sites are slow - consider increasing timeout in lib/parser.ts

### Database issues
```bash
# Reset database
rm -f prisma/dev.db
npx prisma migrate dev

# View database
npx prisma studio
```

### Authentication issues
- Ensure NEXTAUTH_SECRET is set
- Clear browser cookies and try again
- Check that database has User table

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions, please open an issue on GitHub.

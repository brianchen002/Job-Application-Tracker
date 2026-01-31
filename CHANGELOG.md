# Changelog

All notable changes to the Job Application Tracker project.

## [1.0.0] - 2026-01-20

### Initial Release

Complete MVP with all core features implemented.

### Added

**Authentication**
- User registration with email and password
- Secure login with NextAuth.js
- Session management with JWT tokens
- Protected routes for authenticated users

**Database**
- SQLite database with Prisma ORM
- User, Job, and JobStatusHistory models
- Proper indexing for performance
- Database migrations system
- Seed script with demo data

**Job Import**
- URL-based job import
- Server-side HTML fetching
- Open Graph metadata extraction
- JSON-LD structured data parsing
- SSRF protection (blocks private IPs)
- Pre-filled review form with editing

**Job Management**
- Create, read, update, delete jobs
- Six status types: Saved, Applied, Interviewing, Offer, Rejected, Ghosted
- Automatic status history tracking
- Notes field for each job
- Applied date tracking
- Source domain extraction

**Dashboard**
- Overview with status statistics
- Searchable jobs table
- Status filter dropdown
- Inline status updates
- Sort by last updated
- Quick actions (view, delete)
- Empty state with CTA

**Job Detail Page**
- Full job information display
- Edit mode for all fields
- Complete status history timeline
- Notes editor
- Link to original posting
- Created/updated timestamps

**UI/UX**
- Clean, minimal design
- Responsive layout (mobile-friendly)
- Tailwind CSS styling
- Loading states
- Error messages
- Confirmation dialogs

**Security**
- SSRF protection
- Password hashing (bcryptjs)
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS sanitization
- CSRF protection (NextAuth)
- User data isolation

**Documentation**
- Comprehensive README
- Quick start guide
- Deployment guide
- Project summary
- Code comments
- Environment variable examples

### Technical Stack
- Next.js 15.1.4 (App Router)
- TypeScript 5.x
- React 19.0.0
- Prisma 6.2.0
- SQLite
- NextAuth 4.24.11
- Tailwind CSS 3.4.1
- JSDOM 25.0.1
- Zod 3.24.1
- bcryptjs 2.4.3

### Files Added
- 40+ source files
- 3 documentation files
- 1 seed script
- Database schema and migrations
- Environment configuration

---

## Future Versions

### [1.1.0] - Planned
- CSV/JSON data export
- Email notifications
- Application deadlines
- Better error handling
- Loading animations

### [1.2.0] - Planned
- Resume/cover letter attachments
- Kanban board view
- Application analytics
- Interview notes
- Contact management

### [2.0.0] - Planned
- Browser extension
- Mobile app
- Team collaboration
- API integrations
- AI-powered insights

---

## Version History

- **1.0.0** (2026-01-20) - Initial release

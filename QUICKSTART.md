# Quick Start Guide

Get started with the Job Application Tracker in 3 minutes.

## Prerequisites

- Node.js 18+ and npm installed
- Terminal/command line access

## Setup (First Time)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

3. **Seed with demo data (optional)**
   ```bash
   npm run seed
   ```

   This creates a demo account:
   - Email: `demo@example.com`
   - Password: `password123`
   - 5 sample job applications

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**

   Go to [http://localhost:3000](http://localhost:3000)

## Using the App

### First Login

If you seeded the database:
- Email: `demo@example.com`
- Password: `password123`

Or click "Register" to create your own account.

### Import Your First Job

1. Find a job posting online (LinkedIn, Indeed, company site, etc.)
2. Copy the URL
3. Click "Import Job" in the navigation
4. Paste the URL and click "Fetch Details"
5. Review the extracted information
6. Click "Save Job"

### Track Your Applications

**Dashboard View:**
- See all jobs in a table
- Use filters to find specific jobs
- Update status with inline dropdown
- Click job title to see details

**Status Options:**
- Saved - Jobs you're interested in
- Applied - Applications submitted
- Interviewing - In the interview process
- Offer - Received an offer
- Rejected - Application rejected
- Ghosted - No response received

**Job Detail Page:**
- View full job information
- Edit any field
- Add personal notes
- See complete status history

## Common Tasks

### Import Multiple Jobs
Repeat the import process for each job. There's no bulk import currently.

### Export Your Data
Not yet implemented. Coming soon!

### Search Jobs
Use the search box on the dashboard to find jobs by title, company, or location.

### Filter by Status
Use the status dropdown on the dashboard to view only jobs in a specific stage.

## Tips

- Always review imported data before saving - parsing isn't perfect
- Use the notes field for interview dates, contacts, or follow-up reminders
- Update status immediately after each application step
- Check the status history to see your progress over time

## Troubleshooting

**Import not working?**
- Some websites block automated scraping
- Try a different job board
- Manually edit fields if extraction fails

**Can't sign in?**
- Make sure you registered first
- Check email and password spelling
- Clear browser cookies and try again

**Database issues?**
```bash
# Reset database
rm -f prisma/dev.db
npx prisma migrate dev
npm run seed
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check the "Future Improvements" section for upcoming features
- Customize the code to fit your workflow

## Support

Open an issue on GitHub if you encounter problems or have questions.

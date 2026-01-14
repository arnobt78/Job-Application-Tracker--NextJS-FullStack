# Job Tracking Application - Next.js, TypeScript, Clerk, Prisma, React Query, PostgreSQL FullStack Project

A full-featured, production-ready job tracking application built with Next.js 14+, TypeScript, Clerk, Prisma, React Query, PostgreSQL, and modern web technologies. Jobify helps job seekers efficiently organize, track, and analyze their job search journey with a beautiful, responsive dashboard.

- **Live-Demo:** [https://jobify-tracker.vercel.app/](https://jobify-tracker.vercel.app/)

![Screenshot 2025-07-01 at 15 31 44](https://github.com/user-attachments/assets/48f21eef-d40c-4e44-a585-a6b3f2417ebf) ![Screenshot 2025-07-01 at 14 33 39](https://github.com/user-attachments/assets/29e151c8-2deb-4dcd-8856-febb4c043abf) ![Screenshot 2025-07-01 at 14 48 55](https://github.com/user-attachments/assets/bf1eb91e-3b92-40a8-b78f-83ac1157919f) ![Screenshot 2025-07-01 at 14 51 02](https://github.com/user-attachments/assets/e41cb629-a0f8-4301-b926-969bf3d78cc3)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Project](#️-running-the-project)
- [Project Walkthrough](#-project-walkthrough)
- [Components Guide](#-components-guide)
- [Server Actions & API](#-server-actions--api)
- [Routing Structure](#-routing-structure)
- [Key Concepts](#-key-concepts)
- [Reusable Components](#-reusable-components)
- [Code Examples](#-code-examples)
- [Keywords](#-keywords)
- [Conclusion](#-conclusion)

---

## 🎯 Overview

Jobify is a comprehensive job application tracking system that allows users to:

- **Track Job Applications**: Add, edit, and manage job applications with details like position, company, location, status, and employment type
- **Search & Filter**: Search jobs by position or company name, filter by status (pending, interview, declined)
- **Analytics Dashboard**: Visualize job application statistics with charts and graphs
- **Export Data**: Download job application history as CSV or Excel files with monthly grouping
- **Secure Authentication**: User-specific data with Clerk authentication
- **Dark Mode**: Beautiful theme switching with system preference detection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

---

## ✨ Features

### Core Functionality

- ✅ **CRUD Operations**: Create, Read, Update, Delete job applications
- ✅ **Advanced Search**: Search by job title or company name
- ✅ **Status Filtering**: Filter by pending, interview, or declined status
- ✅ **Pagination**: Efficient pagination for large job lists
- ✅ **Real-time Stats**: Dashboard with pending, interview, and declined counts
- ✅ **Charts & Analytics**: Visual representation of application trends over time
- ✅ **Data Export**: Download reports in CSV or Excel format with statistics

### User Experience

- ✅ **Authentication**: Secure user authentication with Clerk
- ✅ **User Isolation**: Each user only sees their own job applications
- ✅ **Loading States**: Skeleton loaders and loading indicators
- ✅ **Error Handling**: Graceful error handling throughout the application
- ✅ **Form Validation**: Client and server-side validation with Zod
- ✅ **Toast Notifications**: User feedback for actions
- ✅ **Theme Support**: Light, dark, and system theme modes

### Technical Features

- ✅ **Server-Side Rendering**: Fast initial page loads with Next.js SSR
- ✅ **Data Prefetching**: React Query hydration for optimal performance
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Database ORM**: Prisma for type-safe database queries
- ✅ **Responsive UI**: Mobile-first design with Tailwind CSS
- ✅ **Component Library**: shadcn/ui for consistent, accessible components

---

## 🛠 Technology Stack

### Frontend

- **Next.js 14.2.1** - React framework with App Router
- **TypeScript 5** - Type-safe JavaScript
- **React 18** - UI library
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide React** - Icon library
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Recharts** - Chart library for analytics

### Backend & Database

- **Next.js Server Actions** - Server-side API endpoints
- **Prisma 5.7** - Next-generation ORM
- **PostgreSQL** - Relational database
- **Clerk** - Authentication and user management

### State Management & Data Fetching

- **TanStack Query (React Query) 5.14** - Server state management
- **React Query Devtools** - Development tools

### Additional Libraries

- **dayjs** - Date manipulation and formatting
- **xlsx** - Excel file generation
- **next-themes** - Theme management
- **class-variance-authority** - Component variant management

---

## 📁 Project Structure

```bash
job-tracking-app/
├── app/                          # Next.js App Router directory
│   ├── (dashboard)/              # Route group for dashboard pages
│   │   ├── add-job/
│   │   │   └── page.tsx          # Add new job page
│   │   ├── jobs/
│   │   │   ├── [id]/             # Dynamic route for job details
│   │   │   │   └── page.tsx      # Edit job page
│   │   │   ├── loading.tsx       # Loading UI for jobs page
│   │   │   └── page.tsx          # All jobs listing page
│   │   ├── stats/
│   │   │   ├── loading.tsx       # Loading UI for stats page
│   │   │   └── page.tsx          # Statistics dashboard page
│   │   └── layout.tsx            # Dashboard layout (Sidebar + Navbar)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   └── providers.tsx             # React Query & Theme providers
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── ...                   # Other UI components
│   ├── ButtonContainer.tsx       # Pagination buttons
│   ├── ChartsContainer.tsx       # Analytics charts
│   ├── CreateJobForm.tsx         # Form to create new job
│   ├── DeleteJobButton.tsx       # Delete job button
│   ├── DownloadDropdown.tsx      # CSV/Excel export dropdown
│   ├── EditJobForm.tsx           # Form to edit job
│   ├── JobCard.tsx               # Job card component
│   ├── JobsList.tsx               # Jobs listing component
│   ├── Navbar.tsx                # Top navigation bar
│   ├── SearchForm.tsx            # Search and filter form
│   ├── Sidebar.tsx               # Side navigation
│   ├── StatsCard.tsx             # Statistics card component
│   ├── StatsContainer.tsx        # Stats container
│   └── ThemeToggle.tsx           # Theme switcher
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Database seeding script
├── public/                       # Static assets
│   ├── logo.svg
│   └── main.svg
├── utils/
│   ├── actions.ts                # Server actions
│   ├── db.ts                     # Prisma client singleton
│   ├── links.tsx                 # Navigation links
│   └── types.ts                  # TypeScript types & Zod schemas
├── lib/
│   └── utils.ts                  # Utility functions
├── middleware.ts                 # Next.js middleware (auth protection)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/18-nextjs-jobify-app.git
   cd 18-nextjs-jobify-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (see [Environment Variables](#-environment-variables) section)

4. **Set up the database** (see [Database Setup](#-database-setup) section)

5. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

7. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/jobify_db?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/jobify_db?schema=public"
```

### How to Get Environment Variables

#### 1. Clerk Authentication Keys

**Step 1: Create a Clerk Account**

- Visit [https://clerk.com](https://clerk.com)
- Sign up for a free account
- Create a new application

**Step 2: Get Your Keys**

- Go to your Clerk Dashboard
- Navigate to **API Keys** section
- Copy the following:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
  - `CLERK_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)

**Step 3: Configure Authentication**

- In Clerk Dashboard, go to **Settings** → **Paths**
- Set **Sign-in path** to: `/sign-in`
- Set **Sign-up path** to: `/sign-up`
- Set **After sign-in URL** to: `/add-job`
- Set **After sign-up URL** to: `/add-job`

#### 2. PostgreSQL Database Connection

**Option A: Local PostgreSQL**

1. **Install PostgreSQL**

   - Download from [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   - Or use Homebrew: `brew install postgresql@14`

2. **Create Database**

   ```bash
   # Start PostgreSQL service
   brew services start postgresql@14
   # or
   sudo service postgresql start

   # Connect to PostgreSQL
   psql postgres

   # Create database
   CREATE DATABASE jobify_db;

   # Create user (optional)
   CREATE USER jobify_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE jobify_db TO jobify_user;
   ```

3. **Connection String Format**

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/jobify_db?schema=public"
   DIRECT_URL="postgresql://username:password@localhost:5432/jobify_db?schema=public"
   ```

**Option B: Cloud Database (Recommended for Production)**

1. **Supabase** (Free tier available)

   - Visit [https://supabase.com](https://supabase.com)
   - Create a new project
   - Go to **Settings** → **Database**
   - Copy the **Connection string** (URI format)

2. **Neon** (Free tier available)

   - Visit [https://neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string from dashboard

3. **Railway** (Free tier available)
   - Visit [https://railway.app](https://railway.app)
   - Create a new PostgreSQL database
   - Copy the connection string

### Example `.env.local` File

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
CLERK_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890

# Database (Local PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobify_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/jobify_db?schema=public"

# Optional: Node Environment
NODE_ENV=development
```

### Security Notes

- ⚠️ **Never commit `.env.local` to version control**
- ✅ The `.env.local` file is already in `.gitignore`
- ✅ Use different keys for development and production
- ✅ Rotate keys if they're accidentally exposed

---

## 🗄 Database Setup

### 1. Initialize Prisma

Prisma is already configured. The schema is located at `prisma/schema.prisma`.

### 2. Create Database Migration

```bash
npx prisma migrate dev --name init
```

This command will:

- Create a new migration file
- Apply the migration to your database
- Generate the Prisma Client

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. (Optional) Seed the Database

If you want to populate the database with sample data:

```bash
npx prisma db seed
```

### 5. View Database in Prisma Studio

```bash
npx prisma studio
```

This opens a visual database browser at [http://localhost:5555](http://localhost:5555)

### Database Schema

The main model is the `Job` model:

```prisma
model Job {
  id        String   @id @default(uuid())
  clerkId   String   // User ID from Clerk
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  position  String   // Job title
  company   String   // Company name
  location  String   // Job location
  status    String   // pending, interview, declined
  mode      String   // full-time, part-time, internship
}
```

---

## ▶️ Running the Project

### Development Mode

```bash
npm run dev
```

- Runs on [http://localhost:3000](http://localhost:3000)
- Hot reload enabled
- React Query Devtools available

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Other Commands

```bash
# Run linter
npm run lint

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

---

## 🎓 Project Walkthrough

### 1. Landing Page (`/`)

The landing page introduces Jobify with:

- Hero section with app description
- Call-to-action button to get started
- Responsive design with logo and illustration

**Key Features:**

- Server-side rendered for fast initial load
- Responsive layout (mobile-first)
- Direct link to authentication flow

### 2. Authentication Flow

When users click "Get Started":

1. Clerk middleware checks authentication
2. Unauthenticated users are redirected to sign-in
3. After sign-in/sign-up, users are redirected to `/add-job`

**Protected Routes:**

- `/add-job` - Add new job application
- `/jobs` - View all jobs
- `/jobs/[id]` - Edit specific job
- `/stats` - View statistics dashboard

### 3. Add Job Page (`/add-job`)

**Features:**

- Form to create new job application
- Fields: Position, Company, Location, Status, Mode
- Client and server-side validation
- Toast notification on success/error
- Automatic redirect to jobs list after creation

**Form Validation:**

- Uses React Hook Form for form state
- Zod schema for validation
- Real-time error messages

### 4. All Jobs Page (`/jobs`)

**Features:**

- Search by position or company name
- Filter by status (all, pending, interview, declined)
- Pagination for large job lists
- Download dropdown (CSV/Excel export)
- Responsive grid layout (2 columns on desktop, 1 on mobile)

**Data Flow:**

1. Server pre-fetches initial data (React Query hydration)
2. Client-side React Query manages state
3. URL search params sync with filters
4. Real-time updates on search/filter changes

### 5. Edit Job Page (`/jobs/[id]`)

**Features:**

- Pre-populated form with existing job data
- Same validation as create form
- Update job details
- Delete job functionality
- Server-side data prefetching

### 6. Statistics Page (`/stats`)

**Features:**

- Three stat cards: Pending, Interview, Declined
- Charts showing application trends (last 6 months)
- Real-time data from database
- Loading states with skeleton loaders

---

## 🧩 Components Guide

### Core Components

#### 1. **JobsList Component**

**Location:** `components/JobsList.tsx`

**Purpose:** Displays paginated list of job applications with search and filter capabilities.

**Key Features:**

- React Query for data fetching
- URL-based search parameters
- Pagination support
- Download functionality integration

**Usage:**

```tsx
import JobsList from "@/components/JobsList";

function JobsPage() {
  return <JobsList />;
}
```

**Props:** None (uses URL search params)

**How it Works:**

1. Reads search params from URL (`search`, `jobStatus`, `page`)
2. Uses React Query to fetch data with `getAllJobsAction`
3. Displays jobs in responsive grid
4. Shows pagination if more than 1 page
5. Handles loading and empty states

---

#### 2. **SearchForm Component**

**Location:** `components/SearchForm.tsx`

**Purpose:** Provides search and filter functionality for jobs.

**Key Features:**

- Search by position or company
- Filter by job status
- URL-based state management
- Form submission handling

**Usage:**

```tsx
import SearchForm from "@/components/SearchForm";

function JobsPage() {
  return (
    <>
      <SearchForm />
      <JobsList />
    </>
  );
}
```

**How it Works:**

1. Reads current search params from URL
2. Pre-fills form with current values
3. On submit, updates URL with new params
4. React Query automatically refetches with new params

---

#### 3. **DownloadDropdown Component**

**Location:** `components/DownloadDropdown.tsx`

**Purpose:** Allows users to download job application data as CSV or Excel files.

**Key Features:**

- CSV export with proper formatting
- Excel export with merged cells
- Statistics summary in exported files
- Monthly grouping with visual gaps
- Serial numbering for easy reference

**Usage:**

```tsx
import DownloadDropdown from "@/components/DownloadDropdown";

function JobsPage() {
  return (
    <div>
      <h2>Jobs Found</h2>
      <DownloadDropdown />
    </div>
  );
}
```

**Export Format:**

- **CSV:** Simple text format, easy to open in any spreadsheet app
- **Excel:** Proper XLSX format with merged header cells

**File Structure:**

```
Job Application History
Total Applied: X, Declined: Y, Interview: Z, Pending: W      Report Generated: DD-MMM-YYYY HH:mm

No., Applied Date, Job Title, Company Name, Job Location, Role, Status
1, 15-Oct-2025, "Software Engineer", "Tech Corp", "San Francisco", Full Time, Pending
...
```

---

#### 4. **StatsContainer Component**

**Location:** `components/StatsContainer.tsx`

**Purpose:** Displays job application statistics in card format.

**Key Features:**

- Three stat cards (Pending, Interview, Declined)
- Loading states with skeleton cards
- Real-time data from database
- Responsive grid layout

**Usage:**

```tsx
import StatsContainer from "@/components/StatsContainer";

function StatsPage() {
  return (
    <>
      <StatsContainer />
      <ChartsContainer />
    </>
  );
}
```

---

#### 5. **ChartsContainer Component**

**Location:** `components/ChartsContainer.tsx`

**Purpose:** Visualizes job application trends over time.

**Key Features:**

- Area chart showing applications per month
- Last 6 months of data
- Responsive chart design
- Loading states

---

#### 6. **CreateJobForm Component**

**Location:** `components/CreateJobForm.tsx`

**Purpose:** Form to create new job applications.

**Key Features:**

- React Hook Form integration
- Zod validation
- Server action submission
- Toast notifications
- Automatic redirect on success

**Form Fields:**

- Position (required, min 2 characters)
- Company (required, min 2 characters)
- Location (required, min 2 characters)
- Status (enum: pending, interview, declined)
- Mode (enum: full-time, part-time, internship)

---

#### 7. **EditJobForm Component**

**Location:** `components/EditJobForm.tsx`

**Purpose:** Form to edit existing job applications.

**Key Features:**

- Pre-populated with existing data
- Same validation as create form
- Update server action
- Delete functionality
- Optimistic updates

---

### UI Components (shadcn/ui)

All UI components are located in `components/ui/` and are built with:

- **Radix UI** primitives for accessibility
- **Tailwind CSS** for styling
- **class-variance-authority** for variants

**Available Components:**

- `Button` - Various button styles and sizes
- `Card` - Container component
- `Form` - Form wrapper with validation
- `Input` - Text input field
- `Select` - Dropdown select
- `DropdownMenu` - Dropdown menu component
- `Toast` - Notification system
- `Skeleton` - Loading placeholder
- And more...

---

## 🔌 Server Actions & API

### Server Actions Overview

Next.js Server Actions allow you to write server-side code that can be called directly from client components. All server actions are in `utils/actions.ts`.

### Available Server Actions

#### 1. **createJobAction**

**Purpose:** Create a new job application.

**Signature:**

```typescript
createJobAction(values: CreateAndEditJobType): Promise<JobType | null>
```

**Usage:**

```tsx
const result = await createJobAction({
  position: "Software Engineer",
  company: "Tech Corp",
  location: "San Francisco",
  status: "pending",
  mode: "full-time",
});
```

**What it Does:**

1. Authenticates user
2. Validates input with Zod schema
3. Creates job record in database
4. Associates job with user's Clerk ID
5. Returns created job or null on error

---

#### 2. **getAllJobsAction**

**Purpose:** Fetch paginated list of jobs with optional search and filter.

**Signature:**

```typescript
getAllJobsAction({
  search?: string,
  jobStatus?: string,
  page?: number,
  limit?: number
}): Promise<{
  jobs: JobType[],
  count: number,
  page: number,
  totalPages: number
}>
```

**Usage:**

```tsx
const result = await getAllJobsAction({
  search: "engineer",
  jobStatus: "pending",
  page: 1,
  limit: 10,
});
```

**Features:**

- User-specific data (only returns user's jobs)
- Search by position or company
- Filter by status
- Pagination support
- Returns total count for pagination

---

#### 3. **getSingleJobAction**

**Purpose:** Fetch a single job by ID.

**Signature:**

```typescript
getSingleJobAction(id: string): Promise<JobType | null>
```

**Usage:**

```tsx
const job = await getSingleJobAction("job-id-123");
```

**Security:**

- Only returns job if it belongs to authenticated user
- Redirects to `/jobs` if job not found or unauthorized

---

#### 4. **updateJobAction**

**Purpose:** Update an existing job application.

**Signature:**

```typescript
updateJobAction(
  id: string,
  values: CreateAndEditJobType
): Promise<JobType | null>
```

**Usage:**

```tsx
const updated = await updateJobAction("job-id-123", {
  position: "Senior Engineer",
  company: "Tech Corp",
  location: "Remote",
  status: "interview",
  mode: "full-time",
});
```

---

#### 5. **deleteJobAction**

**Purpose:** Delete a job application.

**Signature:**

```typescript
deleteJobAction(id: string): Promise<JobType | null>
```

**Usage:**

```tsx
const deleted = await deleteJobAction("job-id-123");
```

**Security:**

- Only deletes jobs belonging to authenticated user
- Compound where clause ensures user ownership

---

#### 6. **getStatsAction**

**Purpose:** Get statistics grouped by job status.

**Signature:**

```typescript
getStatsAction(): Promise<{
  pending: number,
  interview: number,
  declined: number
}>
```

**Usage:**

```tsx
const stats = await getStatsAction();
// Returns: { pending: 5, interview: 3, declined: 2 }
```

**How it Works:**

- Uses Prisma `groupBy` to count jobs by status
- Returns counts for each status type
- Defaults to 0 if no jobs of that status exist

---

#### 7. **getChartsDataAction**

**Purpose:** Get job application data for charts (last 6 months).

**Signature:**

```typescript
getChartsDataAction(): Promise<Array<{ date: string, count: number }>>
```

**Usage:**

```tsx
const chartData = await getChartsDataAction();
// Returns: [{ date: "Oct 25", count: 5 }, { date: "Nov 25", count: 3 }, ...]
```

---

#### 8. **getAllJobsForDownloadAction**

**Purpose:** Get all jobs for export (no pagination).

**Signature:**

```typescript
getAllJobsForDownloadAction(): Promise<JobType[]>
```

**Usage:**

```tsx
const allJobs = await getAllJobsForDownloadAction();
```

**Note:** Used by download functionality to export complete job history.

---

## 🛣 Routing Structure

### Next.js App Router

This project uses Next.js 14 App Router with the following structure:

```bash
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout
├── providers.tsx               # Global providers
├── (dashboard)/                # Route group (doesn't affect URL)
│   ├── layout.tsx              # Dashboard layout
│   ├── add-job/
│   │   └── page.tsx            # /add-job
│   ├── jobs/
│   │   ├── page.tsx            # /jobs
│   │   ├── loading.tsx         # Loading UI
│   │   └── [id]/
│   │       └── page.tsx        # /jobs/[id] (dynamic route)
│   └── stats/
│       ├── page.tsx            # /stats
│       └── loading.tsx         # Loading UI
```

### Route Protection

Routes are protected using Clerk middleware in `middleware.ts`:

```typescript
const isProtectedRoute = createRouteMatcher([
  "/add-job",
  "/jobs(.*)",
  "/stats",
]);
```

**How it Works:**

- Middleware runs on every request
- Checks if route is protected
- Redirects to sign-in if user not authenticated
- Allows access if user is authenticated

### Dynamic Routes

- `/jobs/[id]` - Dynamic route for individual job pages
- `[id]` is accessible via `params.id` in the page component

---

## 🎯 Key Concepts

### 1. Server Components vs Client Components

**Server Components** (default):

- Run on the server
- Can directly access database
- No JavaScript sent to client
- Faster initial page load

**Client Components** (`"use client"`):

- Run in the browser
- Can use React hooks
- Interactive features
- State management

**Example:**

```tsx
// Server Component (default)
async function JobsPage() {
  const jobs = await getAllJobsAction({});
  return <JobsList initialJobs={jobs} />;
}

// Client Component
("use client");
function JobsList({ initialJobs }) {
  const [jobs, setJobs] = useState(initialJobs);
  // ... interactive logic
}
```

---

### 2. React Query (TanStack Query)

**Purpose:** Server state management and data fetching.

**Key Features:**

- Automatic caching
- Background refetching
- Loading and error states
- Optimistic updates

**Usage Pattern:**

```tsx
const { data, isPending, error } = useQuery({
  queryKey: ["jobs", search, status, page],
  queryFn: () => getAllJobsAction({ search, status, page }),
});
```

**Query Keys:**

- Unique identifiers for cached data
- Changing key triggers new fetch
- Example: `['jobs', 'engineer', 'pending', 1]`

**Hydration:**

- Server pre-fetches data
- Data is "hydrated" into client cache
- No loading spinner on initial load

---

### 3. Server Actions

**Purpose:** Server-side functions called from client components.

**Benefits:**

- No API routes needed
- Type-safe
- Automatic serialization
- Built-in error handling

**Usage:**

```tsx
"use client";
import { createJobAction } from "@/utils/actions";

function Form() {
  const handleSubmit = async (data) => {
    const result = await createJobAction(data);
    // Handle result
  };
}
```

---

### 4. Prisma ORM

**Purpose:** Type-safe database access.

**Key Features:**

- TypeScript types generated from schema
- Type-safe queries
- Migrations
- Database introspection

**Usage:**

```typescript
// Query
const jobs = await prisma.job.findMany({
  where: { clerkId: userId },
  orderBy: { createdAt: 'desc' },
});

// Create
const job = await prisma.job.create({
  data: { position: "Engineer", company: "Tech Corp", ... },
});
```

---

### 5. Authentication with Clerk

**Purpose:** User authentication and session management.

**Features:**

- Pre-built UI components
- Social login options
- Session management
- User metadata

**Usage:**

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = auth();
if (!userId) redirect("/");
```

---

## 🔄 Reusable Components

### How to Reuse Components in Other Projects

#### 1. **Button Component**

**Location:** `components/ui/button.tsx`

**Reusability:**

- Copy `components/ui/button.tsx`
- Copy `lib/utils.ts` (for `cn` function)
- Install dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`

**Usage:**

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="sm">Click me</Button>
<Button variant="outline" size="lg">Outline</Button>
<Button variant="destructive">Delete</Button>
```

---

#### 2. **Form Components**

**Location:** `components/ui/form.tsx`, `components/ui/input.tsx`

**Reusability:**

- Copy form components from `components/ui/`
- Install: `react-hook-form`, `@hookform/resolvers`, `zod`
- Use with React Hook Form and Zod

**Usage:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  );
}
```

---

#### 3. **DownloadDropdown Component**

**Reusability:**

- Can be adapted for any data export needs
- Change `getAllJobsForDownloadAction` to your data fetching function
- Modify CSV/Excel generation logic for your data structure

**Adaptation Example:**

```tsx
// Change data source
const handleDownloadCSV = async () => {
  const data = await getYourDataAction(); // Your action
  downloadAsCSV(data);
};

// Modify CSV generation
const downloadAsCSV = (data: YourDataType[]) => {
  let csvContent = "Column1,Column2,Column3\n";
  data.forEach((item) => {
    csvContent += `${item.field1},${item.field2},${item.field3}\n`;
  });
  // ... rest of download logic
};
```

---

#### 4. **StatsCard Component**

**Reusability:**

- Generic card component for displaying statistics
- Can be used for any numeric data display

**Usage:**

```tsx
import StatsCard from '@/components/StatsCard';

<StatsCard title="Total Users" value={150} />
<StatsCard title="Active Sessions" value={45} />
```

---

## 💻 Code Examples

### Example 1: Creating a New Job

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobAction } from "@/utils/actions";
import { createAndEditJobSchema, CreateAndEditJobType } from "@/utils/types";

function CreateJobForm() {
  const form = useForm<CreateAndEditJobType>({
    resolver: zodResolver(createAndEditJobSchema),
  });

  const onSubmit = async (data: CreateAndEditJobType) => {
    const result = await createJobAction(data);
    if (result) {
      // Success - redirect or show toast
      router.push("/jobs");
    } else {
      // Error - show error message
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
    </Form>
  );
}
```

---

### Example 2: Fetching Data with React Query

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllJobsAction } from "@/utils/actions";

function JobsList() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const status = searchParams.get("jobStatus") || "all";
  const page = Number(searchParams.get("page")) || 1;

  const { data, isPending, error } = useQuery({
    queryKey: ["jobs", search, status, page],
    queryFn: () => getAllJobsAction({ search, jobStatus: status, page }),
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error loading jobs</div>;

  return (
    <div>
      {data?.jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

---

### Example 3: Server-Side Data Prefetching

```tsx
// app/jobs/page.tsx (Server Component)
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getAllJobsAction } from "@/utils/actions";
import JobsList from "@/components/JobsList";

async function JobsPage() {
  const queryClient = new QueryClient();

  // Prefetch data on server
  await queryClient.prefetchQuery({
    queryKey: ["jobs", "", "all", 1],
    queryFn: () => getAllJobsAction({}),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JobsList />
    </HydrationBoundary>
  );
}
```

---

### Example 4: Protected Route with Middleware

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/add-job",
  "/jobs(.*)",
  "/stats",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});
```

---

### Example 5: Server Action with Authentication

```typescript
// utils/actions.ts
"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "./db";

export async function createJobAction(values: CreateAndEditJobType) {
  // Authenticate user
  const { userId } = auth();
  if (!userId) {
    redirect("/");
  }

  // Validate and create
  const job = await prisma.job.create({
    data: {
      ...values,
      clerkId: userId,
    },
  });

  return job;
}
```

---

## 🏷 Keywords

**Frontend Technologies:**

- Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, Recharts, Lucide React

**Backend & Database:**

- Server Actions, Prisma, PostgreSQL, Clerk Authentication

**State Management:**

- TanStack Query (React Query), React Hooks

**Development Tools:**

- TypeScript, ESLint, Prisma Studio, React Query Devtools

**Features:**

- CRUD Operations, Search & Filter, Pagination, Data Export, Analytics, Dark Mode, Responsive Design

**Architecture:**

- Server-Side Rendering (SSR), Client-Side Rendering (CSR), Server Components, Client Components, Route Protection, Data Hydration

**Concepts:**

- Type Safety, Form Validation, Error Handling, Loading States, Optimistic Updates, Caching

---

## 🎓 Learning Resources

### Understanding the Tech Stack

1. **Next.js 14 App Router**

   - [Next.js Documentation](https://nextjs.org/docs)
   - [App Router Guide](https://nextjs.org/docs/app)

2. **React Query (TanStack Query)**

   - [React Query Documentation](https://tanstack.com/query/latest)
   - [React Query Tutorial](https://tanstack.com/query/latest/docs/react/overview)

3. **Prisma ORM**

   - [Prisma Documentation](https://www.prisma.io/docs)
   - [Prisma Getting Started](https://www.prisma.io/docs/getting-started)

4. **Clerk Authentication**

   - [Clerk Documentation](https://clerk.com/docs)
   - [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)

5. **shadcn/ui**

   - [shadcn/ui Documentation](https://ui.shadcn.com)
   - [Component Examples](https://ui.shadcn.com/docs/components)

6. **TypeScript**
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
   - [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Problem:** `Can't reach database server`

**Solutions:**

- Check DATABASE_URL in `.env.local`
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists

#### 2. Clerk Authentication Not Working

**Problem:** Redirects not working or authentication failing

**Solutions:**

- Verify Clerk keys in `.env.local`
- Check Clerk dashboard settings
- Ensure middleware is properly configured
- Clear browser cookies and try again

#### 3. Prisma Client Not Generated

**Problem:** `PrismaClient is not defined`

**Solutions:**

```bash
npx prisma generate
```

#### 4. Build Errors

**Problem:** Type errors or build failures

**Solutions:**

- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to generate Prisma Client
- Check TypeScript errors: `npm run lint`
- Clear `.next` folder and rebuild

#### 5. Environment Variables Not Loading

**Problem:** Variables are undefined

**Solutions:**

- Ensure file is named `.env.local` (not `.env`)
- Restart development server after adding variables
- Check variable names match exactly (case-sensitive)
- Verify `NEXT_PUBLIC_` prefix for client-side variables

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy after adding variables

### Other Platforms

**Railway:**

- Connect GitHub repository
- Add environment variables
- Railway auto-detects Next.js and deploys

**Netlify:**

- Connect GitHub repository
- Build command: `npm run build`
- Publish directory: `.next`
- Add environment variables

---

## 📝 Conclusion

Jobify is a comprehensive, production-ready job application tracker that demonstrates modern web development best practices. It showcases:

- **Full-Stack Development:** Server and client components working together
- **Type Safety:** End-to-end TypeScript coverage
- **Modern Patterns:** Server Actions, React Query, Prisma ORM
- **User Experience:** Responsive design, loading states, error handling
- **Security:** Authentication, user isolation, input validation
- **Performance:** Server-side rendering, data prefetching, caching

This project serves as an excellent learning resource for:

- Next.js 14 App Router
- TypeScript in React
- Database management with Prisma
- Authentication with Clerk
- State management with React Query
- Form handling with React Hook Form
- UI development with Tailwind CSS and shadcn/ui

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---

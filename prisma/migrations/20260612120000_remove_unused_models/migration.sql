-- Remove unused course models (no app code references). Job table unchanged.
DROP TABLE IF EXISTS "Task" CASCADE;
DROP TABLE IF EXISTS "Tour" CASCADE;
DROP TABLE IF EXISTS "Token" CASCADE;

-- Indexes for dashboard queries (clerkId filter + status filter + createdAt sort)
CREATE INDEX IF NOT EXISTS "Job_clerkId_idx" ON "Job"("clerkId");
CREATE INDEX IF NOT EXISTS "Job_clerkId_status_idx" ON "Job"("clerkId", "status");
CREATE INDEX IF NOT EXISTS "Job_clerkId_createdAt_idx" ON "Job"("clerkId", "createdAt" DESC);

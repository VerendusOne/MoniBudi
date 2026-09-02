-- Enable Row Level Security on every app table and revoke the default
-- Supabase anon/authenticated grants. This app does not use Supabase Auth
-- or the auto-generated PostgREST API at all — it connects to Postgres
-- directly via Prisma using the `postgres` role, which owns every table
-- here, so RLS never applies to it and this migration does not change how
-- the app talks to the database.
--
-- Without this, every table (including User, with password hashes, and all
-- financial data) was fully readable and writable by anyone holding the
-- project's public anon key via Supabase's REST API, with no RLS policy
-- and no application-level auth in front of it.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PayAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaySettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OvertimeRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OvertimeTier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PayPeriodEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExtraIncomeItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaxSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExpenseCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HiddenExpenseCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExpenseItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavingsItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MonthlySnapshot" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;

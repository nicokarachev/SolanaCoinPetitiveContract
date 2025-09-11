-- Phase A Database Testing: RLS Policy Fix
-- Execute these commands in your Supabase SQL Editor to allow Phase A testing

-- Option 1: Temporarily disable RLS for testing (RECOMMENDED FOR DEVELOPMENT)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Option 2: Create permissive policies for testing (if you want to keep RLS enabled)
-- Uncomment these if you prefer to keep RLS on but allow testing:

/*
-- Allow anonymous users to insert for testing
DROP POLICY IF EXISTS "Allow anonymous insert for testing" ON public.users;
CREATE POLICY "Allow anonymous insert for testing" ON public.users
FOR INSERT TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select for testing" ON public.users;
CREATE POLICY "Allow anonymous select for testing" ON public.users
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "Allow anonymous update for testing" ON public.users;
CREATE POLICY "Allow anonymous update for testing" ON public.users
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous delete for testing" ON public.users;
CREATE POLICY "Allow anonymous delete for testing" ON public.users
FOR DELETE TO anon
USING (true);

-- Similar policies for challenges table
DROP POLICY IF EXISTS "Allow anonymous insert for testing" ON public.challenges;
CREATE POLICY "Allow anonymous insert for testing" ON public.challenges
FOR INSERT TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select for testing" ON public.challenges;
CREATE POLICY "Allow anonymous select for testing" ON public.challenges
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "Allow anonymous update for testing" ON public.challenges;
CREATE POLICY "Allow anonymous update for testing" ON public.challenges
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous delete for testing" ON public.challenges;
CREATE POLICY "Allow anonymous delete for testing" ON public.challenges
FOR DELETE TO anon
USING (true);
*/

-- Verify the changes (FIXED QUERY)
SELECT 
    n.nspname as schema_name,
    c.relname as table_name, 
    c.relrowsecurity as row_security_enabled
FROM pg_class c 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE n.nspname = 'public' 
AND c.relkind = 'r' 
AND c.relname IN ('users', 'challenges', 'video_submissions', 'votes', 'chat_messages')
ORDER BY c.relname;

-- Note: After testing, you may want to re-enable RLS:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
-- etc... 
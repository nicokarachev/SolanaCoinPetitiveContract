-- Coinpetitive Database Schema for Supabase
-- Run this in your Supabase SQL Editor after creating your project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar TEXT,
    pubkey TEXT,
    x_profile TEXT,
    telegram TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE public.users ADD COLUMN name TEXT;
    END IF;
    
    -- Add avatar column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar') THEN
        ALTER TABLE public.users ADD COLUMN avatar TEXT;
    END IF;
    
    -- Add pubkey column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'pubkey') THEN
        ALTER TABLE public.users ADD COLUMN pubkey TEXT;
    END IF;
    
    -- Add x_profile column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'x_profile') THEN
        ALTER TABLE public.users ADD COLUMN x_profile TEXT;
    END IF;
    
    -- Add telegram column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'telegram') THEN
        ALTER TABLE public.users ADD COLUMN telegram TEXT;
    END IF;
END $$;

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    state TEXT DEFAULT 'active' CHECK (state IN ('active', 'completed', 'cancelled')),
    creator_id UUID REFERENCES public.users(id) NOT NULL,
    onchain_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to challenges table if they don't exist
DO $$ 
BEGIN
    -- Add reward column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'reward') THEN
        ALTER TABLE public.challenges ADD COLUMN reward DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add participation_fee column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'participation_fee') THEN
        ALTER TABLE public.challenges ADD COLUMN participation_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add voting_fee column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'voting_fee') THEN
        ALTER TABLE public.challenges ADD COLUMN voting_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add min_participants column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'min_participants') THEN
        ALTER TABLE public.challenges ADD COLUMN min_participants INTEGER DEFAULT 1;
    END IF;
    
    -- Add max_participants column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'max_participants') THEN
        ALTER TABLE public.challenges ADD COLUMN max_participants INTEGER;
    END IF;
    
    -- Add min_voters column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'min_voters') THEN
        ALTER TABLE public.challenges ADD COLUMN min_voters INTEGER;
    END IF;
    
    -- Add max_voters column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'max_voters') THEN
        ALTER TABLE public.challenges ADD COLUMN max_voters INTEGER;
    END IF;
    
    -- Add registration_end column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'registration_end') THEN
        ALTER TABLE public.challenges ADD COLUMN registration_end TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add submission_end column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'submission_end') THEN
        ALTER TABLE public.challenges ADD COLUMN submission_end TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add voting_end column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'voting_end') THEN
        ALTER TABLE public.challenges ADD COLUMN voting_end TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add image column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'image') THEN
        ALTER TABLE public.challenges ADD COLUMN image TEXT;
    END IF;
    
    -- Add challenge_video column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'challenge_video') THEN
        ALTER TABLE public.challenges ADD COLUMN challenge_video TEXT;
    END IF;
    
    -- Add keywords column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'keywords') THEN
        ALTER TABLE public.challenges ADD COLUMN keywords TEXT[];
    END IF;
    
    -- Add participants column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'participants') THEN
        ALTER TABLE public.challenges ADD COLUMN participants TEXT[];
    END IF;
END $$;

-- Video submissions table
CREATE TABLE IF NOT EXISTS public.video_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    votes INTEGER DEFAULT 0,
    voters TEXT[],
    likedBy TEXT[],
    dislikedBy TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.video_submissions(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id, voter_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id TEXT NOT NULL, -- This could be challenge_id or a separate chat room
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for challenges table
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.challenges;
CREATE POLICY "Anyone can view challenges" ON public.challenges
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create challenges" ON public.challenges;
CREATE POLICY "Users can create challenges" ON public.challenges
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own challenges" ON public.challenges;
CREATE POLICY "Users can update own challenges" ON public.challenges
    FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() IS NULL);

-- Create policies for video submissions
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.video_submissions;
CREATE POLICY "Anyone can view submissions" ON public.video_submissions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create submissions" ON public.video_submissions;
CREATE POLICY "Users can create submissions" ON public.video_submissions
    FOR INSERT WITH CHECK (auth.uid() = participant_id);

DROP POLICY IF EXISTS "Users can update own submissions" ON public.video_submissions;
CREATE POLICY "Users can update own submissions" ON public.video_submissions
    FOR UPDATE USING (auth.uid() = participant_id);

-- Create policies for votes
DROP POLICY IF EXISTS "Anyone can view votes" ON public.votes;
CREATE POLICY "Anyone can view votes" ON public.votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create votes" ON public.votes;
CREATE POLICY "Users can create votes" ON public.votes
    FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Create policies for chat messages
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create chat messages" ON public.chat_messages;
CREATE POLICY "Users can create chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing users if they don't have profiles
-- Use a more robust approach to handle conflicts
DO $$
DECLARE
    auth_user RECORD;
    new_username TEXT;
    counter INTEGER;
BEGIN
    FOR auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
    LOOP
        -- Generate a unique username
        new_username := COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1));
        counter := 0;
        
        -- Keep trying until we find a unique username
        WHILE EXISTS (SELECT 1 FROM public.users WHERE username = new_username) LOOP
            counter := counter + 1;
            new_username := COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)) || '_' || counter;
        END LOOP;
        
        -- Insert the user with unique username
        INSERT INTO public.users (id, email, username)
        VALUES (auth_user.id, auth_user.email, new_username)
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Create some sample data for testing (only insert basic columns that exist)
INSERT INTO public.challenges (title, description, category, creator_id) 
SELECT 
    'Sample Challenge',
    'This is a sample challenge for testing purposes',
    'fitness',
    u.id
FROM public.users u 
LIMIT 1
ON CONFLICT DO NOTHING; 
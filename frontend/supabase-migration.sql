-- Migration script to add missing columns to existing Supabase database
-- Run this in your Supabase SQL Editor

-- First, let's check if the users table exists and what columns it has
-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
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

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

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
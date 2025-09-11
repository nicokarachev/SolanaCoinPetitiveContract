-- Safe User Cleanup Script for Supabase Testing
-- This script helps clean up users safely without breaking foreign key constraints

-- 1. FIND ORPHANED USERS (users in public.users but not in auth.users)
SELECT 
    u.id,
    u.email,
    u.username,
    'ORPHANED: In public.users but not in auth.users' as status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- 2. FIND MISSING PROFILES (users in auth.users but not in public.users)
SELECT 
    au.id,
    au.email,
    'MISSING PROFILE: In auth.users but not in public.users' as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- 3. SAFE DELETION PROCESS FOR A SPECIFIC USER
-- Replace 'javaeddie84@gmail.com' with the email you want to delete

-- Step 3a: Delete related data first (to avoid foreign key constraint errors)
DO $$
DECLARE
    user_id_to_delete UUID;
    user_email TEXT := 'javaeddie84@gmail.com'; -- Change this email as needed
BEGIN
    -- Get the user ID from either table
    SELECT COALESCE(u.id, au.id) INTO user_id_to_delete
    FROM public.users u
    FULL OUTER JOIN auth.users au ON u.id = au.id
    WHERE COALESCE(u.email, au.email) = user_email;
    
    IF user_id_to_delete IS NOT NULL THEN
        RAISE NOTICE 'Deleting user: % (ID: %)', user_email, user_id_to_delete;
        
        -- Delete related data in correct order (children first, then parents)
        
        -- 1. Delete votes
        DELETE FROM public.votes WHERE voter_id = user_id_to_delete;
        RAISE NOTICE 'Deleted votes for user';
        
        -- 2. Delete chat messages
        DELETE FROM public.chat_messages WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'Deleted chat messages for user';
        
        -- 3. Delete video submissions
        DELETE FROM public.video_submissions WHERE participant_id = user_id_to_delete;
        RAISE NOTICE 'Deleted video submissions for user';
        
        -- 4. Delete challenges created by user (this will cascade to related data)
        DELETE FROM public.challenges WHERE creator_id = user_id_to_delete;
        RAISE NOTICE 'Deleted challenges created by user';
        
        -- 5. Remove user from participants arrays in challenges
        UPDATE public.challenges 
        SET participants = array_remove(participants, user_id_to_delete::text)
        WHERE participants @> ARRAY[user_id_to_delete::text];
        RAISE NOTICE 'Removed user from challenge participants';
        
        -- 6. Delete from public.users table
        DELETE FROM public.users WHERE id = user_id_to_delete;
        RAISE NOTICE 'Deleted user profile';
        
        -- 7. Delete from auth.users (this requires admin privileges)
        -- Note: This might not work from SQL editor, you may need to use Supabase dashboard
        -- DELETE FROM auth.users WHERE id = user_id_to_delete;
        
        RAISE NOTICE 'User cleanup completed. You may need to delete from auth.users via Supabase dashboard.';
    ELSE
        RAISE NOTICE 'User % not found', user_email;
    END IF;
END $$;

-- 4. CLEANUP ALL ORPHANED USERS (use with caution!)
-- Uncomment the block below only if you want to clean up ALL orphaned users

/*
DO $$
DECLARE
    orphaned_user RECORD;
BEGIN
    FOR orphaned_user IN 
        SELECT u.id, u.email
        FROM public.users u
        LEFT JOIN auth.users au ON u.id = au.id
        WHERE au.id IS NULL
    LOOP
        RAISE NOTICE 'Cleaning up orphaned user: %', orphaned_user.email;
        
        -- Delete related data
        DELETE FROM public.votes WHERE voter_id = orphaned_user.id;
        DELETE FROM public.chat_messages WHERE user_id = orphaned_user.id;
        DELETE FROM public.video_submissions WHERE participant_id = orphaned_user.id;
        DELETE FROM public.challenges WHERE creator_id = orphaned_user.id;
        
        -- Remove from participants arrays
        UPDATE public.challenges 
        SET participants = array_remove(participants, orphaned_user.id::text)
        WHERE participants @> ARRAY[orphaned_user.id::text];
        
        -- Delete user profile
        DELETE FROM public.users WHERE id = orphaned_user.id;
        
        RAISE NOTICE 'Cleaned up orphaned user: %', orphaned_user.email;
    END LOOP;
END $$;
*/

-- 5. CREATE MISSING PROFILES FOR AUTH USERS
-- This creates basic profiles for auth users who don't have public.users records

DO $$
DECLARE
    auth_user RECORD;
    new_username TEXT;
    counter INTEGER;
BEGIN
    FOR auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.users u ON au.id = u.id
        WHERE u.id IS NULL
    LOOP
        -- Generate unique username
        new_username := COALESCE(
            auth_user.raw_user_meta_data->>'username',
            split_part(auth_user.email, '@', 1)
        );
        
        counter := 0;
        WHILE EXISTS (SELECT 1 FROM public.users WHERE username = new_username) LOOP
            counter := counter + 1;
            new_username := COALESCE(
                auth_user.raw_user_meta_data->>'username',
                split_part(auth_user.email, '@', 1)
            ) || '_' || counter;
        END LOOP;
        
        -- Create the missing profile
        INSERT INTO public.users (id, email, username)
        VALUES (auth_user.id, auth_user.email, new_username)
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created missing profile for: %', auth_user.email;
    END LOOP;
END $$; 
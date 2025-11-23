-- Check if username column exists and has data
SELECT 
  id,
  full_name,
  username,
  role,
  email
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- Check if any users are missing usernames
SELECT 
  COUNT(*) as users_without_username
FROM public.user_profiles
WHERE username IS NULL;

# Fix Google OAuth Redirect URL

## Problem
When clicking "Sign in with Google", you see:
```
Choose an account to continue to xdzoikocriuvgkoenjqk.supabase.co
```

This shows the Supabase URL instead of your greenofig.com domain.

---

## Solution: Configure Redirect URL in Supabase

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: **greenofig**

### Step 2: Configure Site URL
1. Click **"Authentication"** in left sidebar
2. Click **"URL Configuration"** tab
3. Set **Site URL** to: `https://greenofig.com`
4. Click **"Save"**

### Step 3: Add Redirect URLs
1. In the same page, find **"Redirect URLs"** section
2. Add these URLs (one per line):
   ```
   https://greenofig.com
   https://greenofig.com/app
   https://greenofig.com/app/user
   https://greenofig.com/login
   https://greenofig.com/signup
   http://localhost:5173
   http://localhost:5173/**
   ```
3. Click **"Save"**

### Step 4: Configure Google OAuth Provider
1. Still in **Authentication** section
2. Click **"Providers"** tab
3. Find **"Google"** and click to expand
4. Make sure it's **enabled**
5. Check that **Authorized redirect URIs** includes:
   ```
   https://xdzoikocriuvgkoenjqk.supabase.co/auth/v1/callback
   ```

---

## After Configuration:

1. **Hard refresh** your website (Ctrl+Shift+R)
2. Click **"Sign in with Google"**
3. Should now show: "Choose an account to continue to **greenofig.com**" ✅
4. After login, should redirect to: `https://greenofig.com/app/user`

---

## If Still Shows Supabase URL:

The redirect URL is also set in the code. Check:

**File**: `src/contexts/SupabaseAuthContext.jsx` (line ~153)

```javascript
const redirectTo = `${window.location.origin}/app`;
```

This should automatically use your domain when deployed!

---

## Testing Locally:

When testing on localhost:
- Site URL: `http://localhost:5173`
- Redirect URL: `http://localhost:5173/app`

When deployed:
- Site URL: `https://greenofig.com`
- Redirect URL: `https://greenofig.com/app`

✅ **Configure these in Supabase and Google OAuth will work correctly!**

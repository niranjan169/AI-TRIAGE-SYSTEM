# 🔑 How to Get Your Supabase Credentials

## The Issue

The key you pasted (`sb_publishable_...`) is **NOT** the correct key format. You need the **anon/public key** which starts with `eyJ...`

## ✅ Correct Steps to Get Your Keys

### 1. Go to Supabase Dashboard
Visit: https://supabase.com/dashboard

### 2. Select Your Project
Click on your project: **lkgxijbsdspuygatamdq**

### 3. Navigate to API Settings
- Click on **Settings** (gear icon in left sidebar)
- Click on **API**

### 4. Copy the Correct Keys

You'll see two important values:

#### Project URL
```
https://lkgxijbsdspuygatamdq.supabase.co
```
✅ This one is CORRECT!

#### anon public Key
Look for a key that starts with `eyJ...` (NOT `sb_publishable_...`)

It should look something like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

### 5. Paste in supabase.js

Open `src/lib/supabase.js` and replace:

```javascript
const supabaseUrl = 'https://lkgxijbsdspuygatamdq.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE';  // ⚠️ Paste the eyJ... key here
```

## 🎯 What Each Key Does

### ❌ WRONG Key (what you pasted)
```
sb_publishable_nW-HyRdNla7Ft_9JwCPalA_VxiIh3qg
```
This is a **publishable key** - NOT used for Supabase client initialization.

### ✅ CORRECT Key (what you need)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
This is the **anon/public key** - used for client-side Supabase operations.

## 🚀 Current Status

**The app is running in DEMO MODE** because the key is incorrect.

### What Works in Demo Mode:
✅ All UI features
✅ AI triage analysis
✅ Form submissions
✅ Appointment scheduling
✅ Admin dashboard
✅ Queue management

### What Doesn't Work:
❌ Data persistence (refreshing page loses data)
❌ Real file uploads
❌ Real-time updates
❌ Cross-device data sync

## 📝 Quick Fix

1. Open browser console (F12)
2. You'll see: `⚠️ Running in DEMO MODE - No database connection`
3. Follow the instructions above to get the correct key
4. Paste it in `src/lib/supabase.js`
5. Save the file
6. The app will automatically reload with database features enabled!

## 🎉 After Fixing

Once you paste the correct key:
- Data will persist in Supabase database
- Files will upload to Supabase storage
- Real-time updates will work
- You can access data from any device

## Need Help?

Check the Supabase documentation:
https://supabase.com/docs/guides/api/api-keys

The key you need is in the **"Project API keys"** section, labeled as **"anon public"**.

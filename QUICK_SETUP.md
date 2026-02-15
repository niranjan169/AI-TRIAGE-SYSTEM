# 🚀 QUICK SETUP GUIDE - 3 STEPS

## ✅ Step 1: Database Tables (2 minutes)

1. **Go to Supabase SQL Editor:**
   - Open: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql
   
2. **Run the SQL:**
   - Open the file: `SETUP_DATABASE.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter)
   
3. **Verify:**
   - You should see: "Success. No rows returned"
   - Go to Table Editor - you'll see `assessments` and `appointments` tables

---

## ✅ Step 2: Storage Bucket (1 minute)

1. **Go to Storage:**
   - Open: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/storage/buckets
   
2. **Create Bucket:**
   - Click **"New bucket"**
   - Name: `medical-documents`
   - **Make it PUBLIC** ✅ (toggle the switch)
   - Click **"Create bucket"**

3. **Verify:**
   - You should see `medical-documents` in the bucket list

---

## ✅ Step 3: Test the App!

1. **Refresh your app:** http://localhost:5174

2. **Check console:**
   - Press F12 → Console tab
   - Should see: `✅ Supabase database connected`

3. **Test complete flow:**
   - Go to Patient Dashboard
   - Click "Begin Assessment"
   - Fill the form (name, age, gender, symptoms)
   - Upload a file
   - Submit for AI Analysis
   - See results
   - Schedule appointment
   - **It should work!** ✅

4. **Check Admin Dashboard:**
   - Click "Admin" in navigation
   - You should see your appointment in the queue!

5. **Verify in Supabase:**
   - Go to Table Editor
   - Check `assessments` table - your data is there!
   - Check `appointments` table - your appointment is there!

---

## 🐛 If You Still Get Errors:

### Error: "relation does not exist"
- **Fix:** Run the SQL script again in Step 1

### Error: "storage bucket not found"
- **Fix:** Create the bucket in Step 2

### Error: "permission denied"
- **Fix:** The RLS policies should allow everything. Check if they were created.

### Check Browser Console:
1. Press F12
2. Go to Console tab
3. Look for error messages
4. Share the error with me if needed

---

## 📊 What Gets Created:

### Tables:
- ✅ `assessments` - Stores patient assessments and AI results
- ✅ `appointments` - Stores scheduled appointments

### Indexes:
- ✅ Fast patient lookups
- ✅ Fast queue queries
- ✅ Fast status filtering

### Security:
- ✅ RLS enabled (but permissive for demo)
- ✅ All operations allowed

### Realtime:
- ✅ Live queue updates enabled

### Storage:
- ✅ `medical-documents` bucket for file uploads

---

## 🎉 After Setup:

**Your app will have:**
- ✅ Persistent data (survives refresh)
- ✅ Real file uploads to cloud
- ✅ Real-time queue updates
- ✅ Multi-device sync
- ✅ Production-ready database

**Total setup time: ~3 minutes!**

---

## 💡 Quick Links:

- **SQL Editor:** https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql
- **Storage:** https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/storage/buckets
- **Table Editor:** https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor
- **API Settings:** https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/settings/api

---

**Ready? Let's do this!** 🚀

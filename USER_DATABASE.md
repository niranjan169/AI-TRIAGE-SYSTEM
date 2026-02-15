# 🗄️ USER DATABASE SETUP

## ✅ What's New:

User authentication now uses **Supabase database** instead of just localStorage!

---

## 📊 Users Table Structure:

```sql
users
├── id (UUID, Primary Key)
├── email (TEXT, Unique)
├── password (TEXT)
├── name (TEXT)
├── role (TEXT: 'patient' or 'admin')
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── last_login (TIMESTAMP)
```

---

## 🚀 Setup Steps:

### **Step 1: Create Users Table**

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql
   ```

2. **Copy SQL from:** `CREATE_USERS_TABLE.sql`

3. **Paste and click RUN**

4. **You'll see:**
   - Table structure displayed
   - Success message
   - 2 demo accounts created

### **Step 2: Test the App**

1. **Refresh your app:** http://localhost:5174

2. **Try demo accounts:**
   - **Patient:** patient@demo.com / patient123
   - **Admin:** admin@demo.com / admin123

3. **Or register new account** - it will save to database!

---

## 🎯 How It Works:

### **Demo Mode (No Database):**
If Supabase is not connected:
- Uses localStorage
- Same as before

### **Database Mode (Supabase Connected):**
If Supabase is connected:
- Saves to `users` table
- Queries database for login
- Updates `last_login` timestamp
- Persistent across devices

---

## 🔐 Authentication Flow:

### **Register:**
```
1. User fills form
2. Check if email exists in database
3. If not, insert new user
4. Show success message
5. Switch to login mode
```

### **Login:**
```
1. User enters credentials
2. Query database for matching email/password
3. Verify role matches
4. Update last_login timestamp
5. Create session
6. Redirect to dashboard
```

---

## 📋 Demo Accounts Created:

### **Patient Account:**
- Email: patient@demo.com
- Password: patient123
- Role: patient
- Name: Demo Patient

### **Admin Account:**
- Email: admin@demo.com
- Password: admin123
- Role: admin
- Name: Demo Admin

---

## 🔍 Verify in Supabase:

1. **Go to Table Editor:**
   ```
   https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor
   ```

2. **Click on `users` table**

3. **You'll see:**
   - All registered users
   - Their roles
   - Creation dates
   - Last login times

---

## 🎨 Features:

### **User Registration:**
✅ Email uniqueness check
✅ Saves to database
✅ Auto-generates UUID
✅ Timestamps creation

### **User Login:**
✅ Email/password verification
✅ Role verification
✅ Updates last_login
✅ Creates session

### **User Management:**
✅ Get all users (admin)
✅ Update user info
✅ Delete users
✅ Search by email

---

## 📁 Files Created:

- **`CREATE_USERS_TABLE.sql`** - SQL to create users table
- **`src/services/auth.js`** - Authentication service
- **`USER_DATABASE.md`** - This documentation

### **Files Modified:**
- **`src/pages/Login.jsx`** - Now uses auth service

---

## 🧪 Test It:

### **Test 1: Register New User**
1. Go to login page
2. Click "Register"
3. Fill in details
4. Click "Create Account"
5. **Check Supabase** - user should be in database!

### **Test 2: Login with Database User**
1. Use demo account: patient@demo.com / patient123
2. Click "Sign In"
3. **Check Supabase** - last_login should update!

### **Test 3: Duplicate Email**
1. Try to register with patient@demo.com
2. **Expected:** Error "Email already registered"

---

## 🔒 Security Notes:

**Current Implementation:**
- ⚠️ Passwords stored in plain text
- ⚠️ No encryption
- ✅ Perfect for demo/hackathon

**For Production:**
- Use Supabase Auth (built-in)
- Hash passwords (bcrypt)
- Add email verification
- Use JWT tokens
- Enable RLS policies

---

## ✅ What Works:

1. ✅ **Database storage** - Users saved to Supabase
2. ✅ **Dual mode** - Works with or without database
3. ✅ **Email uniqueness** - No duplicate accounts
4. ✅ **Role verification** - Checks role on login
5. ✅ **Last login tracking** - Updates timestamp
6. ✅ **Demo accounts** - Pre-populated for testing

---

## 🎯 Benefits:

**Before (localStorage only):**
- ❌ Data lost on browser clear
- ❌ Not shared across devices
- ❌ No admin visibility

**Now (Supabase database):**
- ✅ Persistent storage
- ✅ Works across devices
- ✅ Admin can see all users
- ✅ Proper user management

---

**Your authentication system is now database-backed!** 🗄️✨

**Run that SQL and test it!** 🚀

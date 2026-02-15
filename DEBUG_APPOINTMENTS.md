# 🔍 DEBUGGING USER-SPECIFIC APPOINTMENTS

## ✅ What I Fixed:

Added **detailed console logging** to track exactly what's happening with appointment filtering.

---

## 🧪 How to Debug:

### **Step 1: Open Browser Console**
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Clear console (trash icon)

### **Step 2: Login and Check Logs**

**When you login, you should see:**
```
👤 Logged-in user: Demo Patient
📧 Patient ID set to: patient@demo.com
```

### **Step 3: Go to Patient Dashboard**

**You should see these logs:**
```
📊 Fetching appointments for patient: patient@demo.com
🔍 getAppointments called with filters: {patientId: "patient@demo.com"}
```

**Then either:**

**If using Supabase (Database Mode):**
```
🗄️ DATABASE MODE: Querying Supabase
🔎 Adding patient_id filter: patient@demo.com
✅ Database returned appointments: 2
📋 Total appointments found: 2
```

**If using Demo Mode (localStorage):**
```
🎮 DEMO MODE: Using mock storage
📦 Total mock appointments: 5
🔎 Filtering by patient_id: patient@demo.com
  - Appointment mock_123: patient_id="patient@demo.com" matches=true
  - Appointment mock_456: patient_id="admin@demo.com" matches=false
  - Appointment mock_789: patient_id="patient@demo.com" matches=true
✅ Filtered results: 2
📋 Returning appointments: 2
```

**Finally:**
```
⏰ Upcoming appointments: 2
✅ Past appointments: 0
```

---

## 🔍 What to Look For:

### **Problem 1: Showing All Users' Appointments**

**Bad logs:**
```
📊 Fetching appointments for patient: patient@demo.com
🔍 getAppointments called with filters: {patientId: "patient@demo.com"}
📦 Total mock appointments: 10
✅ Filtered results: 10  ❌ WRONG! Should be less
```

**This means:** Filtering is NOT working

**Solution:** Check if `patient_id` in database matches the email exactly

---

### **Problem 2: No Appointments Showing**

**Bad logs:**
```
📊 Fetching appointments for patient: patient@demo.com
🔍 getAppointments called with filters: {patientId: "patient@demo.com"}
📦 Total mock appointments: 5
🔎 Filtering by patient_id: patient@demo.com
  - Appointment mock_123: patient_id="patient_1234567890" matches=false
  - Appointment mock_456: patient_id="patient_9876543210" matches=false
✅ Filtered results: 0  ❌ WRONG! Old patient IDs
```

**This means:** Old appointments have random patient IDs, not emails

**Solution:** Create new appointments after login

---

### **Problem 3: Wrong User's Appointments**

**Bad logs:**
```
👤 Logged-in user: Demo Patient
📧 Patient ID set to: patient@demo.com
📊 Fetching appointments for patient: undefined  ❌ WRONG!
```

**This means:** User not loaded yet

**Solution:** Already fixed with useEffect

---

## ✅ Expected Flow:

### **User 1 (patient@demo.com):**
1. Login
2. Console shows: `Patient ID set to: patient@demo.com`
3. Create assessment
4. Appointment saved with `patient_id: "patient@demo.com"`
5. Dashboard shows: `Filtered results: 1`
6. See YOUR appointment

### **User 2 (admin@demo.com):**
1. Login
2. Console shows: `Patient ID set to: admin@demo.com`
3. Create assessment
4. Appointment saved with `patient_id: "admin@demo.com"`
5. Dashboard shows: `Filtered results: 1`
6. See ONLY YOUR appointment (not User 1's)

---

## 🧪 Test Steps:

### **Test 1: Create Fresh Appointments**

1. **Clear old data:**
   ```javascript
   // In browser console:
   localStorage.clear()
   ```

2. **Refresh page**

3. **Login as:** patient@demo.com

4. **Create assessment**

5. **Check console:**
   ```
   Patient ID (Email): patient@demo.com
   Patient Name: Demo Patient
   ```

6. **Go to dashboard**

7. **Check console:**
   ```
   Filtered results: 1  ✅ Correct!
   ```

### **Test 2: Different User**

1. **Logout**

2. **Login as:** admin@demo.com

3. **Check dashboard**

4. **Console should show:**
   ```
   Filtering by patient_id: admin@demo.com
   Filtered results: 0  ✅ Correct! (admin has no appointments yet)
   ```

5. **Create assessment as admin**

6. **Dashboard shows:**
   ```
   Filtered results: 1  ✅ Correct!
   ```

7. **Logout and login as patient@demo.com again**

8. **Dashboard should STILL show:**
   ```
   Filtered results: 1  ✅ Correct! (only patient's appointment)
   ```

---

## 🔧 If Still Showing All Appointments:

### **Check Database:**

1. **Go to Supabase:**
   https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor

2. **Click `appointments` table**

3. **Check `patient_id` column:**
   - Should be emails: `patient@demo.com`, `admin@demo.com`
   - NOT random IDs: `patient_1234567890`

4. **If you see random IDs:**
   - Delete those rows
   - Create new appointments after logging in
   - New ones will have email as patient_id

---

## 📋 Console Commands:

### **Check Current User:**
```javascript
JSON.parse(localStorage.getItem('user'))
```

### **Check Patient ID:**
```javascript
localStorage.getItem('patientId')
```

### **Clear All Data:**
```javascript
localStorage.clear()
location.reload()
```

---

## ✅ What Should Happen:

**Correct Behavior:**
- User 1 sees ONLY their appointments
- User 2 sees ONLY their appointments
- No overlap
- Console shows correct filtering

**Console Output:**
```
👤 Logged-in user: Demo Patient
📧 Patient ID set to: patient@demo.com
📊 Fetching appointments for patient: patient@demo.com
🔍 getAppointments called with filters: {patientId: "patient@demo.com"}
🗄️ DATABASE MODE: Querying Supabase
🔎 Adding patient_id filter: patient@demo.com
✅ Database returned appointments: 2
📋 Total appointments found: 2
⏰ Upcoming appointments: 2
✅ Past appointments: 0
```

---

**Now check your console and tell me what you see!** 🔍

The logs will show us exactly what's happening and why you're seeing other users' appointments.
